import type { BaseError, BaseErrorOptions } from "../error/BaseError.js";
import { ValueError } from "../error/ValueError.js";
import { Feedback } from "../feedback/Feedback.js";
import { ValueFeedbacks } from "../feedback/Feedbacks.js";
import type { ImmutableArray, MutableArray, PossibleArray } from "./array.js";
import { isArray } from "./array.js";
import type { Constructor } from "./class.js";
import type { Data } from "./data.js";
import { getDataProps } from "./data.js";
import type { ImmutableDictionary, MutableDictionary, PossibleDictionary } from "./dictionary.js";
import { getDictionaryItems } from "./dictionary.js";
import { PASSTHROUGH } from "./function.js";
import { isIterable } from "./iterate.js";
import { getNull } from "./null.js";
import type { DeepPartial, MutableObject } from "./object.js";
import { getUndefined } from "./undefined.js";

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

/** Get value that validates against a given `Validator`, or throw `ValueError` */
export function getValid<T>(
	value: unknown,
	validator: Validator<T>,
	ErrorConstructor: Constructor<BaseError, [string, BaseErrorOptions]> = ValueError,
): T {
	try {
		return validator.validate(value);
	} catch (thrown) {
		if (thrown instanceof Feedback) throw new ErrorConstructor(thrown.message, { received: value, cause: thrown, caller: getValid });
		throw thrown;
	}
}

/**
 * Validate an iterable set of items with a validator.
 *
 * @yield Valid items.
 * @throw Feedback if one or more items did not validate.
 * - `feedback.details` will contain an entry for each invalid item (keyed by their count in the input iterable).
 */
export function* validateItems<T>(unsafeItems: PossibleArray<unknown>, validator: Validator<T>): Iterable<T> {
	let index = 0;
	let valid = true;
	const messages: MutableDictionary<string> = {};
	for (const unsafeItem of unsafeItems) {
		try {
			yield validator.validate(unsafeItem);
		} catch (thrown) {
			if (!(thrown instanceof Feedback)) throw thrown;
			messages[index] = thrown.message;
			valid = false;
		}
		index++;
	}
	if (!valid) throw new ValueFeedbacks(messages, unsafeItems);
}

/**
 * Validate an array of items.
 *
 * @return Array with valid items.
 * @throw Feedback if one or more entry values did not validate.
 * - `feedback.details` will contain an entry for each invalid item (keyed by their count in the input iterable).
 */
export function validateArray<T>(unsafeArray: PossibleArray<unknown>, validator: Validator<T>): ImmutableArray<T> {
	let index = 0;
	let valid = true;
	let changed = true;
	const safeArray: MutableArray<T> = [];
	const messages: MutableDictionary<string> = {};
	for (const unsafeItem of unsafeArray) {
		try {
			const safeItem = validator.validate(unsafeItem);
			safeArray.push(safeItem);
			if (!changed && safeItem !== unsafeItem) changed = true;
		} catch (thrown) {
			if (!(thrown instanceof Feedback)) throw thrown;
			messages[index] = thrown.message;
			valid = false;
		}
		index++;
	}
	if (!valid) throw new ValueFeedbacks(messages, unsafeArray);
	return changed || !isArray(unsafeArray) ? safeArray : (unsafeArray as ImmutableArray<T>);
}

/**
 * Validate the values of the entries in a dictionary object.
 *
 * @throw Feedback if one or more entry values did not validate.
 * - `feedback.details` will contain an entry for each invalid item (keyed by their count in the input iterable).
 */
export function validateDictionary<T>(unsafeDictionary: PossibleDictionary<unknown>, validator: Validator<T>): ImmutableDictionary<T> {
	let valid = true;
	let changed = false;
	const safeDictionary: MutableDictionary<T> = {};
	const messages: MutableDictionary<string> = {};
	for (const [key, unsafeValue] of getDictionaryItems(unsafeDictionary)) {
		try {
			const safeValue = validator.validate(unsafeValue);
			safeDictionary[key] = safeValue;
			if (!changed && safeValue !== unsafeValue) changed = true;
		} catch (thrown) {
			if (!(thrown instanceof Feedback)) throw thrown;
			messages[key] = thrown.message;
			valid = false;
		}
	}
	if (!valid) throw new ValueFeedbacks(messages, unsafeDictionary);
	return changed || isIterable(unsafeDictionary) ? safeDictionary : (unsafeDictionary as ImmutableDictionary<T>);
}

/** Keep track of whether we're doing a deep-partial match or not. */
let isDeeplyPartial = false;

/**
 * Validate a data object with a set of validators.
 * - Defined props in the object will be validated against the corresponding validator.
 * - `undefined` props in the object will be set to the default value of that prop.
 *
 * @param partial Whether we're validating a partial match, or not.
 * @return Valid object.
 * @throw Feedback if one or more props did not validate.
 * - `feedback.details` will contain an entry for each invalid item (keyed by their count in the input iterable).
 */
export function validateData<T extends Data>(unsafeData: Data, validators: Validators<T>, partial: true): DeepPartial<T>;
export function validateData<T extends Data>(unsafeData: Data, validators: Validators<T>, partial?: false): T;
export function validateData<T extends Data>(unsafeData: Data, validators: Validators<T>, partial = isDeeplyPartial): T {
	let valid = true;
	let changed = true;
	const safeData: MutableObject = {};
	const messages: MutableDictionary<string> = {};
	try {
		isDeeplyPartial = partial;
		for (const [key, validator] of getDataProps(validators)) {
			const unsafeValue = unsafeData[key];
			if (unsafeValue === undefined && partial) continue; // Silently skip `undefined` props if in partial mode.
			try {
				const safeValue = validator.validate(unsafeValue);
				safeData[key] = safeValue;
				if (!changed && safeValue !== unsafeValue) changed = true;
			} catch (thrown) {
				if (!(thrown instanceof Feedback)) throw thrown;
				messages[key] = thrown.message;
				valid = false;
			}
		}
		if (!valid) throw new ValueFeedbacks(messages, unsafeData);
		return changed ? (safeData as T) : (unsafeData as T);
	} finally {
		isDeeplyPartial = false;
	}
}

// Undefined validator always returns `undefined`
export const UNDEFINED: Validator<undefined> = { validate: getUndefined };

// Null validator always returns `null`
export const NULL: Validator<null> = { validate: getNull };

// Unknown validator always passes through its input value as `unknown`
export const UNKNOWN: Validator<unknown> = { validate: PASSTHROUGH };
