import { ValueFeedback } from "../feedback/Feedback.js";
import { type ImmutableArray, isArray, requireFirst } from "../util/array.js";
import { getKeys, getProps, isProp } from "../util/object.js";
import type { SchemaOptions } from "./Schema.js";
import { Schema } from "./Schema.js";

/* Set of options for a `ChoiceSchema` */
export type ChoiceOptions<K extends string> = ImmutableArray<K> | { readonly [KK in K]: unknown };
export type ChoiceOption<K extends string> = readonly [K, unknown];

/** Get the options for a choice field as an array. */
export function getChoiceEntries<K extends string>(options: ChoiceOptions<K>): ImmutableArray<ChoiceOption<K>> {
	return isArray(options) ? options.map(_makeKeyEntry) : getProps(options);
}
function _makeKeyEntry<K extends string>(k: K): ChoiceOption<K> {
	return [k, k];
}

/** Get the keys for a choice field as an array. */
export function getChoiceKeys<K extends string>(options: ChoiceOptions<K>): ImmutableArray<K> {
	return isArray(options) ? options : getKeys(options);
}

/** Get the options for a choice field as an array. */
export function isOption<K extends string>(options: ChoiceOptions<K>, option: string): option is K {
	return isArray(options) ? options.includes(option as K) : isProp(options, option);
}

/** Allowed options for `ChoiceSchema` */
export interface ChoiceSchemaOptions<K extends string> extends Omit<SchemaOptions, "value"> {
	/** Specify correct options using a dictionary of entries. */
	readonly options: ChoiceOptions<K>;
	/** Default option for the value. */
	readonly value?: K;
}

/** Choose from an allowed set of values. */
export class ChoiceSchema<K extends string> extends Schema<K> implements Iterable<ChoiceOption<K>> {
	declare readonly value: K;
	readonly options: ChoiceOptions<K>;
	constructor({
		options,
		placeholder = "Empty",
		value = requireFirst(isArray(options) ? options : getKeys(options)),
		...rest
	}: ChoiceSchemaOptions<K>) {
		super({ value, placeholder, ...rest });
		this.options = options;
	}
	validate(unsafeValue: unknown = this.value): K {
		if (typeof unsafeValue === "string" && isOption(this.options, unsafeValue)) return unsafeValue;
		throw new ValueFeedback("Unknown value", unsafeValue);
	}

	// Implement iterable.
	*[Symbol.iterator](): Iterator<ChoiceOption<K>> {
		yield* getChoiceEntries(this.options);
	}

	// Get the current list of keys for this choice.
	keys(): ImmutableArray<K> {
		return getChoiceKeys(this.options);
	}
	// Get the current list of entries for this choice.
	entries(): ImmutableArray<ChoiceOption<K>> {
		return getChoiceEntries(this.options);
	}
}

/** Choose from an allowed set of values. */
export function CHOICE<K extends string>(options: ChoiceOptions<K>): ChoiceSchema<K> {
	return new ChoiceSchema({ options });
}
