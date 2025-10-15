import type { Schema } from "./Schema.js";
import { ThroughSchema, type ThroughSchemaOptions } from "./ThroughSchema.js";

/** Allowed options for `NullableSchema` */
export interface NullableSchemaOptions<T> extends ThroughSchemaOptions<T | null> {
	/** Default value (defaults to `null`). */
	readonly value?: T | null;
}

/** Validate a value of a specific type or `null`. */
export class NullableSchema<T> extends ThroughSchema<T | null> {
	declare readonly value: T | null;
	constructor({ value = null, ...options }: NullableSchemaOptions<T>) {
		super({ value, ...options });
	}
	override validate(unsafeValue: unknown = this.value): T | null {
		if (unsafeValue === null || unsafeValue === undefined || unsafeValue === "" || Number.isNaN(unsafeValue)) return null;
		return super.validate(unsafeValue);
	}
}

/** Create a new nullable schema from a source schema. */
export const NULLABLE = <T>(source: Schema<T>): NullableSchema<T> => new NullableSchema({ source });
