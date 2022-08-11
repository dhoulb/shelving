import type { Sourceable } from "../util/source.js";
import { Schema } from "./Schema.js";

/** Schema that passes through to a source schema. */
export abstract class ThroughSchema<T> extends Schema<T> implements Sourceable<Schema<T>> {
	readonly source: Schema<T>;
	constructor({ source, ...props }: ConstructorParameters<typeof Schema>[0] & { source: Schema<T> }) {
		super({ ...source, ...props });
		this.source = source;
	}
	validate(unsafeValue: unknown): T {
		return this.source.validate(unsafeValue);
	}
}
