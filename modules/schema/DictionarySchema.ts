import { ValueFeedback } from "../feedback/Feedback.js";
import type { ImmutableDictionary } from "../util/dictionary.js";
import { isDictionary } from "../util/dictionary.js";
import type { Validator } from "../util/validate.js";
import { validateDictionary } from "../util/validate.js";
import type { SchemaOptions } from "./Schema.js";
import { Schema } from "./Schema.js";

/** Allowed options for `DictionarySchema` */
export interface DictionarySchemaOptions<T> extends SchemaOptions {
	readonly items: Validator<T>;
	readonly value?: ImmutableDictionary | undefined;
	readonly min?: number | undefined;
	readonly max?: number | undefined;
}

/** Validate a dictionary object (whose props are all the same with string keys). */
export class DictionarySchema<T> extends Schema<ImmutableDictionary<T>> {
	declare readonly value: ImmutableDictionary;
	readonly items: Validator<T>;
	readonly min: number;
	readonly max: number;
	constructor({ items, min = 0, max = Number.POSITIVE_INFINITY, title = "Items", value = {}, ...options }: DictionarySchemaOptions<T>) {
		super({ title, value, ...options });
		this.items = items;
		this.min = min;
		this.max = max;
	}
	override validate(unsafeValue: unknown = this.value): ImmutableDictionary<T> {
		if (!isDictionary(unsafeValue)) throw new ValueFeedback("Must be object", unsafeValue);
		const validDictionary = validateDictionary(unsafeValue, this.items);
		const length = Object.keys(validDictionary).length;
		if (length < this.min) throw new ValueFeedback(length ? `Minimum ${this.min} items` : "Required", validDictionary);
		if (length > this.max) throw new ValueFeedback(`Maximum ${this.max} items`, validDictionary);
		return validDictionary;
	}
}

/** Valid dictionary object with specifed items. */
export const DICTIONARY = <T>(items: Validator<T>): DictionarySchema<T> => new DictionarySchema({ items });
