import { MutableObject, isObject, ImmutableObject, Validators, Feedback, InvalidFeedback, AnyValidator, ImmutableEntries, validate } from "../util/index.js";
import { Schema, SchemaOptions } from "./Schema.js";

type ObjectSchemaOptions<T extends ImmutableObject | null> = SchemaOptions<T> & {
	/**
	 * Describe the format for individual props in the object.
	 * JSON Schema calls this `properties`, we call it `props` to match React and because it's shorter.
	 */
	readonly props: Validators<T & ImmutableObject>;
	readonly value?: Partial<T> | null;
};

/**
 * Schema that defines a valid object.
 *
 * Checks that value is an object, and optionally matches the format or items specific contents in the object.
 * Only returns a new instance of the object if it changes (for immutability).
 */
export class ObjectSchema<T extends ImmutableObject | null> extends Schema<Readonly<T>> {
	static create<X extends ImmutableObject>(options: ObjectSchemaOptions<X> & { readonly required: true }): ObjectSchema<X>;
	static create<X extends ImmutableObject | null>(options: ObjectSchemaOptions<X>): ObjectSchema<X>;
	static create<X extends ImmutableObject | null>(options: ObjectSchemaOptions<X>): ObjectSchema<X> {
		return new ObjectSchema(options);
	}

	/** Create a new `ObjectSchema` from the specified property validators (sugar for `ObjectSchema.create({ props: etc })`). */
	static from<X extends ImmutableObject>(props: Validators<X>): ObjectSchema<X> {
		return new ObjectSchema({ props, required: true, value: {} });
	}

	override readonly value: Readonly<Partial<T>> | null = null;

	readonly props: Validators<T & ImmutableObject>;

	protected constructor({ value = null, props, ...options }: ObjectSchemaOptions<T>) {
		super(options);
		this.value = value;
		this.props = props;
	}

	override validate(unsafeValue: unknown = this.value): Readonly<T> {
		// Coorce.
		const unsafeObj = isObject(unsafeValue) ? unsafeValue : null;

		// Null means 'no object'
		if (unsafeObj === null) {
			// If original input was truthy, we know its format must have been wrong.
			if (unsafeValue) throw new InvalidFeedback("Must be object", { value: unsafeValue });

			// Check requiredness.
			if (this.required) throw new InvalidFeedback("Required", { value: unsafeValue });

			// Return empty object.
			return super.validate(null);
		}

		// Validate the object against `this.props`
		let changed = false;
		let invalid = false;
		const safeObj: MutableObject = {};
		const details: MutableObject<Feedback> = {};
		const propSchemas: ImmutableEntries<AnyValidator> = Object.entries(this.props);
		for (const [key, validator] of propSchemas) {
			const unsafeProp = unsafeObj[key];
			try {
				const safeProp = validate(validator, unsafeProp);

				// Set the prop.
				if (safeProp !== unsafeProp) changed = true;
				safeObj[key] = safeProp;
			} catch (thrown: unknown) {
				if (thrown instanceof Feedback) {
					invalid = true;
					details[key] = thrown;
				} else throw thrown;
			}
		}

		// If input has keys that aren't in props, then these keys are _excess_ and we need to return output.
		if (Object.keys(unsafeObj).length > propSchemas.length) changed = true;

		// If any Schema threw Invalid, return an Invalids.
		if (invalid) throw new InvalidFeedback("Invalid format", details);

		// Return object (same instance if no changes were made).
		return super.validate(changed ? safeObj : unsafeObj);
	}
}
