import { ValueFeedback } from "../feedback/Feedback.js";
import type { Data } from "../util/data.js";
import { isData } from "../util/data.js";
import { validateData } from "../util/validate.js";
import type { DataSchema } from "./DataSchema.js";
import type { SchemaOptions } from "./Schema.js";
import { ThroughSchema } from "./ThroughSchema.js";

/** Allowed options for `PartialSchema` */
export interface PartialSchemaOptions<T extends Data> extends SchemaOptions {
	readonly source: DataSchema<T>;
	readonly value?: Partial<T> | undefined;
}

/** Validate a partial value for a given `DataSchema` source. */
export class PartialSchema<T extends Data> extends ThroughSchema<Partial<T>> {
	declare readonly source: DataSchema<T>;
	declare readonly value: Partial<T>;
	constructor({ value = {}, ...options }: PartialSchemaOptions<T>) {
		super({ value, ...options });
	}
	override validate(unsafeValue: unknown = this.value): Partial<T> {
		if (!isData(unsafeValue)) throw new ValueFeedback("Must be object", unsafeValue);
		return validateData(unsafeValue, this.source.props, true) as Partial<T>;
	}
}

/** Create a new partial schema from a `DataSchema` source. */
export const PARTIAL = <T extends Data>(source: DataSchema<T>): PartialSchema<T> => new PartialSchema({ source });
