import type { Validatable } from "../util/validate.js";

/** Options allowed by a `Schema` instance. */
export type SchemaOptions = {
	/** Title of the schema, e.g. for using as the title of a corresponding field. */
	readonly title?: string | null;
	/** Description of the schema, e.g. for using as a description in a corresponding field. */
	readonly description?: string | null;
	/** Placeholder of the schema, e.g. for using as a placeholder in a corresponding field. */
	readonly placeholder?: string | null;
	/** Default value for the schema if `validate()` is called with an `undefined` value. */
	readonly value?: unknown;
};

/**
 * Schema is an object instance with a `validate()` method.
 * - Type `T` represents the type of value `validate()` returns.
 * - `validate()` returns `Invalid` if value was not valid.
 */
export abstract class Schema<T extends unknown = unknown> implements Validatable<T> {
	/** Title of the schema, e.g. for using as the title of a corresponding field. */
	readonly title: string | null;
	/** Description of the schema, e.g. for using as a description in a corresponding field. */
	readonly description: string | null;
	/** Placeholder of the schema, e.g. for using as a placeholder in a corresponding field. */
	readonly placeholder: string | null;
	/** Default value for the schema if `validate()` is called with an `undefined` value. */
	readonly value: unknown;

	constructor({ title = null, description = null, placeholder = null, value }: SchemaOptions) {
		this.title = title;
		this.description = description;
		this.placeholder = placeholder;
		this.value = value;
	}

	/** Every schema must implement a `validate()` method. */
	abstract validate(unsafeValue: unknown): T;
}
