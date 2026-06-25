import type { ImmutableDictionary } from "../util/dictionary.js";
import { isDictionary } from "../util/dictionary.js";
import { formatArray } from "../util/format.js";
import { validateDictionary } from "../util/validate.js";
import type { SchemaOptions } from "./Schema.js";
import { Schema } from "./Schema.js";

/**
 * Options for `DictionarySchema`.
 *
 * @see https://shelving.cc/schema/DictionarySchemaOptions
 */
export interface DictionarySchemaOptions<T> extends SchemaOptions {
	/** Schema every entry value in the dictionary must conform to. */
	readonly items: Schema<T>;
	/** Default dictionary used when the input is `undefined`. */
	readonly value?: ImmutableDictionary | undefined;
	/**
	 * Minimum number of entries.
	 * @default 0
	 */
	readonly min?: number | undefined;
	/**
	 * Maximum number of entries.
	 * @default Number.POSITIVE_INFINITY
	 */
	readonly max?: number | undefined;
}

/**
 * Schema that validates a dictionary object whose entries all share the same value schema and have string keys.
 *
 * - Every entry value is validated by the `items` schema.
 * - Entry count is checked against `min` and `max`.
 *
 * @example
 *  const schema = new DictionarySchema({ items: NUMBER });
 *  schema.validate({ a: 1, b: 2 }); // { a: 1, b: 2 }
 *
 * @see https://shelving.cc/schema/DictionarySchema
 */
export class DictionarySchema<T> extends Schema<ImmutableDictionary<T>> {
	declare readonly value: ImmutableDictionary<T>;
	readonly items: Schema<T>;
	readonly min: number;
	readonly max: number;

	constructor({
		items,
		one = items.one,
		many = items.many,
		placeholder = `No ${many}`,
		min = 0,
		max = Number.POSITIVE_INFINITY,
		title = "Items",
		value = {},
		...options
	}: DictionarySchemaOptions<T>) {
		super({ one, many, title, placeholder, value, ...options });
		this.items = items;
		this.min = min;
		this.max = max;
	}

	/** Validates each entry value against `items`, then checks the entry count against `min` / `max`. */
	override validate(unsafeValue: unknown = this.value): ImmutableDictionary<T> {
		if (!isDictionary(unsafeValue)) throw "Must be object";
		const validDictionary = validateDictionary(unsafeValue, this.items);
		const length = Object.keys(validDictionary).length;
		if (length < this.min) throw length ? `Minimum ${this.min} ${this.many}` : "Required";
		if (length > this.max) throw `Maximum ${this.max} ${this.many}`;
		return validDictionary;
	}

	/** Formats each value via the `items` schema, joined for display. */
	override format(dict: ImmutableDictionary<T>): string {
		return formatArray(
			Object.values(dict).map(v => this.items.format(v)),
			undefined,
			this.format,
		);
	}
}

/**
 * Create a schema for a valid dictionary object with specified entry values.
 *
 * Sugar factory for `DictionarySchema`.
 *
 * @param items Schema every entry value in the dictionary must conform to.
 * @example DICTIONARY(NUMBER) // DictionarySchema<number>
 * @see https://shelving.cc/schema/DICTIONARY
 */
export function DICTIONARY<T>(items: Schema<T>): DictionarySchema<T> {
	return new DictionarySchema({ items });
}
