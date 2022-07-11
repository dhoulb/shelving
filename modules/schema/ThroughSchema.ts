import type { Class } from "../util/class.js";
import { AssertionError } from "../error/AssertionError.js";
import { Schema } from "./Schema.js";

export abstract class ThroughSchema<T> extends Schema<T> {
	readonly source: Schema<T>;
	constructor({ source, title = source.title, description = source.description, placeholder = source.placeholder }: ConstructorParameters<typeof Schema>[0] & { source: Schema<T> }) {
		super({ title, description, placeholder });
		this.source = source;
	}
	validate(unsafeValue: unknown): T {
		return this.source.validate(unsafeValue);
	}
}

/** Find a possible source schema in a schema (if it exists). */
export function getOptionalSourceSchema<X extends Schema>(schema: Schema, type: Class<X>): X | undefined {
	if (schema instanceof type) return schema as X;
	if (schema instanceof ThroughSchema) return getSourceSchema(schema.source, type);
}

/** Find a source schema in a schema. */
export function getSourceSchema<X extends Schema>(schema: Schema, type: Class<X>): X {
	const source = getOptionalSourceSchema(schema, type);
	if (!source) throw new AssertionError(`Source schema "${type.name}" not found`, schema);
	return source;
}
