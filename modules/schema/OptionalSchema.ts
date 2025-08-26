import type { Schema } from "./Schema.js";
import { ThroughSchema } from "./ThroughSchema.js";

/**
 * Validate a property in an optional way, i.e. it can be the value, or `undefined`
 * - If the prop is `undefined`, then `undefined` is returned.
 * - When used with `validateData()` this means the prop can be silently skipped.
 */

export class OptionalSchema<T> extends ThroughSchema<T | undefined> {
	override validate(unsafeValue: unknown): T | undefined {
		if (unsafeValue === undefined) return undefined;
		return super.validate(unsafeValue);
	}
}
/** Make a property of a set of data optional, i.e. it can be the value or `undefined` */

export const OPTIONAL = <T>(source: Schema<T>): OptionalSchema<T> => new OptionalSchema({ source });
