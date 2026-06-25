import type { ImmutableArray } from "../util/array.js";
import { getUniqueArray, isArray } from "../util/array.js";
import { formatArray } from "../util/format.js";
import { validateArray } from "../util/validate.js";
import type { SchemaOptions } from "./Schema.js";
import { Schema } from "./Schema.js";

/**
 * Options for `ArraySchema`.
 *
 * @see https://shelving.cc/schema/ArraySchemaOptions
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
 * @see https://shelving.cc/schema/ArraySchema
 */
export class ArraySchema<T> extends Schema<ImmutableArray<T>> {
	declare readonly value: ImmutableArray<T>;
	readonly items: Schema<T>;
	readonly unique: boolean;
	readonly min: number;
	readonly max: number;
	readonly separator: string | RegExp;

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
	/** Splits a string input on `separator`, validates each item against `items`, and enforces `unique` / `min` / `max`. */
	override validate(unsafeValue: unknown = this.value): ImmutableArray<T> {
		const unsafeArray = typeof unsafeValue === "string" ? unsafeValue.split(this.separator).filter(Boolean) : unsafeValue;
		if (!isArray(unsafeArray)) throw "Must be array";
		const validArray = validateArray(unsafeArray, this.items);
		const uniqueArray = this.unique ? getUniqueArray(validArray) : validArray;
		if (uniqueArray.length < this.min) throw uniqueArray.length ? `Minimum ${this.min} ${this.many}` : "Required";
		if (uniqueArray.length > this.max) throw `Maximum ${this.max} ${this.many}`;
		return uniqueArray;
	}

	/** Formats each item via the `items` schema, joined for display. */
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
 * Sugar factory for `ArraySchema`.
 *
 * @param items Schema every item in the array must conform to.
 * @example ARRAY(NUMBER) // ArraySchema<number>
 * @see https://shelving.cc/schema/ARRAY
 */
export function ARRAY<T>(items: Schema<T>): ArraySchema<T> {
	return new ArraySchema({ items });
}
