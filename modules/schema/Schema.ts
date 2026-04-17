import type { Data } from "../util/data.js";
import { formatValue } from "../util/format.js";
import { PASSTHROUGH } from "../util/function.js";
import { getNull } from "../util/null.js";
import { getUndefined } from "../util/undefined.js";
import type { Validator } from "../util/validate.js";

/** Options allowed by a `Schema` instance. */
export type SchemaOptions = {
	/** String for one of this thing, e.g. `product` or `item` or `sheep` */
	readonly one?: string;
	/** String for several of this thing, e.g. `products` or `items` or `sheep` (defaults to `one` + "s") */
	readonly many?: string;
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
	/** String for one of this thing, e.g. `product` or `item` or `sheep` */
	readonly one: string;
	/** String for several of this thing, e.g. `products` or `items` or `sheep` (defaults to `one` + "s") */
	readonly many: string;
	/** Title of the schema, e.g. for using as the title of a corresponding field. */
	readonly title: string | undefined;
	/** Description of the schema, e.g. for using as a description in a corresponding field. */
	readonly description: string | undefined;
	/** Placeholder of the schema, e.g. for using as a placeholder in a corresponding field. */
	readonly placeholder: string | undefined;
	/** Default value for the schema if `validate()` is called with an `undefined` value. */
	readonly value: unknown;

	constructor({ one = "value", many = `${one}s`, title, description, placeholder, value }: SchemaOptions) {
		this.one = one;
		this.many = many;
		this.title = title;
		this.description = description;
		this.placeholder = placeholder;
		this.value = value;
	}

	/** Every schema must implement a `validate()` method. */
	abstract validate(unsafeValue: unknown): T;

	/** Format a validated value of this type as a string. */
	format(value: T): string {
		return formatValue(value, undefined, this.format);
	}
}

/** Extract the type from a schema. */
export type SchemaType<X> = X extends Schema<infer Y> ? Y : never;

/** A set of named schemas in `{ name: schema }` format. */
export type Schemas<T extends Data = Data> = { readonly [K in keyof T]: Schema<T[K]> };

// Unknown validator always passes through its input value as `unknown`
export const UNKNOWN: Schema<unknown> = {
	one: "value",
	many: "values",
	title: "Value",
	description: undefined,
	placeholder: undefined,
	value: undefined,
	validate: PASSTHROUGH,
	format: formatValue,
};

// Undefined validator always returns `undefined`
export const UNDEFINED: Schema<undefined> = {
	one: "none",
	many: "none",
	title: "None",
	description: undefined,
	placeholder: undefined,
	value: undefined,
	validate: getUndefined,
	format: () => formatValue(undefined),
};

// Null validator always returns `null`
export const NULL: Schema<null> = {
	one: "none",
	many: "none",
	title: "None",
	description: undefined,
	placeholder: undefined,
	value: null,
	validate: getNull,
	format: () => formatValue(null),
};
