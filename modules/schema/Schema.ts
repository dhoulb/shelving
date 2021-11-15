import { Validatable, validate, Validator } from "../util/index.js";

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
	/** Additional validation function that is performed after everything else. */
	readonly validator?: Validator<T>;
}

/**
 * Schema is an object instance with a `validate()` method.
 * - Type `T` represents the type of value `validate()` returns.
 * - `validate()` returns `Invalid` if value was not valid.
 */
export abstract class Schema<T = unknown> implements Validatable<T> {
	/** Title, e.g. for showing in fields. */
	readonly title: string = "";
	/** Description, e.g. for showing in fields. */
	readonly description: string = "";
	/** Placeholder, e.g. for showing in fields. */
	readonly placeholder: string = "";
	/** The default value for the schema. */
	readonly value?: unknown;
	/** Additional validation function that is called after all built in validation. */
	readonly validator: Validator<T> | undefined;

	constructor({ title = "", description = "", placeholder = "", validator }: SchemaOptions<T>) {
		this.title = title;
		this.description = description;
		this.placeholder = placeholder;
		if (validator) this.validator = validator as (value: unknown) => T;
	}

	/** Every schema must implement a `validate()` method. */
	validate(unsafeValue: unknown = this.value): T {
		// Call the schema's additional `validator()` function if one exists.
		return this.validator ? validate(unsafeValue, this.validator) : (unsafeValue as T);
	}
}
