import { ImmutableDictionary, isDictionary } from "../util/dictionary.js";
import { Validator, validateEntries } from "../util/validate.js";
import { InvalidFeedback } from "../feedback/InvalidFeedback.js";
import { Schema, SchemaOptions } from "./Schema.js";

/** Allowed options for `DictionarySchema` */
export type DictionarySchemaOptions<T> = SchemaOptions & {
	readonly items: Validator<T>;
	readonly value?: ImmutableDictionary;
	readonly min?: number | null;
	readonly max?: number | null;
};

/** Validate a dictionary object (whose props are all the same with string keys). */
export class DictionarySchema<T> extends Schema<ImmutableDictionary<T>> {
	override readonly value: ImmutableDictionary;
	readonly items: Validator<T>;
	readonly min: number | null = null;
	readonly max: number | null = null;
	constructor({ value = {}, items, min = null, max = null, ...rest }: DictionarySchemaOptions<T>) {
		super(rest);
		this.items = items;
		this.value = value;
		this.min = min;
		this.max = max;
	}
	override validate(unsafeValue: unknown = this.value): ImmutableDictionary<T> {
		if (!isDictionary(unsafeValue)) throw new InvalidFeedback("Must be object", { value: unsafeValue });
		const unsafeEntries = Object.entries(unsafeValue);
		const safeObject = Object.fromEntries(validateEntries(unsafeEntries, this.items));
		if (typeof this.min === "number" && unsafeEntries.length < this.min) throw new InvalidFeedback(unsafeEntries.length ? `Minimum ${this.min} items` : "Required", { value: safeObject });
		if (typeof this.max === "number" && unsafeEntries.length > this.max) throw new InvalidFeedback(`Maximum ${this.max} items`, { value: safeObject });
		return safeObject;
	}
}

/** Valid dictionary object with specifed items. */
export const DICTIONARY = <T>(items: Validator<T>): DictionarySchema<T> => new DictionarySchema({ items });
