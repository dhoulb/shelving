import { MutableObject, isObject, Data, ReadonlyObject } from "shelving/tools";
import { Feedback, InvalidFeedback, isFeedback } from "shelving/feedback";
import { Schema, SchemaOptions, RequiredOptions } from "./Schema";
import { Validators } from "./Validator";

export type ObjectOptions<T extends ReadonlyObject | null> = SchemaOptions & {
	readonly props: Validators<T & ReadonlyObject>;
	readonly value?: Partial<T> | null;
	readonly required?: boolean;
};

/**
 * Schema that defines a valid object.
 *
 * Checks that value is an object, and optionally matches the format or items specific contents in the object.
 * Only returns a new instance of the object if it changes (for immutability).
 */
export class ObjectSchema<T extends ReadonlyObject | null> extends Schema<Readonly<T>> {
	readonly value: Partial<T> | null = null;

	/**
	 * Describe the format for individual props in the object.
	 * JSON Schema calls this `properties`, we call it `props` to match React and because it's shorter.
	 */
	readonly props: Validators<T & ReadonlyObject>;

	constructor({ value = null, props, ...options }: ObjectOptions<T>) {
		super(options);
		this.value = value;
		this.props = props;
	}

	validate(unsafeValue: unknown = this.value): Readonly<T> {
		// Coorce.
		const unsafeObj = isObject(unsafeValue) ? unsafeValue : null;

		// Null means 'no object'
		if (unsafeObj === null) {
			// If original input was truthy, we know its format must have been wrong.
			if (unsafeValue) throw new InvalidFeedback("Must be object");

			// Check requiredness.
			if (this.required) throw new InvalidFeedback("Required");

			// Return.
			return null as T;
		}

		// Validate the object against `this.props`
		let changed = false;
		let invalid = false;
		const safeObj: MutableObject = {};
		const details: MutableObject<Feedback> = {};
		const propSchemas = Object.entries(this.props);
		for (const [key, validator] of propSchemas) {
			try {
				const unsafeProp = unsafeObj[key];
				const safeProp = validator.validate(unsafeProp);
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

		// Return immuatably (return output if changes were made, or exact input otherwise).
		return (changed ? safeObj : unsafeObj) as T;
	}
}

/** Shortcuts for ObjectSchema. */
export const object: {
	<T extends ReadonlyObject | null>(options: ObjectOptions<T> & RequiredOptions): ObjectSchema<T>;
	<T extends ReadonlyObject | null>(options: ObjectOptions<T>): ObjectSchema<T | null>;
	required<T extends ReadonlyObject>(props: Validators<T>): ObjectSchema<T>;
	optional<T extends ReadonlyObject | null>(props: Validators<T & ReadonlyObject>): ObjectSchema<T | null>;
} = Object.assign(<T extends ReadonlyObject | null>(options: ObjectOptions<T>): ObjectSchema<T> => new ObjectSchema<T>(options), {
	required: <T extends ReadonlyObject>(props: Validators<T>): ObjectSchema<T> => new ObjectSchema<T>({ props, required: true, value: {} }),
	optional: <T extends ReadonlyObject | null>(props: Validators<T & Data>): ObjectSchema<T | null> => new ObjectSchema<T | null>({ props, required: false }),
});
