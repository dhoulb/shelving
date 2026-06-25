import type { Schema } from "./Schema.js";
import { ThroughSchema, type ThroughSchemaOptions } from "./ThroughSchema.js";

/**
 * Allowed options for `OptionalSchema`.
 *
 * @see https://shelving.cc/schema/OptionalSchemaOptions
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
 * @see https://shelving.cc/schema/OptionalSchema
 */
export class OptionalSchema<T> extends ThroughSchema<T | undefined> {
	/** Default value for an `OptionalSchema` is always `undefined` (default value is only used when a value is `undefined`, so otherwise `undefined` could never be returned as a value). */
	declare readonly value: undefined;
	constructor(options: OptionalSchemaOptions<T>) {
		super({ ...options, value: undefined });
	}
	/** Returns `undefined` for `undefined` input; otherwise delegates to the source schema. */
	override validate(unsafeValue: unknown): T | undefined {
		if (unsafeValue === undefined) return undefined;
		return super.validate(unsafeValue);
	}
	/** Formats `undefined` as `` `No ${one}` ``; otherwise delegates to the source schema. */
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
 * @example OPTIONAL(STRING).validate(undefined); // Returns undefined
 * @see https://shelving.cc/schema/OPTIONAL
 */
export function OPTIONAL<T>(source: Schema<T>): OptionalSchema<T> {
	return new OptionalSchema({ source });
}
