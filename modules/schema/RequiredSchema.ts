import type { Schema } from "./Schema.js";
import { ThroughSchema } from "./ThroughSchema.js";

/**
 * Schema that wraps a source schema but rejects a falsy result.
 *
 * - Delegates to the source schema, then throws `"Required"` if the validated value is falsy.
 *
 * @example
 *  const schema = new RequiredSchema({ source: STRING });
 *  schema.validate("abc"); // Returns "abc"
 *  schema.validate(""); // Throws "Required"
 *
 * @see https://dhoulb.github.io/shelving/schema/RequiredSchema/RequiredSchema
 */
export class RequiredSchema<T> extends ThroughSchema<T> {
	/**
	 * Validate an unknown value via the source schema and reject a falsy result.
	 *
	 * @param unsafeValue Value to validate.
	 * @returns The valid (truthy) value of type `T`.
	 * @throws `string` `"Required"` if the validated value is falsy, or any error message thrown by the source schema.
	 *
	 * @example
	 *  REQUIRED(STRING).validate(""); // Throws "Required"
	 *
	 * @see https://dhoulb.github.io/shelving/schema/RequiredSchema/RequiredSchema/validate
	 */
	override validate(unsafeValue: unknown): T {
		const safeValue = super.validate(unsafeValue);
		if (!safeValue) throw "Required";
		return safeValue;
	}
}

/**
 * Create a `RequiredSchema` that wraps a source schema and rejects a falsy result.
 *
 * *Sugar factory for [`RequiredSchema`](/schema/RequiredSchema).*
 *
 * @param source Source schema to wrap.
 * @returns A `RequiredSchema` wrapping `source`.
 *
 * @example
 *  const schema = REQUIRED(STRING);
 *  schema.validate(""); // Throws "Required"
 *
 * @see https://dhoulb.github.io/shelving/schema/RequiredSchema/REQUIRED
 */
export function REQUIRED<T>(source: Schema<T>): RequiredSchema<T> {
	return new RequiredSchema({ source });
}
