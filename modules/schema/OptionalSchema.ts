import type { Schema } from "./Schema.js";
import { ThroughSchema, type ThroughSchemaOptions } from "./ThroughSchema.js";

export interface OptionalSchemaOptions<T> extends ThroughSchemaOptions<T | undefined> {
	/** Default value for an `OptionalSchema` can always `undefined` */
	readonly value?: undefined;
}

/**
 * Validate a property in an optional way, i.e. it can be the value, or `undefined`
 * - If the prop is `undefined`, then `undefined` is returned.
 * - When used with `validateData()` this means the prop can be silently skipped.
 */
export class OptionalSchema<T> extends ThroughSchema<T | undefined> {
	/** Default value for an `OptionalSchema` is always `undefined` (default value is only used when a value is `undefined`, so otherwise `undefined` could never be returned as a value). */
	declare readonly value: undefined;
	constructor(options: OptionalSchemaOptions<T>) {
		super({ ...options, value: undefined });
	}
	override validate(unsafeValue: unknown): T | undefined {
		if (unsafeValue === undefined) return undefined;
		return super.validate(unsafeValue);
	}
}

/** Make a property of a set of data optional, i.e. it can be the value or `undefined` */
export const OPTIONAL = <T>(source: Schema<T>): OptionalSchema<T> => new OptionalSchema({ source });
