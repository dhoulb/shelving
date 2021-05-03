import { MutableObject, isObject, ImmutableObject } from "../object";
import { Feedback, InvalidFeedback, isFeedback } from "../feedback";
import { RequiredSchemaOptions, Schema, SchemaOptions } from "./Schema";
import { ValidateOptions, Validator, Validators } from "./Validator";

type ObjectSchemaOptions<T extends ImmutableObject | null> = SchemaOptions<T> & {
	/**
	 * Describe the format for individual props in the object.
	 * JSON Schema calls this `properties`, we call it `props` to match React and because it's shorter.
	 */
	readonly props: Validators<T & ImmutableObject>;
	readonly value?: Partial<Readonly<T> | T> | null;
};

/**
 * Schema that defines a valid object.
 *
 * Checks that value is an object, and optionally matches the format or items specific contents in the object.
 * Only returns a new instance of the object if it changes (for immutability).
 */
export class ObjectSchema<T extends ImmutableObject | null> extends Schema<Readonly<T>> implements Validator<T> {
	static create<X extends ImmutableObject>(options: ObjectSchemaOptions<X> & RequiredSchemaOptions): ObjectSchema<X>;
	static create<X extends ImmutableObject | null>(options: ObjectSchemaOptions<X>): ObjectSchema<X | null>;
	static create(options: ObjectSchemaOptions<ImmutableObject | null>): ObjectSchema<ImmutableObject | null> {
		return new ObjectSchema(options);
	}

	/** Create a new `ObjectSchema` from the specified property validators (sugar for `ObjectSchema.create({ props: etc })`). */
	static from<X extends ImmutableObject>(props: Validators<X>): ObjectSchema<X> {
		return new ObjectSchema({ props, required: true, value: {} });
	}

	readonly value: Partial<Readonly<T>> | null = null;
	readonly props: Validators<T & ImmutableObject>;

	protected constructor({ value = null, props, ...options }: ObjectSchemaOptions<T>) {
		super(options);
		this.value = value;
		this.props = props;
	}

	validate(unsafeValue: unknown, options: ValidateOptions & { partial: true }): Partial<Readonly<T>>;
	validate(unsafeValue?: unknown, options?: ValidateOptions): Readonly<T>;
	validate(unsafeValue: unknown = this.value, options?: ValidateOptions): Readonly<T> {
		// Coorce.
		const unsafeObj = isObject(unsafeValue) ? unsafeValue : null;

		// Null means 'no object'
		if (unsafeObj === null) {
			// If original input was truthy, we know its format must have been wrong.
			if (unsafeValue) throw new InvalidFeedback("Must be object", { unsafeValue });

			// Check requiredness.
			if (this.required) throw new InvalidFeedback("Required", { unsafeValue });

			// Return empty object.
			return super.validate(null);
		}

		// Validate the object against `this.props`
		let changed = false;
		let invalid = false;
		const safeObj: MutableObject = {};
		const details: MutableObject<Feedback> = {};
		const propSchemas = Object.entries(this.props);
		for (const [key, validator] of propSchemas) {
			const unsafeProp = unsafeObj[key];
			if (unsafeProp === undefined && options?.partial) continue;
			try {
				const safeProp = validator.validate(unsafeProp);

				// Set the prop.
				if (safeProp !== unsafeProp) changed = true;
				safeObj[key] = safeProp;
			} catch (feedback: unknown) {
				if (isFeedback(feedback)) {
					invalid = true;
					details[key] = feedback;
				}
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
