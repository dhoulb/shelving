import { SQL } from "bun";
import type { Collection } from "../db/collection/Collection.js";
import { PostgreSQLProvider, type SQLFragment } from "../db/index.js";
import type { DBProvider } from "../db/provider/DBProvider.js";
import { UnsupportedError } from "../error/UnsupportedError.js";
import type { ImmutableArray } from "../util/array.js";
import { getDelay } from "../util/async.js";
import type { Data } from "../util/data.js";
import type { Identifier, Item } from "../util/item.js";
import type { Query } from "../util/query.js";
import { getRandom } from "../util/random.js";

// Constants.
const TRANSACTION_ATTEMPTS = 5;
const RETRYABLE_SQLSTATES = ["40001", "40P01"]; // Serialization failure and deadlock.

/**
 * PostgreSQL database provider backed by Bun's built-in `Bun.SQL` driver.
 *
 * Implements the `PostgreSQLProvider` SQL abstraction by executing tagged-template queries against a `Bun.SQL` connection.
 * - Identifiers are escaped through `Bun.SQL`'s own `sql()` helper rather than naive string quoting, which is more secure.
 * - Supports transactions via `transact()` — the callback runs in a `SERIALIZABLE` Postgres transaction, and contention aborts are retried automatically.
 * - Requires the `bun` peer dependency and a running Bun environment.
 *
 * @see https://shelving.cc/bun/BunPostgresProvider
 */
export class BunPostgresProvider<I extends Identifier = Identifier, T extends Data = Data> extends PostgreSQLProvider<I, T> {
	private _sql: SQL;

	constructor(sql: SQL) {
		super();
		this._sql = sql;
	}

	/** Flattens nested `SQLFragment` values into a single flat query, since `Bun.SQL` would otherwise bind them as `$n` parameters. */
	override exec<X extends Data>(strings: TemplateStringsArray, ...values: ImmutableArray<unknown>): Promise<ImmutableArray<X>> {
		const flat = _flattenSQL(strings, values);
		return this._sql(_getTemplateStrings(flat.strings), ...flat.values);
	}

	/** Escapes the identifier via `Bun.SQL`'s first-class `sql()` wrapping rather than manual quoting, which is more secure. */
	override sqlIdentifier(name: string): SQLFragment {
		return this.sql`${this._sql(name)}`;
	}

	/** Coerces the count to a number, since `Bun.SQL` returns Postgres's 64-bit `COUNT(*)` as a string. */
	override async countQuery<II extends I, TT extends T>(
		collection: Collection<string, II, TT>,
		query?: Query<Item<II, TT>>,
	): Promise<number> {
		return Number.parseInt((await super.countQuery(collection, query)).toString(), 10);
	}

	/**
	 * Runs the callback in a `SERIALIZABLE` Postgres transaction via `Bun.SQL`'s `begin()` — resolving commits, throwing rolls back and rethrows.
	 * - Retries the whole callback (up to 5 attempts, with jittered exponential backoff) when Postgres aborts it for contention (serialization failure or deadlock), so the callback must have no side effects other than through its provider.
	 */
	override async transact<X>(callback: (provider: DBProvider<I, T>) => Promise<X>): Promise<X> {
		let aborted: unknown;
		for (let attempt = 0; attempt < TRANSACTION_ATTEMPTS; attempt++) {
			// Back off with jitter before each retry so contending transactions de-synchronise instead of re-aborting each other in lockstep.
			if (attempt) await getDelay(getRandom(0, 100 * 2 ** attempt));
			try {
				return await this._sql.begin("isolation level serializable", tx => callback(new _BunPostgresTransaction<I, T>(tx)));
			} catch (thrown) {
				if (!_isRetryableError(thrown)) throw thrown;
				aborted = thrown; // Retry the transaction after contention.
			}
		}
		throw aborted;
	}
}

/** Transaction-scoped provider for `BunPostgresProvider.transact()` — every query runs on the transaction's reserved connection. */
class _BunPostgresTransaction<I extends Identifier, T extends Data> extends BunPostgresProvider<I, T> {
	/** Not supported inside a transaction — always throws `UnsupportedError`. */
	override transact<X>(callback: (provider: DBProvider<I, T>) => Promise<X>): Promise<X> {
		throw new UnsupportedError("BunPostgresProvider does not support nested transactions", {
			provider: this,
			received: callback,
			caller: this.transact,
		});
	}
}

/** Is a thrown value a Postgres contention abort that a fresh transaction attempt may resolve? */
function _isRetryableError(thrown: unknown): boolean {
	return thrown instanceof SQL.PostgresError && RETRYABLE_SQLSTATES.includes(thrown.errno ?? thrown.code);
}

/** Is a value an `SQLFragment` produced by the provider's `sql*` builders (rather than a bindable parameter)? */
function _isSQLFragment(value: unknown): value is SQLFragment {
	return (
		!!value &&
		typeof value === "object" &&
		"strings" in value &&
		"values" in value &&
		Array.isArray(value.strings) &&
		Array.isArray(value.values) &&
		value.strings.length === value.values.length + 1
	);
}

/** Flatten nested `SQLFragment` values into one flat strings/values pair, leaving other values (parameters and `Bun.SQL` identifier helpers) to interpolate normally. */
function _flattenSQL(strings: ImmutableArray<string>, values: ImmutableArray<unknown>): { strings: string[]; values: unknown[] } {
	const outStrings: string[] = [strings[0] ?? ""];
	const outValues: unknown[] = [];
	values.forEach((value, i) => {
		if (_isSQLFragment(value)) {
			const nested = _flattenSQL(value.strings, value.values);
			outStrings[outStrings.length - 1] += nested.strings[0] ?? "";
			for (let n = 0; n < nested.values.length; n++) {
				outValues.push(nested.values[n]);
				outStrings.push(nested.strings[n + 1] ?? "");
			}
		} else {
			outValues.push(value);
			outStrings.push("");
		}
		outStrings[outStrings.length - 1] += strings[i + 1] ?? "";
	});
	return { strings: outStrings, values: outValues };
}

/** Convert a plain strings array into the `TemplateStringsArray` shape `Bun.SQL` expects. */
function _getTemplateStrings(strings: string[]): TemplateStringsArray {
	return Object.assign(strings, { raw: strings }) as unknown as TemplateStringsArray;
}
