import type { Schema } from "./Schema.js";
import { ThroughSchema, type ThroughSchemaOptions } from "./ThroughSchema.js";

/**
 * Options for a [`NullableSchema`](/schema/NullableSchema).
 *
 * @see https://dhoulb.github.io/shelving/schema/NullableSchema/NullableSchemaOptions
 */
export interface NullableSchemaOptions<T> extends ThroughSchemaOptions<T | null> {
	/**
	 * Default value used when the input is `undefined`.
	 * @default null
	 */
	readonly value?: T | null;
}

/**
 * Schema that wraps a source schema and additionally allows `null`.
 *
 * - Empty-ish inputs (`null`, `undefined`, `""`, `NaN`) validate to `null` instead of being passed to the source schema.
 * - Any other value is delegated to the source schema for validation.
 *
 * @example
 *  const schema = new NullableSchema({ source: STRING });
 *  schema.validate(""); // Returns null
 *  schema.validate("abc"); // Returns "abc"
 *
 * @see https://dhoulb.github.io/shelving/schema/NullableSchema/NullableSchema
 */
export class NullableSchema<T> extends ThroughSchema<T | null> {
	declare readonly value: T | null;
	/**
	 * Create a new `NullableSchema`.
	 *
	 * @param options Options for the schema, including the `source` schema to wrap.
	 * @param options.value Default value used when the input is `undefined` (defaults to `null`).
	 */
	constructor({ value = null, ...options }: NullableSchemaOptions<T>) {
		super({ value, ...options });
	}
	/**
	 * Validate an unknown value, returning `null` for empty-ish input or delegating to the source schema.
	 *
	 * @param unsafeValue Value to validate (defaults to this schema's `value`).
	 * @returns The valid value of type `T`, or `null` for empty-ish input.
	 * @throws `string` error message if the source schema rejects the value.
	 *
	 * @example
	 *  NULLABLE(STRING).validate(""); // Returns null
	 *
	 * @see https://dhoulb.github.io/shelving/schema/NullableSchema/NullableSchema/validate
	 */
	override validate(unsafeValue: unknown = this.value): T | null {
		if (unsafeValue === null || unsafeValue === undefined || unsafeValue === "" || Number.isNaN(unsafeValue)) return null;
		return super.validate(unsafeValue);
	}
	/**
	 * Format a nullable value as a human-readable string for display.
	 *
	 * @param value Value to format, or `null`.
	 * @returns The formatted string, or `` `No ${one}` `` when the value is `null`.
	 *
	 * @example
	 *  NULLABLE(STRING).format(null); // Returns "No string"
	 *
	 * @see https://dhoulb.github.io/shelving/schema/NullableSchema/NullableSchema/format
	 */
	override format(value: T | null): string {
		return value === null ? `No ${this.source.one}` : super.format(value);
	}
}

/**
 * Create a `NullableSchema` that wraps a source schema and also allows `null`.
 *
 * Sugar factory for [`NullableSchema`](/schema/NullableSchema).
 *
 * @param source Source schema to wrap.
 * @returns A `NullableSchema` wrapping `source`.
 *
 * @example
 *  const schema = NULLABLE(STRING);
 *  schema.validate(""); // Returns null
 *
 * @see https://dhoulb.github.io/shelving/schema/NullableSchema/NULLABLE
 */
export function NULLABLE<T>(source: Schema<T>): NullableSchema<T> {
	return new NullableSchema({ source });
}
