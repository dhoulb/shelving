import type { Sourceable } from "../util/source.js";
import type { SchemaOptions } from "./Schema.js";
import { Schema } from "./Schema.js";

/**
 * Allowed options for `ThroughSchema`.
 *
 * @see https://shelving.cc/schema/ThroughSchemaOptions
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
 * @see https://shelving.cc/schema/ThroughSchema
 */
export abstract class ThroughSchema<T> extends Schema<T> implements Sourceable<Schema<T>> {
	/** The source schema this schema passes through to. */
	readonly source: Schema<T>;
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
	 * @see https://shelving.cc/schema/ThroughSchema/validate
	 */
	validate(unsafeValue: unknown): T {
		return this.source.validate(unsafeValue);
	}
	/** Delegates to the source schema. */
	override format(value: T): string {
		return this.source.format(value);
	}
}

/**
 * Get the innermost source of a wrapper schema, or the schema itself if it is not a `ThroughSchema`.
 *
 * - Unlike `getSource()`, it only goes through `ThroughSchema` wrappers (e.g. `NullableSchema`, `OptionalSchema`), so it never leaves the schema for another kind of source.
 *
 * @param schema The schema to unwrap.
 * @returns The innermost schema that is not a `ThroughSchema`.
 * @example getSourceSchema(OPTIONAL(NULLABLE(NUMBER))) // NUMBER
 * @see https://shelving.cc/schema/getSourceSchema
 */
export function getSourceSchema(schema: Schema<unknown>): Schema<unknown> {
	let current = schema;
	while (current instanceof ThroughSchema) current = current.source;
	return current;
}
