import type { ImmutableArray } from "../util/array.js";
import { getUniqueArray, isArray } from "../util/array.js";
import { formatArray } from "../util/format.js";
import { validateArray } from "../util/validate.js";
import type { SchemaOptions } from "./Schema.js";
import { Schema } from "./Schema.js";

/**
 * Options for `ArraySchema`.
 *
 * @see https://dhoulb.github.io/shelving/schema/ArraySchema/ArraySchemaOptions
 */
export interface ArraySchemaOptions<T> extends SchemaOptions {
	/**
	 * Default value used when the input is `undefined`.
	 * @default []
	 */
	readonly value?: ImmutableArray;
	/** Schema every item in the array must conform to. */
	readonly items: Schema<T>;
	/**
	 * Minimum number of items.
	 * @default 0
	 */
	readonly min?: number;
	/**
	 * Maximum number of items.
	 * @default Number.POSITIVE_INFINITY
	 */
	readonly max?: number;
	/**
	 * Whether to deduplicate the items.
	 * @default false
	 */
	readonly unique?: boolean;
	/**
	 * String or `RegExp` used to split a string input into items.
	 * @default ","
	 */
	readonly separator?: string | RegExp;
}

/**
 * Schema that validates an array and ensures every item matches a specified item schema.
 *
 * - A string input is split into items using `separator`.
 * - Items are optionally deduplicated (`unique`), then the count is checked against `min` and `max`.
 *
 * @example
 *  const schema = new ArraySchema({ min: 1, max: 2, default: [10,11,12], required: true });
 *  schema.validate([1,2,3], schema); // Returns [1,2,3]
 *  schema.validate(undefined, schema); // Returns [10,11,12] (due to value)
 *  schema.validate([4,5,6,7], schema); // Returns [4,5,6] (due to max)
 *  schema.validate(9999, schema); // Throws Invalid('Must be array')
 *  schema.validate([], schema); // Throws Required
 *  schema.validate([1,2], schema); // Throws Invalid('Needs at least 3 items')
 *
 * @example
 *  const schema = new ArraySchema({ schema: Array });
 *  schema.validate(["a", "a"], schema); // Returns ["a", "a"]
 *  schema.validate(["a", null], schema); // Throws Invalids({ "1": Invalid('Must be a string') });
 *
 * @see https://dhoulb.github.io/shelving/schema/ArraySchema/ArraySchema
 */
export class ArraySchema<T> extends Schema<ImmutableArray<T>> {
	declare readonly value: ImmutableArray<T>;
	readonly items: Schema<T>;
	readonly unique: boolean;
	readonly min: number;
	readonly max: number;
	readonly separator: string | RegExp;

	/**
	 * Create a new `ArraySchema`.
	 */
	constructor({
		items,
		one = items.one,
		many = items.many,
		title = "Items",
		placeholder = `No ${many}`,
		unique = false,
		min = 0,
		max = Number.POSITIVE_INFINITY,
		separator = ",",
		value = [],
		...options
	}: ArraySchemaOptions<T>) {
		super({ one, many, title, placeholder, value, ...options });
		this.items = items;
		this.unique = unique;
		this.min = min;
		this.max = max;
		this.separator = separator;
	}
	/**
	 * Validate an unknown value as an array whose items all match the `items` schema.
	 *
	 * @param unsafeValue The unknown input value to validate; a string is split using `separator` (defaults to this schema's `value`).
	 * @returns The valid array with each item validated by the `items` schema.
	 * @throws `string` `"Must be array"` if not an array, `"Required"` or `` `Minimum ${min} ${many}` `` if too few items, or `` `Maximum ${max} ${many}` `` if too many.
	 * @example schema.validate([1, 2, 3]) // [1, 2, 3]
	 * @see https://dhoulb.github.io/shelving/schema/ArraySchema/ArraySchema/validate
	 */
	override validate(unsafeValue: unknown = this.value): ImmutableArray<T> {
		const unsafeArray = typeof unsafeValue === "string" ? unsafeValue.split(this.separator).filter(Boolean) : unsafeValue;
		if (!isArray(unsafeArray)) throw "Must be array";
		const validArray = validateArray(unsafeArray, this.items);
		const uniqueArray = this.unique ? getUniqueArray(validArray) : validArray;
		if (uniqueArray.length < this.min) throw uniqueArray.length ? `Minimum ${this.min} ${this.many}` : "Required";
		if (uniqueArray.length > this.max) throw `Maximum ${this.max} ${this.many}`;
		return uniqueArray;
	}

	/**
	 * Format a validated array as a string for display.
	 *
	 * @param arr The valid array to format.
	 * @returns The array's items formatted as a human-readable string.
	 * @example schema.format([1, 2, 3]) // "1, 2, 3"
	 * @see https://dhoulb.github.io/shelving/schema/ArraySchema/ArraySchema/format
	 */
	override format(arr: ImmutableArray<T>): string {
		return formatArray(
			arr.map(v => this.items.format(v)),
			undefined,
			this.format,
		);
	}
}

/**
 * Create a schema for a valid array with specified items.
 *
 * Sugar factory for [`ArraySchema`](/schema/ArraySchema).
 *
 * @param items Schema every item in the array must conform to.
 * @example ARRAY(NUMBER) // ArraySchema<number>
 * @see https://dhoulb.github.io/shelving/schema/ArraySchema/ARRAY
 */
export function ARRAY<T>(items: Schema<T>): ArraySchema<T> {
	return new ArraySchema({ items });
}
