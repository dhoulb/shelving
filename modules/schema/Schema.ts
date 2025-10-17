import type { Data } from "../util/data.js";
import { PASSTHROUGH } from "../util/function.js";
import { getNull } from "../util/null.js";
import { getUndefined } from "../util/undefined.js";
import type { Validator } from "../util/validate.js";

/** Options allowed by a `Schema` instance. */
export type SchemaOptions = {
	/** Title of the schema, e.g. for using as the title of a corresponding field. */
	readonly title?: string | undefined;
	/** Description of the schema, e.g. for using as a description in a corresponding field. */
	readonly description?: string | undefined;
	/** Placeholder of the schema, e.g. for using as a placeholder in a corresponding field. */
	readonly placeholder?: string | undefined;
	/** Default value for the schema if `validate()` is called with an `undefined` value. */
	readonly value?: unknown;
};

/**
 * Schema is an object instance with a `validate()` method.
 * - Type `T` represents the type of value `validate()` returns.
 * - `validate()` returns `Invalid` if value was not valid.
 */
export abstract class Schema<T = unknown> implements Validator<T> {
	/** Title of the schema, e.g. for using as the title of a corresponding field. */
	readonly title: string | undefined;
	/** Description of the schema, e.g. for using as a description in a corresponding field. */
	readonly description: string | undefined;
	/** Placeholder of the schema, e.g. for using as a placeholder in a corresponding field. */
	readonly placeholder: string | undefined;
	/** Default value for the schema if `validate()` is called with an `undefined` value. */
	readonly value: unknown;

	constructor({ title, description, placeholder, value }: SchemaOptions) {
		this.title = title;
		this.description = description;
		this.placeholder = placeholder;
		this.value = value;
	}

	/** Every schema must implement a `validate()` method. */
	abstract validate(unsafeValue: unknown): T;
}

/** A set of named schemas in `{ name: schema }` format. */
export type Schemas<T extends Data = Data> = { readonly [K in keyof T]: Schema<T[K]> };

// Unknown validator always passes through its input value as `unknown`
export const UNKNOWN: Schema<unknown> = { title: "", description: "", placeholder: "", value: undefined, validate: PASSTHROUGH };

// Undefined validator always returns `undefined`
export const UNDEFINED: Schema<undefined> = { ...UNKNOWN, validate: getUndefined };

// Null validator always returns `null`
export const NULL: Schema<null> = { ...UNKNOWN, validate: getNull };
