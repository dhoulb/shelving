import type { Sourceable } from "../util/source.js";
import type { Validator } from "../util/validate.js";
import type { SchemaOptions } from "./Schema.js";
import { Schema } from "./Schema.js";

/** Allowed options for `ThroughSchema` */
export interface ThroughSchemaOptions<T> extends SchemaOptions {
	source: Validator<T>;
}

/** Schema that passes through to a source schema. */
export abstract class ThroughSchema<T> extends Schema<T> implements Sourceable<Validator<T>> {
	readonly source: Validator<T>;
	constructor({ source, ...options }: ThroughSchemaOptions<T>) {
		super(source instanceof Schema ? { ...source, ...options } : options);
		this.source = source;
	}
	validate(unsafeValue: unknown): T {
		return this.source.validate(unsafeValue);
	}
}
