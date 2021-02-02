import { MutableObject, isObject, ImmutableObject, DeepPartial, convertObject } from "../object";
import { Data } from "../data";
import { Feedback, InvalidFeedback, isFeedback } from "../feedback";
import { Schema, SchemaOptions, RequiredOptions } from "./Schema";
import { Validator, Validators } from "./Validator";
import { withPartial } from "./undefined";

export type ObjectOptions<T extends ImmutableObject | null> = SchemaOptions & {
	readonly props: Validators<T & ImmutableObject>;
	readonly value?: Partial<T> | null;
	readonly required?: boolean;
};

/**
 * Schema that defines a valid object.
 *
 * Checks that value is an object, and optionally matches the format or items specific contents in the object.
 * Only returns a new instance of the object if it changes (for immutability).
 */
export class ObjectSchema<T extends ImmutableObject | null> extends Schema<T> implements Validator<T> {
	readonly value: Partial<T> | null = null;

	/**
	 * Describe the format for individual props in the object.
	 * JSON Schema calls this `properties`, we call it `props` to match React and because it's shorter.
	 */
	readonly props: Validators<T & ImmutableObject>;

	constructor({ value = null, props, ...options }: ObjectOptions<T>) {
		super(options);
		this.value = value;
		this.props = props;
	}

	validate(unsafeValue: unknown = this.value): T {
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
		let notFound = 0;
		const safeObj: MutableObject = {};
		const details: MutableObject<Feedback> = {};
		const propSchemas = Object.entries(this.props);
		for (const [key, validator] of propSchemas) {
			const exists = key in unsafeObj;
			if (!exists) notFound++;
			const unsafeProp = exists ? unsafeObj[key] : undefined;
			try {
				const safeProp = validator.validate(unsafeProp);

				// Don't add this prop to `safeObj` if it didn't exist in `unsafeObj` and is undefined.
				// This allows lets partial objects pass through validation without every prop being set to `undefined`
				// The validator above would have thrown if `undefined` is not an allowed value.
				if (!exists && safeProp === undefined) continue;

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
		if (Object.keys(unsafeObj).length + notFound > propSchemas.length) changed = true;

		// If any Schema threw Invalid, return an Invalids.
		if (invalid) throw new InvalidFeedback("Invalid format", details);

		// Return immuatably (return output if changes were made, or exact input otherwise).
		return (changed ? safeObj : unsafeObj) as T;
	}

	/** Get a partial validator for this object (i.e. validate an object where the props are allowed to be unset or an explicit `undefined`). */
	get partial(): Validator<DeepPartial<T & ImmutableObject>> {
		// Lazy created and cached.
		return (this._partial ||= new ObjectSchema({
			props: convertObject(
				this.props,
				withPartial as (
					value: Validators<T & ImmutableObject<unknown>>[string],
					key: string,
				) => Validators<DeepPartial<T & ImmutableObject<unknown>>>[string],
			),
		}));
	}
	private _partial?: Validator<DeepPartial<T & ImmutableObject>>;
}

/** Shortcuts for ObjectSchema. */
export const object: {
	<T extends ImmutableObject>(options: ObjectOptions<T> & RequiredOptions): ObjectSchema<T>;
	<T extends ImmutableObject | null>(options: ObjectOptions<T>): ObjectSchema<T | null>;
	required<T extends ImmutableObject>(props: Validators<T>): ObjectSchema<T>;
	optional<T extends ImmutableObject | null>(props: Validators<T & ImmutableObject>): ObjectSchema<T | null>;
} = Object.assign(<T extends ImmutableObject | null>(options: ObjectOptions<T>): ObjectSchema<T> => new ObjectSchema<T>(options), {
	required: <T extends ImmutableObject>(props: Validators<T>): ObjectSchema<T> => new ObjectSchema<T>({ props, required: true, value: {} }),
	optional: <T extends ImmutableObject | null>(props: Validators<T & Data>): ObjectSchema<T | null> => new ObjectSchema<T | null>({ props, required: false }),
});
