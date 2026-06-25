import type { Data } from "../util/data.js";
import { formatValue } from "../util/format.js";
import { PASSTHROUGH } from "../util/function.js";
import { getNull } from "../util/null.js";
import { getUndefined } from "../util/undefined.js";
import type { Validator } from "../util/validate.js";

/**
 * Options allowed by a `Schema` instance.
 *
 * @see https://shelving.cc/schema/SchemaOptions
 */
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
 * Schema is an object instance with a `validate()` method that converts unknown input into a known, valid type `T`.
 * - Type `T` represents the type of value `validate()` returns.
 * - `validate()` throws a `string` error message if the value was not valid.
 *
 * @example
 *  class CustomSchema extends Schema<string> {
 *  	validate(unsafeValue: unknown): string {
 *  		if (typeof unsafeValue !== "string") throw "Must be string";
 *  		return unsafeValue;
 *  	}
 *  }
 * @see https://shelving.cc/schema/Schema
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

	/**
	 * Validate an unknown input value and return a known, valid value of type `T`.
	 *
	 * @param unsafeValue The unknown input value to validate.
	 * @returns The valid value of type `T`.
	 * @throws `string` error message if the value is invalid.
	 * @example schema.validate("abc") // "abc"
	 * @see https://shelving.cc/schema/Schema/validate
	 */
	abstract validate(unsafeValue: unknown): T;

	/**
	 * Format a validated value of this type as a string for display.
	 *
	 * @param value The valid value to format.
	 * @returns The value formatted as a human-readable string.
	 * @example schema.format(value) // "Hello!"
	 * @see https://shelving.cc/schema/Schema/format
	 */
	format(value: T): string {
		return formatValue(value, undefined, this.format);
	}
}

/**
 * Extract the validated value type `T` from a `Schema<T>`.
 *
 * @example type V = SchemaType<typeof STRING> // string
 * @see https://shelving.cc/schema/SchemaType
 */
export type SchemaType<X> = X extends Schema<infer Y> ? Y : never;

/**
 * A set of named schemas in `{ name: schema }` format.
 *
 * @see https://shelving.cc/schema/Schemas
 */
export type Schemas<T extends Data = Data> = { readonly [K in keyof T]: Schema<T[K]> };

/**
 * Unknown validator that always passes through its input value as `unknown`.
 *
 * @example UNKNOWN.validate(anything) // anything
 * @see https://shelving.cc/schema/UNKNOWN
 */
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

/**
 * Undefined validator that always returns `undefined`.
 *
 * @example UNDEFINED.validate(anything) // undefined
 * @see https://shelving.cc/schema/UNDEFINED
 */
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

/**
 * Null validator that always returns `null`.
 *
 * @example NULL.validate(anything) // null
 * @see https://shelving.cc/schema/NULL
 */
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
