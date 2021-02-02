import { Validator } from "./Validator";

/**
 * SchemaOptions enforces types on the options bag that is passed into SchemaClass to create Schema.
 * - Most schemas will allow additional options but these ones are enforced.
 */
export interface SchemaOptions {
	/** Title of the schema, e.g. for using as the title of a corresponding field. */
	readonly title?: string;
	/** Description of the schema, e.g. for using as a description in a corresponding field. */
	readonly description?: string;
	/** Placeholder of the schema, e.g. for using as a placeholder in a corresponding field. */
	readonly placeholder?: string;
	/** Is the schema required or not? */
	readonly required?: boolean;
}

/**
 * Required schema has a `required: true` prop.
 */
export interface RequiredOptions {
	/** This schema is possibly required. */
	readonly required: true;
}

/**
 * Schema is an object instance with a `validate()` method.
 * - Type `T` represents the type of value `validate()` returns.
 * - `validate()` returns `Invalid` if value was not valid.
 */
export abstract class Schema<T = unknown> implements Validator<T> {
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

	constructor({ title = "", description = "", placeholder = "", required = false }: SchemaOptions) {
		this.title = title;
		this.description = description;
		this.placeholder = placeholder;
		this.required = required;
	}

	/** Every schema must implement a `validate()` method. */
	abstract validate(unsafeValue?: unknown): T;
}

/**
 * Convert a `Schema` into its resulting type (i.e. what will be returned from `validate()`)
 * @param X A `Schema` instance to extract the type from.
 */
export type SchemaType<X extends Schema> = ReturnType<X["validate"]>;

/**
 * Is an unknown value a `Schema` instance?
 * - This is a TypeScript assertion function, so if this function returns `true` the type is also asserted to be a `Schema`.
 */
export const isSchema = <T extends Schema>(schema: T | unknown): schema is T => schema instanceof Schema;
