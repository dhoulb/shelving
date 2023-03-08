import { ImmutableDictionary, isDictionary } from "../util/dictionary.js";
import { Validator, validateEntries } from "../util/validate.js";
import { InvalidFeedback } from "../feedback/InvalidFeedback.js";
import { Schema, SchemaOptions } from "./Schema.js";

/** Allowed options for `DictionarySchema` */
export type DictionarySchemaOptions<T> = SchemaOptions & {
	readonly items: Validator<T>;
	readonly value?: ImmutableDictionary | undefined;
	readonly min?: number | undefined;
	readonly max?: number | undefined;
};

/** Validate a dictionary object (whose props are all the same with string keys). */
export class DictionarySchema<T> extends Schema<ImmutableDictionary<T>> {
	override readonly value: ImmutableDictionary;
	readonly items: Validator<T>;
	readonly min: number;
	readonly max: number;
	constructor({ value = {}, items, min = 0, max = Infinity, ...rest }: DictionarySchemaOptions<T>) {
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
		if (unsafeEntries.length < this.min) throw new InvalidFeedback(unsafeEntries.length ? `Minimum ${this.min} items` : "Required", { value: safeObject });
		if (unsafeEntries.length > this.max) throw new InvalidFeedback(`Maximum ${this.max} items`, { value: safeObject });
		return safeObject;
	}
}

/** Valid dictionary object with specifed items. */
export const DICTIONARY = <T>(items: Validator<T>): DictionarySchema<T> => new DictionarySchema({ items });
