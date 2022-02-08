import { Schema } from "./Schema.js";
import { ThroughSchema } from "./ThroughSchema.js";

/** Validate a value of a specific type or `null`. */
export class OptionalSchema<T> extends ThroughSchema<T | null> {
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
		if (unsafeValue === null || unsafeValue === undefined || unsafeValue === "" || Number.isNaN(unsafeValue)) return null;
		return super.validate(unsafeValue);
	}
}

/** Create a new optional schema from a source schema. */
export const OPTIONAL = <T>(source: Schema<T>): OptionalSchema<T> => new OptionalSchema({ source });