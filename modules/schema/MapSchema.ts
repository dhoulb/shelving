import { MutableObject, ImmutableObject, isObject } from "../object";
import { Feedback, InvalidFeedback, isFeedback } from "../feedback";
import { Schema, SchemaOptions } from "./Schema";
import { Validator } from "./Validator";

type MapSchemaOptions<T> = SchemaOptions<ImmutableObject<T>> & {
	readonly items: Validator<T>;
	readonly value?: ImmutableObject<T>;
	readonly min?: number | null;
	readonly max?: number | null;
};

/**
 * Schema that defines a valid object with typed key: value props (like ES6 Map class but works with plain objects).
 * Different from ObjectSchema because that has fixed props, and this has an unknown number of props that are all the same type.
 */
export class MapSchema<T> extends Schema<ImmutableObject<T>> implements Validator<ImmutableObject<T>> {
	static create<X>(options: MapSchemaOptions<X>): MapSchema<X> {
		return new MapSchema(options);
	}

	/** Create a new `MapSchema` from the specified item validator (sugar for `MapSchema.create({ items: etc })`). */
	static from<X>(items: Validator<X>): MapSchema<X> {
		return new MapSchema({ items });
	}

	readonly value: ImmutableObject<T>;

	/**
	 * Define a validator for _all_ props in the object.
	 * JSON Schema calls this `additionalProperties`, we call it `items` to match ArraySchema.
	 */
	readonly items: Validator<T>;

	/**
	 * Describe the minimum and maximum numbers of items.
	 * Note that this _includes_
	 */
	readonly min: number | null = null;
	readonly max: number | null = null;

	protected constructor({ items, min = null, max = null, value = {} as ImmutableObject<T>, ...rest }: MapSchemaOptions<T>) {
		super(rest);
		this.items = items;
		this.min = min;
		this.max = max;
		this.value = value;
	}

	validate(unsafeValue: unknown = this.value): ImmutableObject<T> {
		// Coorce.
		const unsafeObject = !unsafeValue ? {} : isObject(unsafeValue) ? unsafeValue : undefined;
		if (!unsafeObject) throw new InvalidFeedback("Must be object", { value: unsafeValue });

		// Get number of properties.
		const entries = Object.entries(unsafeObject);
		const length = entries.length;

		// Has contents?
		if (!length) {
			// Check requiredness.
			if (this.required) throw new InvalidFeedback("Required", unsafeObject);

			// Return empty object.
			return super.validate(unsafeObject);
		}

		// Check min and max.
		if (typeof this.min === "number" && length < this.min) throw new InvalidFeedback(`Minimum ${this.min} items`, { value: unsafeObject });
		if (typeof this.max === "number" && length > this.max) throw new InvalidFeedback(`Maximum ${this.max} items`, { value: unsafeObject });

		// Check value against against `this.items`
		let changed = false;
		let invalid = false;
		const output: MutableObject<T> = {};
		const details: MutableObject<Feedback> = {};
		for (const [key, unsafeItem] of entries) {
			try {
				const safeItem = this.items.validate(unsafeItem);
				if (safeItem !== unsafeItem) changed = true;
				output[key] = safeItem;
			} catch (feedback: unknown) {
				if (isFeedback(feedback)) {
					invalid = true;
					details[key] = feedback;
				}
			}
		}

		// If any Schema threw Invalid, return an Invalids.
		if (invalid) throw new InvalidFeedback("Invalid items", details);

		// Return object (same instance if no changes were made).
		return super.validate(changed ? output : unsafeObject);
	}
}
