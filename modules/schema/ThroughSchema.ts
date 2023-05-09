import type { SchemaOptions } from "./Schema.js";
import type { Sourceable } from "../util/source.js";
import { Schema } from "./Schema.js";

/** Allowed options for `ThroughSchama` */
export type ThroughSchemaOptions<T> = SchemaOptions & { source: Schema<T> };

/** Schema that passes through to a source schema. */
export abstract class ThroughSchema<T> extends Schema<T> implements Sourceable<Schema<T>> {
	readonly source: Schema<T>;
	constructor(options: ThroughSchemaOptions<T>) {
		super(options);
		this.source = options.source;
	}
	validate(unsafeValue: unknown): T {
		return this.source.validate(unsafeValue);
	}
}
