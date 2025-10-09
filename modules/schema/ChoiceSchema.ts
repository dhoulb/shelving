import { ValueFeedback } from "../feedback/Feedback.js";
import { requireFirst } from "../util/array.js";
import { getKeys, isProp } from "../util/object.js";
import type { SchemaOptions } from "./Schema.js";
import { Schema } from "./Schema.js";

/* Set of options for a `ChoiceSchema` */
export type ChoiceOptions<K extends string> = { readonly [KK in K]: unknown };

/** Allowed options for `ChoiceSchema` */
export interface ChoiceSchemaOptions<K extends string> extends Omit<SchemaOptions, "value"> {
	/** Specify correct options using a dictionary of entries. */
	options: ChoiceOptions<K>;
	/** Default option for the value. */
	value?: K;
}

/** Choose from an allowed set of values. */
export class ChoiceSchema<K extends string> extends Schema<K> {
	declare readonly value: string;
	readonly options: ChoiceOptions<K>;
	constructor({ options, value = requireFirst(getKeys(options)), ...rest }: ChoiceSchemaOptions<K>) {
		super({ value, ...rest });
		this.options = options;
	}
	validate(unsafeValue: unknown = this.value): K {
		if (typeof unsafeValue === "string" && isProp(this.options, unsafeValue)) return unsafeValue;
		throw new ValueFeedback("Unknown value", unsafeValue);
	}
}

/** Choose from an allowed set of values. */
export function CHOICE<K extends string>(options: ChoiceOptions<K>): ChoiceSchema<K> {
	return new ChoiceSchema({ options });
}
