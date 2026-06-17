import { type ImmutableArray, isArray } from "../util/array.js";
import { isProp } from "../util/object.js";
import type { SchemaOptions } from "./Schema.js";
import { Schema } from "./Schema.js";

/**
 * Dictionary of allowed options for a `ChoiceSchema` in `{ key: title }` format.
 *
 * @see https://dhoulb.github.io/shelving/schema/ChoiceSchema/ChoiceOptions
 */
export type ChoiceOptions<K extends string> = { readonly [KK in K]: string };

/**
 * Things that can be converted to a `ChoiceOptions` dictionary.
 *
 * - Dictionary of string options in `{ key: title }` format.
 * - Array of string options in `[key]` format (`key` is used as the `title` too).
 *
 * @see https://dhoulb.github.io/shelving/schema/ChoiceSchema/PossibleChoiceOptions
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
 * @see https://dhoulb.github.io/shelving/schema/ChoiceSchema/ChoiceSchemaOptions
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
 * @example
 *  const schema = new ChoiceSchema({ options: { yes: "Yes", no: "No" } });
 *  schema.validate("yes"); // "yes"
 *
 * @see https://dhoulb.github.io/shelving/schema/ChoiceSchema/ChoiceSchema
 */
export class ChoiceSchema<O extends string, I = never> extends Schema<O> {
	declare readonly value: O | I | undefined;
	readonly options: ChoiceOptions<O>;

	/**
	 * Create a new `ChoiceSchema`.
	 */
	constructor({ one = "choice", title = "Choice", placeholder = `No ${one}`, options, value, ...rest }: ChoiceSchemaOptions<O, I>) {
		super({ one, title, value, placeholder, ...rest });
		this.options = _getChoiceOptions(options);
	}

	/**
	 * Validate an unknown value as one of the allowed choices.
	 *
	 * @param unsafeValue The unknown input value to validate (defaults to this schema's `value`).
	 * @returns The valid choice key.
	 * @throws `string` `"Required"` if the value is empty or missing, or `` `Unknown ${one}` `` if it is not one of the allowed choices.
	 * @example schema.validate("yes") // "yes"
	 * @see https://dhoulb.github.io/shelving/schema/ChoiceSchema/ChoiceSchema/validate
	 */
	validate(unsafeValue: unknown = this.value): O {
		if (typeof unsafeValue === "string" && isProp(this.options, unsafeValue)) return unsafeValue;
		throw unsafeValue ? `Unknown ${this.one}` : "Required";
	}

	/**
	 * Format a validated choice as its human-readable title.
	 *
	 * @param value The valid choice key to format.
	 * @returns The choice's title from `options`.
	 * @example schema.format("yes") // "Yes"
	 * @see https://dhoulb.github.io/shelving/schema/ChoiceSchema/ChoiceSchema/format
	 */
	override format(value: O): string {
		return this.options[value];
	}
}

/**
 * Create a schema for a valid choice from an allowed set of values.
 *
 * Sugar factory for [`ChoiceSchema`](/schema/ChoiceSchema).
 *
 * @param options The allowed choices, as a `{ key: title }` dictionary or an array of keys.
 * @example CHOICE({ yes: "Yes", no: "No" }) // ChoiceSchema<"yes" | "no">
 * @see https://dhoulb.github.io/shelving/schema/ChoiceSchema/CHOICE
 */
export function CHOICE<K extends string>(options: PossibleChoiceOptions<K>): ChoiceSchema<K> {
	return new ChoiceSchema({ options });
}
