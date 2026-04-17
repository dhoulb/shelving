import { type ImmutableArray, isArray } from "../util/array.js";
import { isProp } from "../util/object.js";
import type { SchemaOptions } from "./Schema.js";
import { Schema } from "./Schema.js";

/**
 * Set of options for a `ChoiceSchema` can be either:
 * - Dictionary of string options in `{ key: title }` format.
 */
export type ChoiceOptions<K extends string> = { readonly [KK in K]: string };

/**
 * Things that can be converted to a choice options dictionary.
 * - Array of string options in `[key]` format (`key` will be used as the `title` too).
 */
export type PossibleChoiceOptions<K extends string> = ImmutableArray<K> | ChoiceOptions<K>;

/** Get a `ChoiceOptions` object for a set of `PossibleChoiceOptions`. */
function _getChoiceOptions<K extends string>(options: PossibleChoiceOptions<K>): ChoiceOptions<K> {
	return isArray(options) ? (Object.fromEntries(options.map(_getChoiceOption)) as ChoiceOptions<K>) : options;
}
function _getChoiceOption<K extends string>(k: K): readonly [title: K, title: string] {
	return [k, k];
}

/** Allowed options for `ChoiceSchema` */
export interface ChoiceSchemaOptions<K extends string> extends Omit<SchemaOptions, "value"> {
	/** Specify correct options using a dictionary of entries. */
	readonly options: PossibleChoiceOptions<K>;
	/** Default option for the value. */
	readonly value?: K;
}

/** Choose from an allowed set of values. */
export class ChoiceSchema<K extends string> extends Schema<K> {
	declare readonly value: K | undefined;
	readonly options: ChoiceOptions<K>;
	constructor({ one = "choice", title = "Choice", placeholder = `No ${one}`, options, value, ...rest }: ChoiceSchemaOptions<K>) {
		super({ one, title, value, placeholder, ...rest });
		this.options = _getChoiceOptions(options);
	}
	validate(unsafeValue: unknown = this.value): K {
		if (typeof unsafeValue === "string" && isProp(this.options, unsafeValue)) return unsafeValue;
		throw unsafeValue ? `Unknown ${this.one}` : "Required";
	}
	override format(value: K): string {
		return this.options[value];
	}
}

/** Choose from an allowed set of values. */
export function CHOICE<K extends string>(options: PossibleChoiceOptions<K> | ImmutableArray<K>): ChoiceSchema<K> {
	return new ChoiceSchema({ options });
}
