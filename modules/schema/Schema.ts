import type { Validatable } from "../util/validate.js";

/**
 * Schema is an object instance with a `validate()` method.
 * - Type `T` represents the type of value `validate()` returns.
 * - `validate()` returns `Invalid` if value was not valid.
 */
export abstract class Schema<T extends unknown = unknown> implements Validatable<T> {
	/** Title, e.g. for showing in fields. */
	readonly title: string;
	/** Description, e.g. for showing in fields. */
	readonly description: string;
	/** Placeholder, e.g. for showing in fields. */
	readonly placeholder: string;
	/** Default value. */
	readonly value: unknown;

	constructor({
		title = "",
		description = "",
		placeholder = "",
	}: {
		/** Title of the schema, e.g. for using as the title of a corresponding field. */
		readonly title?: string;
		/** Description of the schema, e.g. for using as a description in a corresponding field. */
		readonly description?: string;
		/** Placeholder of the schema, e.g. for using as a placeholder in a corresponding field. */
		readonly placeholder?: string;
	}) {
		this.title = title;
		this.description = description;
		this.placeholder = placeholder;
	}

	/** Every schema must implement a `validate()` method. */
	abstract validate(unsafeValue: unknown): T;
}
