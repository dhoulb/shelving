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
 * @see https://shelving.cc/schema/RequiredSchema
 */
export class RequiredSchema<T> extends ThroughSchema<T> {
	/** Delegates to the source schema, then throws `"Required"` if the result is falsy. */
	override validate(unsafeValue: unknown): T {
		const safeValue = super.validate(unsafeValue);
		if (!safeValue) throw "Required";
		return safeValue;
	}
}

/**
 * Create a `RequiredSchema` that wraps a source schema and rejects a falsy result.
 *
 * Sugar factory for `RequiredSchema`.
 *
 * @param source Source schema to wrap.
 * @example REQUIRED(STRING).validate(""); // Throws "Required"
 * @see https://shelving.cc/schema/REQUIRED
 */
export function REQUIRED<T>(source: Schema<T>): RequiredSchema<T> {
	return new RequiredSchema({ source });
}
