import type { Class } from "../util/index.js";
import { AssertionError } from "../error/index.js";
import { Schema } from "./Schema.js";

export abstract class ThroughSchema<T> extends Schema<T> {
	readonly source: Schema<T>;
	constructor({
		source,
		title = source.title,
		description = source.description,
		placeholder = source.placeholder,
	}: ConstructorParameters<typeof Schema>[0] & { source: Schema<T> }) {
		super({ title, description, placeholder });
		this.source = source;
	}
	validate(unsafeValue: unknown): T {
		return this.source.validate(unsafeValue);
	}
}

/** Find a specific source schema in a schema. */
export function findSourceSchema<X extends Schema>(schema: Schema, type: Class<X>): X {
	if (schema instanceof type) return schema as X;
	if (schema instanceof ThroughSchema) return findSourceSchema(schema.source, type);
	throw new AssertionError(`Source schema "${type.name}" not found`, schema);
}
