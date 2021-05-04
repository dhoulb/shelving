import type { MutableObject } from "../object";
import { Feedback, InvalidFeedback, isFeedback } from "../feedback";
import { ImmutableArray, uniqueItems } from "../array";
import { Schema, SchemaOptions } from "./Schema";
import { Validator } from "./Validator";

type ArraySchemaOptions<T> = SchemaOptions<ImmutableArray<T>> & {
	readonly items: Validator<T>;
	readonly value?: ImmutableArray;
	readonly min?: number;
	readonly max?: number | null;
	readonly unique?: boolean;
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
export class ArraySchema<T> extends Schema<ImmutableArray<T>> {
	static create<X>(options: ArraySchemaOptions<X>): ArraySchema<X> {
		return new ArraySchema(options);
	}

	/** Create a new `ArraySchema` from the specified item validator (sugar for `ArraySchema.create({ items: etc })`). */
	static from<X>(items: Validator<X>): ArraySchema<X> {
		return new ArraySchema({ items });
	}

	readonly value: ImmutableArray;

	/** Whether to de-duplicate items in the array (i.e. items in the array are unique). */
	readonly unique: boolean;

	/** Describe the minimum numbers of items. */
	readonly min: number;
	/** Describe the maximum numbers of items. */
	readonly max: number | null;

	/** Describe the format for _all_ items in the array. */
	readonly items: Validator<T>;

	protected constructor({ items, unique = false, min = 0, max = null, value = [], ...rest }: ArraySchemaOptions<T>) {
		super(rest);
		this.items = items;
		this.unique = unique;
		this.min = min;
		this.max = max;
		this.value = value;
	}

	validate(unsafeValue: unknown = this.value): ImmutableArray<T> {
		// Coorce.
		const unsafeArray = !unsafeValue ? [] : unsafeValue instanceof Array ? unsafeValue : undefined;
		if (!unsafeArray) throw new InvalidFeedback("Must be array", { unsafeValue });

		// Has contents?
		if (!unsafeArray.length) {
			// Check requiredness.
			if (this.required) throw new InvalidFeedback("Required", { unsafeArray });

			// Return empty array.
			return super.validate(unsafeArray);
		}

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

		// Possibly de-duplicate the array.
		const finalArray = this.unique ? uniqueItems(safeArray) : safeArray;
		if (finalArray !== safeArray) changed = true;

		// Array shorter than min length returns Invalid.
		if (typeof this.min === "number" && finalArray.length < this.min) throw new InvalidFeedback(`Minimum ${this.min} items`, { value: finalArray });

		// Array longer than max length returns Invalid.
		if (typeof this.max === "number" && finalArray.length > this.max) throw new InvalidFeedback(`Maximum ${this.max} items`, { value: finalArray });

		// Return array (same instance if no changes were made).
		return super.validate(changed ? finalArray : unsafeArray);
	}
}
