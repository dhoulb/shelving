import type { Sourceable } from "../util/source.js";
import type { SchemaOptions } from "./Schema.js";
import { Schema } from "./Schema.js";

/**
 * Allowed options for `ThroughSchema`.
 *
 * @see https://dhoulb.github.io/shelving/schema/ThroughSchema/ThroughSchemaOptions
 */
export interface ThroughSchemaOptions<T> extends SchemaOptions {
	/** The source schema this schema passes through to. */
	source: Schema<T>;
}

/**
 * Schema that wraps and passes through to a source schema, used as a base for schemas that augment another schema's behaviour (e.g. `NullableSchema`, `OptionalSchema`, `RequiredSchema`).
 *
 * @example
 *  class WrapSchema<T> extends ThroughSchema<T> {} // Delegates `validate()` to `this.source`.
 * @see https://dhoulb.github.io/shelving/schema/ThroughSchema/ThroughSchema
 */
export abstract class ThroughSchema<T> extends Schema<T> implements Sourceable<Schema<T>> {
	/** The source schema this schema passes through to. */
	readonly source: Schema<T>;
	/**
	 * Create a new `ThroughSchema`.
	 */
	constructor({ source, ...options }: ThroughSchemaOptions<T>) {
		super(source instanceof Schema ? { ...source, ...options } : options);
		this.source = source;
	}
	/**
	 * Validate an unknown input value by passing it through to the source schema.
	 *
	 * @param unsafeValue The unknown input value to validate.
	 * @returns The valid value of type `T`.
	 * @throws `string` error message if the value is invalid.
	 * @example schema.validate(input) // Delegates to source schema.
	 * @see https://dhoulb.github.io/shelving/schema/ThroughSchema/ThroughSchema/validate
	 */
	validate(unsafeValue: unknown): T {
		return this.source.validate(unsafeValue);
	}
	/**
	 * Format a valid value by passing it through to the source schema.
	 *
	 * @param value The valid value to format.
	 * @returns The value formatted as a human-readable string.
	 * @example schema.format(value) // Delegates to source schema.
	 * @see https://dhoulb.github.io/shelving/schema/ThroughSchema/ThroughSchema/format
	 */
	override format(value: T): string {
		return this.source.format(value);
	}
}
