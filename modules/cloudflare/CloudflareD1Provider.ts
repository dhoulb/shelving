import { SQLiteProvider } from "../db/provider/SQLiteProvider.js";
import type { SQLFragment } from "../db/provider/SQLProvider.js";
import { ValueError } from "../error/ValueError.js";
import { type ImmutableArray, isArray, type MutableArray } from "../util/array.js";
import type { Data } from "../util/data.js";
import type { AnyCaller } from "../util/function.js";
import type { Identifier } from "../util/item.js";
import { isPlainObject } from "../util/object.js";
import type { D1Database, D1Value } from "./types.js";

type D1Query = {
	readonly query: string;
	readonly values: ImmutableArray<D1Value>;
};

/**
 * SQLite database provider backed by Cloudflare D1.
 *
 * Implements the `SQLiteProvider` SQL abstraction by binding tagged-template queries and running them through the D1 Worker API.
 * - Tagged-template values are flattened into positional `?` bindings; nested `SQLFragment` values are inlined recursively.
 * - Array and plain-object values are JSON-encoded before binding; other non-primitive values throw `ValueError`.
 * - The `D1Database` binding is provided by the Cloudflare Workers runtime environment.
 *
 * @example
 * // `env.DB` is the D1 binding from the Worker environment.
 * const provider = new CloudflareD1Provider(env.DB);
 *
 * @see https://dhoulb.github.io/shelving/cloudflare/CloudflareD1Provider/CloudflareD1Provider
 */
export class CloudflareD1Provider<I extends Identifier = Identifier, T extends Data = Data> extends SQLiteProvider<I, T> {
	private readonly _db: D1Database;

	/**
	 * Create a provider wrapping a Cloudflare D1 database binding.
	 *
	 * @param db The `D1Database` binding from the Worker environment.
	 * @see https://dhoulb.github.io/shelving/cloudflare/CloudflareD1Provider/CloudflareD1Provider
	 */
	constructor(db: D1Database) {
		super();
		this._db = db;
	}

	/**
	 * Execute an SQL query through the Cloudflare D1 Worker API.
	 *
	 * Converts the tagged-template query into a parameterised statement, binds its values, and runs it via `prepare().bind().run()`.
	 *
	 * @param strings The tagged-template string parts of the query.
	 * @param values The interpolated values, bound as positional parameters or inlined `SQLFragment` instances.
	 * @returns Promise resolving to the array of result rows (empty if D1 returns no results).
	 * @throws {ValueError} If a value cannot be converted to a D1 binding.
	 * @example provider.exec`SELECT * FROM ${provider.sqlIdentifier("items")}`
	 * @see https://dhoulb.github.io/shelving/cloudflare/CloudflareD1Provider/CloudflareD1Provider/exec
	 */
	override async exec<X extends Data>(strings: TemplateStringsArray, ...values: ImmutableArray<unknown>): Promise<readonly X[]> {
		const { query, values: bindings } = _getD1Query(strings, values, this.exec);
		const result = await this._db
			.prepare(query)
			.bind(...bindings)
			.run<X>();
		return result.results ?? [];
	}
}

function _getD1Query(strings: readonly string[], values: ImmutableArray<unknown>, caller: AnyCaller): D1Query {
	let query = strings[0] ?? "";
	const bindings: MutableArray<D1Value> = [];
	for (const [index, value] of values.entries()) {
		const part = _getD1Part(value, caller);
		query += part.query;
		bindings.push(...part.values);
		query += strings[index + 1] ?? "";
	}
	return { query, values: bindings };
}

function _getD1Part(value: unknown, caller: AnyCaller): D1Query {
	if (_isSQLQuery(value)) return _getD1Query(value.strings, value.values, caller);
	return { query: "?", values: [_getD1Value(value, caller)] };
}

function _getD1Value(value: unknown, caller: AnyCaller): D1Value {
	if (value === null || typeof value === "boolean" || typeof value === "string" || typeof value === "number") return value;

	if (isArray(value) || isPlainObject(value)) {
		try {
			return JSON.stringify(value);
		} catch (cause) {
			throw new ValueError("Cannot convert value to D1 JSON value", { cause, received: value, caller });
		}
	}

	throw new ValueError("Cannot convert value to D1 binding", { received: value, caller });
}

function _isSQLQuery(value: unknown): value is SQLFragment {
	return typeof value === "object" && !!value && "strings" in value && "values" in value;
}
