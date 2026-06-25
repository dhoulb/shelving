import type { Schema } from "./Schema.js";
import { ThroughSchema, type ThroughSchemaOptions } from "./ThroughSchema.js";

/**
 * Allowed options for `NullableSchema`.
 *
 * @see https://shelving.cc/schema/NullableSchemaOptions
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
 * @see https://shelving.cc/schema/NullableSchema
 */
export class NullableSchema<T> extends ThroughSchema<T | null> {
	declare readonly value: T | null;
	constructor({ value = null, ...options }: NullableSchemaOptions<T>) {
		super({ value, ...options });
	}
	/** Returns `null` for empty-ish input (`null`, `undefined`, `""`, `NaN`); otherwise delegates to the source schema. */
	override validate(unsafeValue: unknown = this.value): T | null {
		if (unsafeValue === null || unsafeValue === undefined || unsafeValue === "" || Number.isNaN(unsafeValue)) return null;
		return super.validate(unsafeValue);
	}
	/** Formats `null` as `` `No ${one}` ``; otherwise delegates to the source schema. */
	override format(value: T | null): string {
		return value === null ? `No ${this.source.one}` : super.format(value);
	}
}

/**
 * Create a `NullableSchema` that wraps a source schema and also allows `null`.
 *
 * Sugar factory for `NullableSchema`.
 *
 * @param source Source schema to wrap.
 * @example NULLABLE(STRING).validate(""); // Returns null
 * @see https://shelving.cc/schema/NULLABLE
 */
export function NULLABLE<T>(source: Schema<T>): NullableSchema<T> {
	return new NullableSchema({ source });
}
