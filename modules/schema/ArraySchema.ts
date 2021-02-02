import type { MutableObject } from "../object";
import { Feedback, InvalidFeedback, isFeedback } from "../feedback";
import { Schema, SchemaOptions } from "./Schema";

export type ArrayOptions<T> = SchemaOptions & {
	readonly items: Schema<T>;
	readonly value?: ReadonlyArray<T>;
	readonly min?: number;
	readonly max?: number | null;
	readonly required?: boolean;
};

/**
 * Schema that defines a valid array.
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
export class ArraySchema<T> extends Schema<ReadonlyArray<T>> {
	readonly value: ReadonlyArray<T>;

	/** Describe the minimum and maximum numbers of items. */
	readonly min: number;
	readonly max: number | null;

	/** Describe the format for _all_ items in the array. */
	readonly items: Schema<T>;

	constructor({ items, min = 0, max = null, value = [], ...rest }: ArrayOptions<T>) {
		super(rest);
		this.items = items;
		this.min = min;
		this.max = max;
		this.value = value;
	}

	validate(unsafeValue: unknown = this.value): ReadonlyArray<T> {
		// Coorce.
		const unsafeArray = !unsafeValue ? [] : unsafeValue instanceof Array ? unsafeValue : undefined;
		if (!unsafeArray) throw new InvalidFeedback("Must be array");

		// Has contents?
		if (!unsafeArray.length) {
			// Check requiredness.
			if (this.required) throw new InvalidFeedback("Required");

			// Return empty array.
			// We know this assertion is okay because we know the array is empty.
			return unsafeArray as ReadonlyArray<T>;
		}

		// Array shorter than min length returns Invalid.
		if (typeof this.min === "number" && unsafeArray.length < this.min) throw new InvalidFeedback(`Minimum ${this.min} items`);

		// Array longer than max length returns Invalid.
		if (typeof this.max === "number" && unsafeArray.length > this.max) throw new InvalidFeedback(`Maximum ${this.max} items`);

		// Check each item against `this.items`
		let changed = false;
		let invalid = false;
		const items = this.items;
		const safeArray: T[] = [];
		const details: MutableObject<Feedback> = {};
		for (let i = 0, l = unsafeArray.length; i < l; i++) {
			try {
				const unsafeItem = unsafeArray[i];
				const safeItem = items.validate(unsafeItem);
				if (safeItem !== unsafeItem) changed = true;
				safeArray.push(safeItem);
			} catch (feedback: unknown) {
				if (isFeedback(feedback)) {
					invalid = true;
					details[i.toString()] = feedback;
				}
			}
		}

		// If any Schema was invalid then throw.
		if (invalid) throw new InvalidFeedback("Invalid items", details);

		// Return the new array if it changed.
		// We know this assertion is okay because if it wasn't, we would've returned Invalid.
		return (changed ? safeArray : unsafeArray) as ReadonlyArray<T>;
	}
}

/** Shortcuts for ArraySchema. */
export const array: {
	<T>(options: ArrayOptions<T>): ArraySchema<T>;
	required<T>(items: Schema<T>): ArraySchema<T>;
	optional<T>(items: Schema<T>): ArraySchema<T>;
} = Object.assign(<T>(options: ArrayOptions<T>): ArraySchema<T> => new ArraySchema<T>(options), {
	required: <T>(items: Schema<T>): ArraySchema<T> => new ArraySchema<T>({ items, required: true }),
	optional: <T>(items: Schema<T>): ArraySchema<T> => new ArraySchema<T>({ items, required: false }),
});
