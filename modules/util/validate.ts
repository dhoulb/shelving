import { RequiredError } from "../error/RequiredError.js";
import { Feedback, ValueFeedback } from "../feedback/Feedback.js";
import type { ImmutableArray, MutableArray, PossibleArray } from "./array.js";
import { isArray } from "./array.js";
import type { Data } from "./data.js";
import { getDataProps } from "./data.js";
import type { ImmutableDictionary, MutableDictionary } from "./dictionary.js";
import { getDictionaryItems } from "./dictionary.js";
import { getNamedMessage } from "./error.js";
import type { AnyCaller } from "./function.js";
import { isIterable } from "./iterate.js";
import type { MutableObject } from "./object.js";

/** Object that can validate an unknown value with its `validate()` method. */
export interface Validator<T> {
	/**
	 * `validate()` method accepts an unsafe value and returns a valid value.
	 *
	 * @param unsafeValue A potentially invalid value.
	 *
	 * @return Valid value.
	 *
	 * @throws `Error` If the value is invalid and cannot be fixed.
	 * @throws `Feedback` If the value is invalid and cannot be fixed and we want to explain why to an end user.
	 */
	validate(unsafeValue: unknown): T;
}

/** Extract the type from a validator. */
export type ValidatorType<X> = X extends Validator<infer Y> ? Y : never;

/** A set of named validators in `{ name: Validator }` format. */
export type Validators<T extends Data = Data> = { readonly [K in keyof T]: Validator<T[K]> };

/** Extract the type from a set of validators. */
export type ValidatorsType<T> = { readonly [K in keyof T]: ValidatorType<T[K]> };

/** Require a valid value for a given validator, or return `undefined` if the value could not be validated. */
export function getValid<T>(value: unknown, validator: Validator<T>): T | undefined {
	try {
		return validator.validate(value);
	} catch (thrown) {
		if (thrown instanceof Feedback) return undefined;
		throw thrown;
	}
}

/** Require a valid value for a given validator, or throw `RequiredError` if the value could not be validated. */
export function requireValid<T>(value: unknown, validator: Validator<T>, caller: AnyCaller = requireValid): T {
	try {
		return validator.validate(value);
	} catch (thrown) {
		if (thrown instanceof Feedback) throw new RequiredError(thrown.message, { cause: thrown, caller });
		throw thrown;
	}
}

/**
 * Validate an iterable set of items with a validator.
 *
 * @yield Valid items.
 * @throw Feedback if one or more items did not validate.
 */
export function* validateItems<T>(unsafeItems: PossibleArray<unknown>, validator: Validator<T>): Iterable<T> {
	let index = 0;
	const messages: MutableArray<string> = [];
	for (const unsafeItem of unsafeItems) {
		try {
			yield validator.validate(unsafeItem);
		} catch (thrown) {
			if (!(thrown instanceof Feedback)) throw thrown;
			messages.push(getNamedMessage(index.toString(), thrown.message));
		}
		index++;
	}
	if (messages.length) throw new ValueFeedback(messages.join("\n"), unsafeItems);
}

/**
 * Validate an array of items.
 *
 * @return Array with valid items.
 * @throw Feedback if one or more entry values did not validate.
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
			if (!(thrown instanceof Feedback)) throw thrown;
			messages.push(getNamedMessage(index.toString(), thrown.message));
		}
		index++;
	}
	if (messages.length) throw new ValueFeedback(messages.join("\n"), unsafeArray);
	return changed || !isArray(unsafeArray) ? safeArray : (unsafeArray as ImmutableArray<T>);
}

/**
 * Validate the values of the entries in a dictionary object.
 *
 * @throw Feedback if one or more entry values did not validate.
 */
export function validateDictionary<T>(unsafeDictionary: ImmutableDictionary<unknown>, validator: Validator<T>): ImmutableDictionary<T> {
	let changed = false;
	const safeDictionary: MutableDictionary<T> = {};
	const messages: MutableArray<string> = [];
	for (const [key, unsafeValue] of getDictionaryItems(unsafeDictionary)) {
		try {
			const safeValue = validator.validate(unsafeValue);
			safeDictionary[key] = safeValue;
			if (!changed && safeValue !== unsafeValue) changed = true;
		} catch (thrown) {
			if (!(thrown instanceof Feedback)) throw thrown;
			messages.push(getNamedMessage(key, thrown.message));
		}
	}
	if (messages.length) throw new ValueFeedback(messages.join("\n"), unsafeDictionary);
	return changed || isIterable(unsafeDictionary) ? safeDictionary : (unsafeDictionary as ImmutableDictionary<T>);
}

/**
 * Validate a data object with a set of validators.
 * - Defined props in the object will be validated against the corresponding validator.
 * - `undefined` props in the object will be set to the default value of that prop.
 * - `undefined` props after validation will not be set in the output object.
 *
 * @return Valid object.
 * @throw Feedback if one or more props did not validate.
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
			if (!(thrown instanceof Feedback)) throw thrown;
			messages.push(getNamedMessage(key, thrown.message));
		}
	}
	if (messages.length) throw new ValueFeedback(messages.join("\n"), unsafeData);
	if (changes) return safeData as T;

	// Check that no excess keys exist.
	for (const key of Object.keys(unsafeData)) if (!(key in validators)) return safeData as T;
	return unsafeData as T;
}
