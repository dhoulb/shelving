import type { ImmutableDictionary } from "../util/dictionary.js";
import { isDictionary } from "../util/dictionary.js";
import { validateDictionary } from "../util/validate.js";
import type { SchemaOptions } from "./Schema.js";
import { Schema } from "./Schema.js";

/** Allowed options for `DictionarySchema` */
export interface DictionarySchemaOptions<T> extends SchemaOptions {
	readonly items: Schema<T>;
	readonly value?: ImmutableDictionary | undefined;
	readonly min?: number | undefined;
	readonly max?: number | undefined;
}

/** Validate a dictionary object (whose props are all the same with string keys). */
export class DictionarySchema<T> extends Schema<ImmutableDictionary<T>> {
	declare readonly value: ImmutableDictionary<T>;
	readonly items: Schema<T>;
	readonly min: number;
	readonly max: number;
	constructor({
		items,
		one = items.one,
		many = items.many,
		placeholder = `No ${many}`,
		min = 0,
		max = Number.POSITIVE_INFINITY,
		title = "Items",
		value = {},
		...options
	}: DictionarySchemaOptions<T>) {
		super({ one, many, title, placeholder, value, ...options });
		this.items = items;
		this.min = min;
		this.max = max;
	}
	override validate(unsafeValue: unknown = this.value): ImmutableDictionary<T> {
		if (!isDictionary(unsafeValue)) throw "Must be object";
		const validDictionary = validateDictionary(unsafeValue, this.items);
		const length = Object.keys(validDictionary).length;
		if (length < this.min) throw length ? `Minimum ${this.min} ${this.many}` : "Required";
		if (length > this.max) throw `Maximum ${this.max} ${this.many}`;
		return validDictionary;
	}
}

/** Valid dictionary object with specifed items. */
export const DICTIONARY = <T>(items: Schema<T>): DictionarySchema<T> => new DictionarySchema({ items });
