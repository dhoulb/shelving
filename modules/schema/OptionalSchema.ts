import type { Schema } from "./Schema.js";
import { ThroughSchema, type ThroughSchemaOptions } from "./ThroughSchema.js";

/**
 * Allowed options for `OptionalSchema`.
 *
 * @see https://dhoulb.github.io/shelving/schema/OptionalSchema/OptionalSchemaOptions
 */
export interface OptionalSchemaOptions<T> extends ThroughSchemaOptions<T | undefined> {
	/** Default value is always `undefined` (the default is only used when the input is `undefined`, so otherwise `undefined` could never be returned). */
	readonly value?: undefined;
}

/**
 * Schema that wraps a source schema and additionally allows `undefined`.
 *
 * - `undefined` input validates to `undefined` instead of being passed to the source schema.
 * - When used with `validateData()` this means the prop can be silently skipped.
 * - Any other value is delegated to the source schema for validation.
 *
 * @example
 *  const schema = new OptionalSchema({ source: STRING });
 *  schema.validate(undefined); // Returns undefined
 *  schema.validate("abc"); // Returns "abc"
 *
 * @see https://dhoulb.github.io/shelving/schema/OptionalSchema/OptionalSchema
 */
export class OptionalSchema<T> extends ThroughSchema<T | undefined> {
	/** Default value for an `OptionalSchema` is always `undefined` (default value is only used when a value is `undefined`, so otherwise `undefined` could never be returned as a value). */
	declare readonly value: undefined;
	/**
	 * Create a new `OptionalSchema`.
	 */
	constructor(options: OptionalSchemaOptions<T>) {
		super({ ...options, value: undefined });
	}
	/**
	 * Validate an unknown value, returning `undefined` for `undefined` input or delegating to the source schema.
	 *
	 * @param unsafeValue Value to validate.
	 * @returns The valid value of type `T`, or `undefined` when the input is `undefined`.
	 * @throws `string` error message if the source schema rejects the value.
	 *
	 * @example
	 *  OPTIONAL(STRING).validate(undefined); // Returns undefined
	 *
	 * @see https://dhoulb.github.io/shelving/schema/OptionalSchema/OptionalSchema/validate
	 */
	override validate(unsafeValue: unknown): T | undefined {
		if (unsafeValue === undefined) return undefined;
		return super.validate(unsafeValue);
	}
	/**
	 * Format an optional value as a human-readable string for display.
	 *
	 * @param value Value to format, or `undefined`.
	 * @returns The formatted string, or `` `No ${one}` `` when the value is `undefined`.
	 *
	 * @example
	 *  OPTIONAL(STRING).format(undefined); // Returns "No string"
	 *
	 * @see https://dhoulb.github.io/shelving/schema/OptionalSchema/OptionalSchema/format
	 */
	override format(value: T | undefined): string {
		return value === undefined ? `No ${this.source.one}` : super.format(value);
	}
}

/**
 * Create an `OptionalSchema` that wraps a source schema and also allows `undefined`.
 *
 * Sugar factory for `OptionalSchema`.
 *
 * @param source Source schema to wrap.
 *
 * @example
 *  const schema = OPTIONAL(STRING);
 *  schema.validate(undefined); // Returns undefined
 *
 * @see https://dhoulb.github.io/shelving/schema/OptionalSchema/OPTIONAL
 */
export function OPTIONAL<T>(source: Schema<T>): OptionalSchema<T> {
	return new OptionalSchema({ source });
}
