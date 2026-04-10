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
 * Cloudflare D1 database provider.
 *
 * Uses the D1 Worker API for execution and standard SQL from `SQLProvider`.
 */
export class CloudflareD1Provider<I extends Identifier = Identifier, T extends Data = Data> extends SQLiteProvider<I, T> {
	private readonly _db: D1Database;

	constructor(db: D1Database) {
		super();
		this._db = db;
	}

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
