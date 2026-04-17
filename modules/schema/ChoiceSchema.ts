import { type ImmutableArray, isArray, isArrayItem } from "../util/array.js";
import { getKeys, getProps, isProp } from "../util/object.js";
import type { SchemaOptions } from "./Schema.js";
import { Schema } from "./Schema.js";

/**
 * Set of options for a `ChoiceSchema` can be either:
 * - Array of string options in `[key]` format (`key` will be used as the `title` too).
 * - Dictionary of string options in `{ key: title }` format.
 */
export type ChoiceOptions<K extends string> = ImmutableArray<K> | { readonly [KK in K]: string };

/** A single tuple for a choice option in `[key, title]` format. */
export type ChoiceOption<K extends string> = readonly [title: K, title: string];

/** Is an unknown string a choice option */
export function isChoiceOption<K extends string>(options: ChoiceOptions<K>, option: string): option is K {
	return isArray(options) ? isArrayItem(options, option) : isProp(options, option);
}

/** Get a dictionary from a plain array of options. */
function* _yieldArrayChoiceOptions<K extends string>(options: ImmutableArray<K>): Iterable<ChoiceOption<K>> {
	for (const k of options) yield [k, k];
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
	declare readonly value: K | undefined;
	readonly options: ChoiceOptions<K>;
	constructor({ one = "choice", title = "Choice", placeholder = `No ${one}`, options, value, ...rest }: ChoiceSchemaOptions<K>) {
		super({ one, title, value, placeholder, ...rest });
		this.options = options;
	}
	validate(unsafeValue: unknown = this.value): K {
		if (typeof unsafeValue === "string" && isChoiceOption(this.options, unsafeValue)) return unsafeValue;
		throw unsafeValue ? `Unknown ${this.one}` : "Required";
	}
	override format(value: K): string {
		return isArray(this.options) ? value : this.options[value];
	}

	// Get the current list of keys for this choice.
	keys(): ImmutableArray<K> {
		return isArray(this.options) ? this.options : getKeys(this.options);
	}
	// Get the current list of entries for this choice.
	entries(): ImmutableArray<ChoiceOption<K>> {
		return isArray(this.options) ? Array.from(_yieldArrayChoiceOptions(this.options)) : getProps(this.options);
	}

	// Implement iterable.
	*[Symbol.iterator](): Iterator<ChoiceOption<K>> {
		if (isArray(this.options)) {
			yield* _yieldArrayChoiceOptions(this.options);
		} else {
			yield* getProps(this.options);
		}
	}
}

/** Choose from an allowed set of values. */
export function CHOICE<K extends string>(options: ChoiceOptions<K> | ImmutableArray<K>): ChoiceSchema<K> {
	return new ChoiceSchema({ options });
}
