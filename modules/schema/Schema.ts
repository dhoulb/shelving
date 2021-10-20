import type { Validator } from "../util/index.js";

/**
 * SchemaOptions enforces types on the options bag that is passed into SchemaClass to create Schema.
 * - Most schemas will allow additional options but these ones are enforced.
 */
export interface SchemaOptions<T> {
	/** Title of the schema, e.g. for using as the title of a corresponding field. */
	readonly title?: string;
	/** Description of the schema, e.g. for using as a description in a corresponding field. */
	readonly description?: string;
	/** Placeholder of the schema, e.g. for using as a placeholder in a corresponding field. */
	readonly placeholder?: string;
	/** Is the schema required or not? */
	readonly required?: boolean;
	/** Additional validation function that is performed after everything else. */
	readonly validator?: (value: T) => T;
}

/**
 * Required schema has a `required: true` prop.
 */
export interface RequiredSchemaOptions {
	readonly required: true;
}

/**
 * Schema is an object instance with a `validate()` method.
 * - Type `T` represents the type of value `validate()` returns.
 * - `validate()` returns `Invalid` if value was not valid.
 */
export abstract class Schema<T = unknown> implements Validator<T> {
	/** Expose the `T` internal type of this schema. */
	readonly TYPE: T = undefined as any; // eslint-disable-line @typescript-eslint/no-explicit-any

	/** Title, e.g. for showing in fields. */
	readonly title: string = "";
	/** Description, e.g. for showing in fields. */
	readonly description: string = "";
	/** Placeholder, e.g. for showing in fields. */
	readonly placeholder: string = "";
	/** Whether schema is required, or not. */
	readonly required: boolean = false;
	/** The default value for the schema. */
	readonly value?: unknown;

	/** Additional validation function that is called after all built in validation. */
	private readonly _validator: ((value: unknown) => T) | undefined;

	constructor({ title = "", description = "", placeholder = "", required = false, validator }: SchemaOptions<T>) {
		this.title = title;
		this.description = description;
		this.placeholder = placeholder;
		this.required = required;
		if (validator) this._validator = validator as (value: unknown) => T;
	}

	/** Every schema must implement a `validate()` method. */
	validate(unsafeValue: unknown = this.value): T {
		// Call the schema's additional `validator()` function if one exists.
		return this._validator ? this._validator(unsafeValue) : (unsafeValue as T);
	}
}

/**
 * Convert a `Schema` into its resulting type (i.e. what will be returned from `validate()`)
 * @param X A `Schema` instance to extract the type from.
 */
export type SchemaType<X extends Schema> = X["TYPE"];

/**
 * Is an unknown value a `Schema` instance?
 * - This is a TypeScript assertion function, so if this function returns `true` the type is also asserted to be a `Schema`.
 */
export const isSchema = <T extends Schema>(schema: T | unknown): schema is T => schema instanceof Schema;
