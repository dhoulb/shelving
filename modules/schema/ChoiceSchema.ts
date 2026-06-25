import { type ImmutableArray, isArray } from "../util/array.js";
import { isProp } from "../util/object.js";
import type { SchemaOptions } from "./Schema.js";
import { Schema } from "./Schema.js";

/**
 * Dictionary of allowed options for a `ChoiceSchema` in `{ key: title }` format.
 *
 * @see https://shelving.cc/schema/ChoiceOptions
 */
export type ChoiceOptions<K extends string> = { readonly [KK in K]: string };

/**
 * Things that can be converted to a `ChoiceOptions` dictionary.
 *
 * - Dictionary of string options in `{ key: title }` format.
 * - Array of string options in `[key]` format (`key` is used as the `title` too).
 *
 * @see https://shelving.cc/schema/PossibleChoiceOptions
 */
export type PossibleChoiceOptions<K extends string> = ImmutableArray<K> | ChoiceOptions<K>;

/** Get a `ChoiceOptions` object for a set of `PossibleChoiceOptions`. */
function _getChoiceOptions<K extends string>(options: PossibleChoiceOptions<K>): ChoiceOptions<K> {
	return isArray(options) ? (Object.fromEntries(options.map(_getChoiceOption)) as ChoiceOptions<K>) : options;
}
function _getChoiceOption<K extends string>(k: K): readonly [title: K, title: string] {
	return [k, k];
}

/**
 * Options for `ChoiceSchema`.
 *
 * - `options` — the allowed choices, as a `{ key: title }` dictionary or an array of keys.
 * - `value` — default option used when the input is `undefined`.
 *
 * @see https://shelving.cc/schema/ChoiceSchemaOptions
 */
export interface ChoiceSchemaOptions<O extends string, I = never> extends SchemaOptions {
	/** Specify correct options using a dictionary of entries. */
	readonly options: PossibleChoiceOptions<O>;
	/** Default option for the value. */
	readonly value?: O | I;
}

/**
 * Schema that validates a value against a fixed set of allowed string choices.
 *
 * - The input must be one of the keys in `options`, otherwise it is rejected.
 * - Each choice has a human-readable title used by `format()`.
 *
 * @see https://shelving.cc/schema/ChoiceSchema
 */
export class ChoiceSchema<O extends string, I = never> extends Schema<O> {
	declare readonly value: O | I | undefined;
	readonly options: ChoiceOptions<O>;

	constructor({ one = "choice", title = "Choice", placeholder = `No ${one}`, options, value, ...rest }: ChoiceSchemaOptions<O, I>) {
		super({ one, title, value, placeholder, ...rest });
		this.options = _getChoiceOptions(options);
	}

	/**
	 * Get an unknown value as one of the allowed choices, or `undefined` if it isn't one.
	 *
	 * - Non-throwing counterpart to `validate()`, which defers to this and throws when it returns `undefined`.
	 * - Use it to normalise a value for display (e.g. in a form input) without raising on invalid or sentinel values.
	 *
	 * @param unsafeValue The unknown input value to coerce (defaults to this schema's `value`).
	 * @returns The valid choice key, or `undefined` if the value is not one of the allowed choices.
	 * @example schema.get("yes") // "yes"
	 * @example schema.get("nope") // undefined
	 * @see https://shelving.cc/schema/ChoiceSchema/get
	 */
	get(unsafeValue: unknown = this.value): O | undefined {
		if (typeof unsafeValue === "string" && isProp(this.options, unsafeValue)) return unsafeValue;
		return undefined;
	}

	/**
	 * Validate an unknown value as one of the allowed choices.
	 *
	 * @param unsafeValue The unknown input value to validate (defaults to this schema's `value`).
	 * @returns The valid choice key.
	 * @throws `string` `"Required"` if the value is empty or missing, or `` `Unknown ${one}` `` if it is not one of the allowed choices.
	 * @example schema.validate("yes") // "yes"
	 * @see https://shelving.cc/schema/ChoiceSchema/validate
	 */
	validate(unsafeValue: unknown = this.value): O {
		const value = this.get(unsafeValue);
		if (value !== undefined) return value;
		throw unsafeValue ? `Unknown ${this.one}` : "Required";
	}

	/** Format a validated choice as its human-readable title from `options`. */
	override format(value: O): string {
		return this.options[value];
	}
}

/**
 * Create a schema for a valid choice from an allowed set of values.
 *
 * Sugar factory for `ChoiceSchema`.
 *
 * @param options The allowed choices, as a `{ key: title }` dictionary or an array of keys.
 * @example CHOICE({ yes: "Yes", no: "No" }) // ChoiceSchema<"yes" | "no">
 * @see https://shelving.cc/schema/CHOICE
 */
export function CHOICE<K extends string>(options: PossibleChoiceOptions<K>): ChoiceSchema<K> {
	return new ChoiceSchema({ options });
}
