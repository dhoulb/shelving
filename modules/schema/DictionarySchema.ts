import type { ImmutableDictionary } from "../util/dictionary.js";
import { isDictionary } from "../util/dictionary.js";
import { formatArray } from "../util/format.js";
import { validateDictionary } from "../util/validate.js";
import type { SchemaOptions } from "./Schema.js";
import { Schema } from "./Schema.js";

/**
 * Options for a [`DictionarySchema`](/schema/DictionarySchema).
 *
 * @see https://dhoulb.github.io/shelving/schema/DictionarySchema/DictionarySchemaOptions
 */
export interface DictionarySchemaOptions<T> extends SchemaOptions {
	/** Schema every entry value in the dictionary must conform to. */
	readonly items: Schema<T>;
	/**
	 * Default dictionary used when the input is `undefined`.
	 * @default {}
	 */
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
 * @see https://dhoulb.github.io/shelving/schema/DictionarySchema/DictionarySchema
 */
export class DictionarySchema<T> extends Schema<ImmutableDictionary<T>> {
	declare readonly value: ImmutableDictionary<T>;
	readonly items: Schema<T>;
	readonly min: number;
	readonly max: number;

	/**
	 * Create a new `DictionarySchema`.
	 *
	 * @param options Options for the schema, including the `items` schema and `min`/`max` entry counts.
	 */
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

	/**
	 * Validate an unknown value as a dictionary whose entries all match the `items` schema.
	 *
	 * @param unsafeValue The unknown input value to validate (defaults to this schema's `value`).
	 * @returns The valid dictionary with each entry value validated by the `items` schema.
	 * @throws `string` `"Must be object"` if not a dictionary, `"Required"` or `` `Minimum ${min} ${many}` `` if too few entries, or `` `Maximum ${max} ${many}` `` if too many.
	 * @example schema.validate({ a: 1, b: 2 }) // { a: 1, b: 2 }
	 * @see https://dhoulb.github.io/shelving/schema/DictionarySchema/DictionarySchema/validate
	 */
	override validate(unsafeValue: unknown = this.value): ImmutableDictionary<T> {
		if (!isDictionary(unsafeValue)) throw "Must be object";
		const validDictionary = validateDictionary(unsafeValue, this.items);
		const length = Object.keys(validDictionary).length;
		if (length < this.min) throw length ? `Minimum ${this.min} ${this.many}` : "Required";
		if (length > this.max) throw `Maximum ${this.max} ${this.many}`;
		return validDictionary;
	}

	/**
	 * Format a validated dictionary as a string for display.
	 *
	 * @param dict The valid dictionary to format.
	 * @returns The dictionary's values formatted as a human-readable string.
	 * @example schema.format({ a: 1, b: 2 }) // "1, 2"
	 * @see https://dhoulb.github.io/shelving/schema/DictionarySchema/DictionarySchema/format
	 */
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
 * Sugar factory for [`DictionarySchema`](/schema/DictionarySchema).
 *
 * @param items Schema every entry value in the dictionary must conform to.
 * @returns A `DictionarySchema` validating dictionaries of the given item type.
 * @example DICTIONARY(NUMBER) // DictionarySchema<number>
 * @see https://dhoulb.github.io/shelving/schema/DictionarySchema/DICTIONARY
 */
export function DICTIONARY<T>(items: Schema<T>): DictionarySchema<T> {
	return new DictionarySchema({ items });
}
