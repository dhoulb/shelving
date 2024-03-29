import type { Schema, SchemaOptions } from "./Schema.js";
import { ThroughSchema } from "./ThroughSchema.js";

/** Allowed options for `OptionalSchema` */
export interface OptionalSchemaOptions<T> extends SchemaOptions {
	readonly source: Schema<T>;
	readonly value?: T | null;
}

/** Validate a value of a specific type or `null`. */
export class OptionalSchema<T> extends ThroughSchema<T | null> {
	declare readonly value: T | null;
	constructor({ value = null, ...options }: OptionalSchemaOptions<T>) {
		super({ value, ...options });
	}
	override validate(unsafeValue: unknown = this.value): T | null {
		if (unsafeValue === null || unsafeValue === undefined || unsafeValue === "" || Number.isNaN(unsafeValue)) return null;
		return super.validate(unsafeValue);
	}
}

/** Create a new optional schema from a source schema. */
export const OPTIONAL = <T>(source: Schema<T>): OptionalSchema<T> => new OptionalSchema({ source });
