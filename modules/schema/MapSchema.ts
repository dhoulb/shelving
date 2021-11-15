import { MutableObject, ImmutableObject, isObject, Validator, validate } from "../util/index.js";
import { Feedback, InvalidFeedback } from "../feedback/index.js";
import { Schema, SchemaOptions } from "./Schema.js";

type MapSchemaOptions<T> = SchemaOptions<ImmutableObject<T>> & {
	readonly items: Validator<T>;
	readonly value?: ImmutableObject;
	readonly required?: boolean;
	readonly min?: number | null;
	readonly max?: number | null;
};

/**
 * Schema that defines a valid object with typed key: value props (like ES6 Map class but works with plain objects).
 * Different from ObjectSchema because that has fixed props, and this has an unknown number of props that are all the same type.
 */
export class MapSchema<T> extends Schema<ImmutableObject<T>> {
	static create<X>(options: MapSchemaOptions<X>): MapSchema<X> {
		return new MapSchema(options);
	}

	/** Create a new `MapSchema` from the specified item validator (sugar for `MapSchema.create({ items: etc })`). */
	static from<X>(items: Validator<X>): MapSchema<X> {
		return new MapSchema({ items });
	}

	override readonly value: ImmutableObject;
	readonly items: Validator<T>;
	readonly required: boolean;
	readonly min: number | null = null;
	readonly max: number | null = null;

	protected constructor({ value = {}, items, required = false, min = null, max = null, ...rest }: MapSchemaOptions<T>) {
		super(rest);
		this.value = value;
		this.items = items;
		this.required = required;
		this.min = min;
		this.max = max;
	}

	override validate(unsafeValue: unknown = this.value): ImmutableObject<T> {
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
		const safeObject: MutableObject<T> = {};
		const details: MutableObject<Feedback> = {};
		let changed = false;
		let invalid = false;
		for (const [key, unsafeItem] of entries) {
			try {
				const safeItem = validate(unsafeItem, this.items);
				if (safeItem !== unsafeItem) changed = true;
				safeObject[key] = safeItem;
			} catch (thrown) {
				if (thrown instanceof Feedback) {
					invalid = true;
					details[key] = thrown;
				} else throw thrown;
			}
		}

		// If any validator threw a Feedback, throw a Feedback.
		if (invalid) throw new InvalidFeedback("Invalid items", details);

		// Return object (same instance if no changes were made).
		return super.validate(changed ? safeObject : unsafeObject);
	}
}
