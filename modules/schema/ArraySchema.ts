import { Feedback } from "../feedback/Feedback.js";
import { ImmutableArray, isArray, getUniqueArray } from "../util/array.js";
import { validateArray, Validator } from "../util/validate.js";
import { Schema, SchemaOptions } from "./Schema.js";

/** Allowed options for `ArraySchema` */
export type ArraySchemaOptions<T> = SchemaOptions & {
	readonly value?: ImmutableArray;
	readonly items: Validator<T>;
	readonly min?: number;
	readonly max?: number;
	readonly unique?: boolean;
};

/**
 * Define a valid array.
 *
 * Validates arrays and ensures the array's items match a specified format.
 * Only returns a new instance of the object if it changes (for immutability).
 *
 * Schema options:
 * - `value` The default value
 * - `length` The exact array length required
 * - `min` The minimum array length required
 * - `max` The maximum array length required
 * - `values` A schema all the array items in the value must conform to
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
 */
export class ArraySchema<T> extends Schema<ImmutableArray<T>> {
	override readonly value: ImmutableArray;
	readonly items: Validator<T>;
	readonly unique: boolean;
	readonly min: number;
	readonly max: number;
	constructor({ value = [], items, unique = false, min = 0, max = Infinity, ...options }: ArraySchemaOptions<T>) {
		super(options);
		this.value = value;
		this.items = items;
		this.unique = unique;
		this.min = min;
		this.max = max;
	}
	override validate(unsafeValue: unknown = this.value): ImmutableArray<T> {
		if (!isArray(unsafeValue)) throw new Feedback("Must be array", unsafeValue);
		const validArray = validateArray(unsafeValue, this.items);
		const uniqueArray = this.unique ? getUniqueArray(validArray) : validArray;
		if (uniqueArray.length < this.min) throw new Feedback(uniqueArray.length ? `Minimum ${this.min} items` : "Required", uniqueArray);
		if (uniqueArray.length > this.max) throw new Feedback(`Maximum ${this.max} items`, uniqueArray);
		return uniqueArray;
	}
}

/** Valid array with specifed items. */
export const ARRAY = <T>(items: Validator<T>): ArraySchema<T> => new ArraySchema({ items });
