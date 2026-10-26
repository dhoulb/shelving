import type { MutableArray } from "../util/array.js";
import { isArray } from "../util/array.js";
import type { Data } from "../util/data.js";
import { isData } from "../util/data.js";
import { getNamedMessage } from "../util/error.js";
import type { Updates } from "../util/update.js";
import { validateArray } from "../util/validate.js";
import { ArraySchema } from "./ArraySchema.js";
import type { DataSchema } from "./DataSchema.js";
import { getDataSchemaProp } from "./DataSchema.js";
import { NumberSchema } from "./NumberSchema.js";
import type { SchemaOptions } from "./Schema.js";
import { Schema } from "./Schema.js";
import { getSourceSchema } from "./ThroughSchema.js";

/**
 * Options for `UpdatesSchema`.
 *
 * @see https://shelving.cc/schema/UpdatesSchemaOptions
 */
export interface UpdatesSchemaOptions<T extends Data> extends SchemaOptions {
	/** Schema for the data object the updates change. */
	readonly data: DataSchema<T>;
}

/**
 * Schema that validates an `Updates` object against the schema of the data object it changes.
 *
 * - Each key, without its update prefix, is a prop path of `data` (e.g. `sub.num`). `getDataSchemaProp()` finds the schema for the path.
 * - A set update (`a`, `a.b`, `=a.b`) is validated in full against the schema at its path. A set on `a` replaces all of `a`, so it is not partial.
 * - A sum update (`+=a`, `-=a`) needs a `NumberSchema` prop and a number value.
 * - A with or omit update (`+[]a`, `-[]a`) needs an `ArraySchema` prop. Each item is validated against `ArraySchema.items`.
 * - An unknown key throws. `undefined` values are removed.
 *
 * @example
 *  const schema = new UpdatesSchema({ data: DATA({ num: NUMBER, sub: DATA({ str: STRING }) }) });
 *  schema.validate({ "+=num": 1, "sub.str": "abc" }); // { "+=num": 1, "sub.str": "abc" }
 * @see https://shelving.cc/schema/UpdatesSchema
 */
export class UpdatesSchema<T extends Data> extends Schema<Updates<T>> {
	declare readonly value: Updates<T>;
	readonly data: DataSchema<T>;

	constructor({ data, one = "update", title = "Updates", value = {}, ...options }: UpdatesSchemaOptions<T>) {
		super({ one, title, value, ...options });
		this.data = data;
	}

	/** Validates each update against the schema of its prop; joins failures as `"key: message"` lines. */
	override validate(unsafeValue: unknown = this.value): Updates<T> {
		if (!isData(unsafeValue)) throw "Must be object";
		const updates: { [key: string]: unknown } = {};
		const messages: MutableArray<string> = [];
		for (const [key, value] of Object.entries(unsafeValue)) {
			if (value === undefined) continue;
			try {
				updates[key] = _validateUpdate(this.data, key, value);
			} catch (thrown) {
				if (typeof thrown !== "string") throw thrown;
				messages.push(getNamedMessage(key, thrown));
			}
		}
		if (messages.length) throw messages.join("\n");
		return updates as Updates<T>;
	}
}

/** Validate the value of one `Updates` key against the schema of its prop. */
function _validateUpdate(data: DataSchema<Data>, key: string, value: unknown): unknown {
	if (key.startsWith("+=") || key.startsWith("-=")) {
		if (!(getSourceSchema(_requireProp(data, key.slice(2))) instanceof NumberSchema)) throw "Must be number prop";
		if (typeof value !== "number" || !Number.isFinite(value)) throw "Must be number";
		return value;
	}
	if (key.startsWith("+[]") || key.startsWith("-[]")) {
		const array = getSourceSchema(_requireProp(data, key.slice(3)));
		if (!(array instanceof ArraySchema)) throw "Must be array prop";
		return isArray(value) ? validateArray(value, array.items) : array.items.validate(value);
	}
	return _requireProp(data, key.startsWith("=") ? key.slice(1) : key).validate(value);
}

/** Get the schema for a prop path, or throw a message if it doesn't exist. */
function _requireProp(data: DataSchema<Data>, path: string): Schema<unknown> {
	const schema = getDataSchemaProp(data, path);
	if (!schema) throw "Unknown prop";
	return schema;
}

/**
 * Create an `UpdatesSchema` for the data object of a `DataSchema`.
 *
 * Sugar factory for `UpdatesSchema`.
 *
 * @param data Schema for the data object the updates change.
 * @example UPDATES(DATA({ num: NUMBER })) // UpdatesSchema<{ num: number }>
 * @see https://shelving.cc/schema/UPDATES
 */
export function UPDATES<T extends Data>(data: DataSchema<T>): UpdatesSchema<T> {
	return new UpdatesSchema({ data });
}
