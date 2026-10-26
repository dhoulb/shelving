import type { MutableArray } from "../util/array.js";
import { isArray } from "../util/array.js";
import type { Data } from "../util/data.js";
import { isData } from "../util/data.js";
import { getNamedMessage } from "../util/error.js";
import type { Query } from "../util/query.js";
import { validateArray } from "../util/validate.js";
import { ArraySchema } from "./ArraySchema.js";
import type { DataSchema } from "./DataSchema.js";
import { getDataSchemaProp } from "./DataSchema.js";
import { NumberSchema } from "./NumberSchema.js";
import type { SchemaOptions } from "./Schema.js";
import { Schema } from "./Schema.js";
import { getSourceSchema } from "./ThroughSchema.js";

/**
 * Options for `QuerySchema`.
 *
 * @see https://shelving.cc/schema/QuerySchemaOptions
 */
export interface QuerySchemaOptions<T extends Data> extends SchemaOptions {
	/** Schema for the data objects the query filters and sorts. */
	readonly data: DataSchema<T>;
}

/**
 * Schema that validates a `Query` against the schema of the data objects it filters and sorts.
 *
 * - Each filter key, without its operator, is a prop path of `data` (e.g. `sub.num`). `getDataSchemaProp()` finds the schema for the path.
 * - A plain or `!` key takes one value, or an array of values (the "in" / "out" form). Each value is validated against the prop schema.
 * - A range key (`a<`, `a<=`, `a>`, `a>=`) takes one value, validated against the prop schema.
 * - A contains key (`a[]`) needs an `ArraySchema` prop. Its value is validated against `ArraySchema.items`.
 * - Each `$order` key, without its `!`, must be a prop path. `$limit` must be a positive integer.
 * - An unknown key throws, because a query without one of its filters matches more items. `undefined` values are removed.
 *
 * @example
 *  const schema = new QuerySchema({ data: DATA({ num: NUMBER, tags: ARRAY(STRING) }) });
 *  schema.validate({ "num>": 1, "tags[]": "a", $order: "!num", $limit: 10 }); // Same query.
 * @see https://shelving.cc/schema/QuerySchema
 */
export class QuerySchema<T extends Data> extends Schema<Query<T>> {
	declare readonly value: Query<T>;
	readonly data: DataSchema<T>;

	constructor({ data, one = "query", title = "Query", value = {}, ...options }: QuerySchemaOptions<T>) {
		super({ one, title, value, ...options });
		this.data = data;
	}

	/** Validates each filter against the schema of its prop, and the `$order` and `$limit`; joins failures as `"key: message"` lines. */
	override validate(unsafeValue: unknown = this.value): Query<T> {
		if (!isData(unsafeValue)) throw "Must be object";
		const query: { [key: string]: unknown } = {};
		const messages: MutableArray<string> = [];
		for (const [key, value] of Object.entries(unsafeValue)) {
			if (value === undefined) continue;
			try {
				query[key] = _validateQueryProp(this.data, key, value);
			} catch (thrown) {
				if (typeof thrown !== "string") throw thrown;
				messages.push(getNamedMessage(key, thrown));
			}
		}
		if (messages.length) throw messages.join("\n");
		return query as Query<T>;
	}
}

// Constants.
const _LIMIT = new NumberSchema({ min: 1, step: 1, max: Number.MAX_SAFE_INTEGER });

/** Validate the value of one `Query` key against the schema of its prop. */
function _validateQueryProp(data: DataSchema<Data>, key: string, value: unknown): unknown {
	if (key === "$limit") return _LIMIT.validate(value);
	if (key === "$order") return _validateOrder(data, value);
	if (key.startsWith("!")) return _validateIn(_requireProp(data, key.slice(1)), value);
	if (key.endsWith("[]")) {
		const array = getSourceSchema(_requireProp(data, key.slice(0, -2)));
		if (!(array instanceof ArraySchema)) throw "Must be array prop";
		return array.items.validate(value);
	}
	if (key.endsWith("<=") || key.endsWith(">=")) return _requireProp(data, key.slice(0, -2)).validate(value);
	if (key.endsWith("<") || key.endsWith(">")) return _requireProp(data, key.slice(0, -1)).validate(value);
	return _validateIn(_requireProp(data, key), value);
}

/** Validate one value, or each value in an array of values (the "in" / "out" form). */
function _validateIn(schema: Schema<unknown>, value: unknown): unknown {
	return isArray(value) ? validateArray(value, schema) : schema.validate(value);
}

/** Validate a `$order` value: one sort key, or an array of sort keys. */
function _validateOrder(data: DataSchema<Data>, value: unknown): unknown {
	for (const key of isArray(value) ? value : [value]) {
		if (key === undefined) continue;
		if (typeof key !== "string") throw "Must be string";
		if (!getDataSchemaProp(data, key.startsWith("!") ? key.slice(1) : key)) throw `Unknown prop "${key}"`;
	}
	return value;
}

/** Get the schema for a prop path, or throw a message if it doesn't exist. */
function _requireProp(data: DataSchema<Data>, path: string): Schema<unknown> {
	const schema = getDataSchemaProp(data, path);
	if (!schema) throw "Unknown prop";
	return schema;
}

/**
 * Create a `QuerySchema` for the data objects of a `DataSchema`.
 *
 * Sugar factory for `QuerySchema`.
 *
 * @param data Schema for the data objects the query filters and sorts.
 * @example QUERY(DATA({ num: NUMBER })) // QuerySchema<{ num: number }>
 * @see https://shelving.cc/schema/QUERY
 */
export function QUERY<T extends Data>(data: DataSchema<T>): QuerySchema<T> {
	return new QuerySchema({ data });
}
