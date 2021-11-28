import { Schema } from "./Schema.js";
import { ThroughSchema } from "./ThroughSchema.js";

/** Validate a value of a specific type or `null`. */
export class NullableSchema<T> extends ThroughSchema<T | null> {
	readonly value: T | null = null;
	constructor({
		value = null,
		...rest
	}: ConstructorParameters<typeof Schema>[0] & {
		source: Schema<T>;
		value?: T | null;
	}) {
		super(rest);
		this.value = value;
	}
	override validate(unsafeValue: unknown = this.value): T | null {
		if (unsafeValue === null) return null;
		return super.validate(unsafeValue);
	}
}

/** Create a new nullable schema from a source schema. */
export const NULLABLE = <T>(source: Schema<T>): NullableSchema<T> => new NullableSchema({ source });
