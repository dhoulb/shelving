import { MutableObject, isObject, ImmutableObject, Validators, validate, getProps, PropEntry } from "../util/index.js";
import { Feedback, InvalidFeedback } from "../feedback/index.js";
import { Schema, SchemaOptions } from "./Schema.js";

type ObjectSchemaOptions<T extends ImmutableObject> = SchemaOptions<T> & {
	readonly props: Validators<T>;
	readonly value?: Partial<T>;
};

/**
 * Schema that defines a valid object.
 *
 * Checks that value is an object, and optionally matches the format or items specific contents in the object.
 * Only returns a new instance of the object if it changes (for immutability).
 */
export class ObjectSchema<T extends ImmutableObject> extends Schema<T> {
	static create<X extends ImmutableObject>(options: ObjectSchemaOptions<X>): ObjectSchema<X> {
		return new ObjectSchema(options);
	}

	/** Create a new `ObjectSchema` from the specified property validators (sugar for `ObjectSchema.create({ props: etc })`). */
	static from<X extends ImmutableObject>(props: Validators<X>): ObjectSchema<X> {
		return new ObjectSchema({ props, value: {} });
	}

	override readonly value: Partial<T>;
	readonly props: Validators<T>;

	protected constructor({ value = {}, props, ...options }: ObjectSchemaOptions<T>) {
		super(options);
		this.value = value;
		this.props = props;
	}

	override validate(unsafeValue: unknown = this.value): Readonly<T> {
		// Coorce.
		const unsafeObject = isObject(unsafeValue) ? unsafeValue : undefined;
		if (!unsafeObject) throw new InvalidFeedback("Must be object", { value: unsafeValue });

		// Validate the object against `this.props`
		const safeObject: MutableObject = {};
		const entries = getProps(this.props);
		let changed = Object.keys(unsafeObject).length > entries.length;
		const details: MutableObject<Feedback> = {};
		let invalid = false;
		for (const [key, validator] of entries) {
			const unsafeProp = unsafeObject[key];
			try {
				const safeProp = validate(unsafeProp, validator);
				if (safeProp !== unsafeProp) changed = true;
				safeObject[key] = safeProp;
			} catch (thrown) {
				if (thrown instanceof Feedback) {
					invalid = true;
					details[key] = thrown;
				} else throw thrown;
			}
		}

		// If any validator threw a Feedback, throw a Feedback.
		if (invalid) throw new InvalidFeedback("Invalid format", details);

		// Return object (same instance if no changes were made).
		return super.validate(changed ? safeObject : unsafeObject);
	}

	// Implement iterator protocol.
	*[Symbol.iterator](): Generator<PropEntry<Validators<T>>, void, undefined> {
		yield* Object.entries(this.props);
	}
}
