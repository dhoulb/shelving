import { RequiredError } from "../error/RequiredError.js";
import type { ImmutableArray, MutableArray, PossibleArray } from "./array.js";
import { isArray } from "./array.js";
import type { Data } from "./data.js";
import { getDataProps } from "./data.js";
import type { ImmutableDictionary, MutableDictionary, PossibleDictionary } from "./dictionary.js";
import { getDictionaryItems } from "./dictionary.js";
import { getNamedMessage } from "./error.js";
import type { AnyCaller } from "./function.js";
import { isIterable } from "./iterate.js";
import type { MutableObject } from "./object.js";

/**
 * Object that can validate an unknown value with its `validate()` method.
 *
 * @see https://shelving.cc/util/validate/Validator
 */
export interface Validator<T> {
	/**
	 * Validate an unsafe value and return a valid value.
	 *
	 * @param unsafeValue A potentially invalid value.
	 * @returns Valid value.
	 * @throws `Error` If the value is invalid and cannot be fixed.
	 * @throws `string` If the value is invalid and cannot be fixed and we want to explain why to an end user.
	 * @example validator.validate(unsafeValue) // valid value (or throws)
	 * @see https://shelving.cc/util/validate/Validator/validate
	 */
	validate(unsafeValue: unknown): T;
}

/**
 * Extract the validated type from a `Validator`.
 *
 * @see https://shelving.cc/util/validate/ValidatorType
 */
export type ValidatorType<X> = X extends Validator<infer Y> ? Y : never;

/**
 * A set of named validators in `{ name: Validator }` format.
 *
 * @see https://shelving.cc/util/validate/Validators
 */
export type Validators<T extends Data = Data> = { readonly [K in keyof T]: Validator<T[K]> };

/**
 * Extract the validated data type from a set of validators.
 *
 * @see https://shelving.cc/util/validate/ValidatorsType
 */
export type ValidatorsType<T> = { readonly [K in keyof T]: ValidatorType<T[K]> };

/**
 * Validate a value with a given validator, or return `undefined` if the value could not be validated.
 *
 * - Non-string thrown errors (i.e. real `Error` instances) are rethrown — only string validation messages are swallowed into `undefined`.
 *
 * @param value The unsafe value to validate.
 * @param validator The validator to validate the value with.
 * @returns The valid value, or `undefined` if validation threw a string message.
 * @throws `Error` if the validator throws a non-string error.
 * @see https://shelving.cc/util/validate/getValid
 */
export function getValid<T>(value: unknown, validator: Validator<T>): T | undefined {
	try {
		return validator.validate(value);
	} catch (thrown) {
		if (typeof thrown === "string") return undefined;
		throw thrown;
	}
}

/**
 * Validate a value with a given validator, or throw `RequiredError` if the value could not be validated.
 *
 * - String validation messages are wrapped in a `RequiredError`; non-string errors are rethrown as-is.
 *
 * @param value The unsafe value to validate.
 * @param validator The validator to validate the value with.
 * @param caller Function to attribute the thrown error to (defaults to `requireValid`).
 * @returns The valid value.
 * @throws `RequiredError` if validation threw a string message.
 * @throws `Error` if the validator throws a non-string error.
 * @see https://shelving.cc/util/validate/requireValid
 */
export function requireValid<T>(value: unknown, validator: Validator<T>, caller: AnyCaller = requireValid): T {
	try {
		return validator.validate(value);
	} catch (thrown) {
		if (typeof thrown === "string") throw new RequiredError(thrown, { cause: thrown, caller });
		throw thrown;
	}
}

/**
 * Validate an iterable set of items with a validator, yielding each valid item.
 *
 * - Validation messages for failing items are collected (keyed by index) and thrown together once iteration completes.
 *
 * @param unsafeItems The iterable of potentially invalid items.
 * @param validator The validator to validate each item with.
 * @yields Valid items.
 * @throws `string` if one or more items did not validate (one `"index: message"` line per failure, joined by newlines).
 * @example Array.from(validateItems(["a", "b"], STRING)) // ["a", "b"]
 * @see https://shelving.cc/util/validate/validateItems
 */
export function* validateItems<T>(unsafeItems: PossibleArray<unknown>, validator: Validator<T>): Iterable<T> {
	let index = 0;
	const messages: MutableArray<string> = [];
	for (const unsafeItem of unsafeItems) {
		try {
			yield validator.validate(unsafeItem);
		} catch (thrown) {
			if (typeof thrown !== "string") throw thrown;
			messages.push(getNamedMessage(index.toString(), thrown));
		}
		index++;
	}
	if (messages.length) throw messages.join("\n");
}

/**
 * Validate an array of items with a validator.
 *
 * - Returns the original array reference unchanged when every item was already valid (and the input was an array).
 *
 * @param unsafeArray The array (or iterable) of potentially invalid items.
 * @param validator The validator to validate each item with.
 * @returns Array with valid items.
 * @throws `string` if one or more items did not validate (one `"index: message"` line per failure, joined by newlines).
 * @see https://shelving.cc/util/validate/validateArray
 */
export function validateArray<T>(unsafeArray: PossibleArray<unknown>, validator: Validator<T>): ImmutableArray<T> {
	let index = 0;
	let changed = false; // start false so we can reuse original if nothing changes
	const safeArray: MutableArray<T> = [];
	const messages: MutableArray<string> = [];
	for (const unsafeItem of unsafeArray) {
		try {
			const safeItem = validator.validate(unsafeItem);
			safeArray.push(safeItem);
			if (!changed && safeItem !== unsafeItem) changed = true;
		} catch (thrown) {
			if (typeof thrown !== "string") throw thrown;
			messages.push(getNamedMessage(index.toString(), thrown));
		}
		index++;
	}
	if (messages.length) throw messages.join("\n");
	return changed || !isArray(unsafeArray) ? safeArray : (unsafeArray as ImmutableArray<T>);
}

/**
 * Validate the values of the entries in a dictionary object with a validator.
 *
 * - Returns the original dictionary reference unchanged when every value was already valid (and the input was a plain dictionary, not an iterable).
 *
 * @param unsafeDictionary The dictionary (or iterable of entries) of potentially invalid values.
 * @param validator The validator to validate each value with.
 * @returns Dictionary with valid values.
 * @throws `string` if one or more entry values did not validate (one `"key: message"` line per failure, joined by newlines).
 * @see https://shelving.cc/util/validate/validateDictionary
 */
export function validateDictionary<T>(unsafeDictionary: PossibleDictionary<unknown>, validator: Validator<T>): ImmutableDictionary<T> {
	let changed = false;
	// Null-prototype accumulator: an untrusted `"__proto__"` key (or `"constructor"`) then becomes an inert own
	// property instead of invoking the inherited `__proto__` setter, so a crafted `{ "__proto__": … }` input can't
	// reassign the returned dictionary's prototype, and the entry stays enumerable so `min`/`max` counts are correct.
	const safeDictionary: MutableDictionary<T> = Object.create(null);
	const messages: MutableArray<string> = [];
	for (const [key, unsafeValue] of getDictionaryItems(unsafeDictionary)) {
		try {
			const safeValue = validator.validate(unsafeValue);
			safeDictionary[key] = safeValue;
			if (!changed && safeValue !== unsafeValue) changed = true;
		} catch (thrown) {
			if (typeof thrown !== "string") throw thrown;
			messages.push(getNamedMessage(key, thrown));
		}
	}
	if (messages.length) throw messages.join("\n");
	return changed || isIterable(unsafeDictionary) ? safeDictionary : (unsafeDictionary as ImmutableDictionary<T>);
}

/**
 * Validate a data object with a set of validators.
 * - Defined props in the object will be validated against the corresponding validator.
 * - `undefined` props in the object will be set to the default value of that prop.
 * - `undefined` props after validation will not be set in the output object.
 * - Excess keys not present in `validators` are stripped from the output.
 * - Returns the original `unsafeData` reference unchanged when nothing changed and no excess keys exist.
 *
 * @param unsafeData The potentially invalid data object.
 * @param validators The set of named validators to validate each prop with.
 * @returns Valid object.
 * @throws `string` if one or more props did not validate (one `"key: message"` line per failure, joined by newlines).
 * @see https://shelving.cc/util/validate/validateData
 */
export function validateData<T extends Data>(unsafeData: Data, validators: Validators<T>): T {
	let changes = 0;
	const safeData: MutableObject = {};
	const messages: MutableArray<string> = [];

	// Validate the props in `validators`.
	const props = getDataProps(validators);
	for (const [key, validator] of props) {
		const unsafeValue = unsafeData[key];
		try {
			const safeValue = validator.validate(unsafeValue);
			if (safeValue === undefined) {
				// Undefined values are not included in the output object
				if (key in unsafeData) changes++;
			} else {
				// Defined values are included in the output object.
				safeData[key] = safeValue;
				if (safeValue !== unsafeValue) changes++;
			}
		} catch (thrown) {
			if (typeof thrown !== "string") throw thrown;
			messages.push(getNamedMessage(key, thrown));
		}
	}
	if (messages.length) throw messages.join("\n");
	if (changes) return safeData as T;

	// Check that no excess keys exist.
	for (const key of Object.keys(unsafeData)) if (!(key in validators)) return safeData as T;
	return unsafeData as T;
}
