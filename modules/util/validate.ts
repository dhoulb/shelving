import { Feedback, isFeedback } from "../feedback/Feedback.js";
import { Feedbacks } from "../feedback/Feedbacks.js";
import type { Entry } from "./entry.js";
import { ImmutableDictionary, MutableDictionary, PossibleDictionary, getDictionaryItems } from "./dictionary.js";
import { Data, DataProp, getDataProps } from "./data.js";
import { ImmutableArray, PossibleArray } from "./array.js";

/** Object that can validate an unknown value with its `validate()` method. */
export interface Validatable<T> {
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

/** Function that can validate a value. */
export type Validate<T> = (unsafeValue: unknown) => T;

/** Something that can validate a value. */
export type Validator<T = unknown> = Validatable<T> | Validate<T>;

/** Extract the type from a validator. */
export type ValidatorType<X> = X extends Validator<infer Y> ? Y : never;

/** A set of named validators in `{ name: Validator }` format. */
export type Validators<T extends Data = Data> = { readonly [K in keyof T]: Validator<T[K]> };

/** Extract the type from a set of validators. */
export type ValidatorsType<T> = { readonly [K in keyof T]: ValidatorType<T[K]> };

/** Validate an unknown value with a validator. */
export function validate<T>(unsafeValue: unknown, validator: Validator<T>): T {
	return typeof validator === "function" ? validator(unsafeValue) : validator.validate(unsafeValue);
}

/**
 * Validate an array of items.
 *
 * @return Array with valid items.
 * @throw Feedback if one or more entry values did not validate.
 * - `feedback.details` will contain an entry for each invalid item (keyed by their count in the input iterable).
 */
export function validateArray<T>(unsafeItems: PossibleArray<unknown>, validator: Validator<T>): ImmutableArray<T> {
	return Array.from(validateItems(unsafeItems, validator));
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
	const feedbacks: MutableDictionary<Feedback> = {};
	for (const unsafeItem of unsafeItems) {
		try {
			yield validate(unsafeItem, validator);
		} catch (thrown) {
			if (!isFeedback(thrown)) throw thrown;
			feedbacks[index] = thrown;
			valid = false;
		}
		index++;
	}
	if (!valid) throw new Feedbacks(feedbacks, unsafeItems);
}

/**
 * Validate the values of the entries in a dictionary object.
 *
 * @throw Feedback if one or more entry values did not validate.
 * - `feedback.details` will contain an entry for each invalid item (keyed by their count in the input iterable).
 */
export function validateDictionary<T>(unsafeDictionary: PossibleDictionary<unknown>, validator: Validator<T>): ImmutableDictionary<T> {
	return Object.fromEntries(validateDictionaryItems(unsafeDictionary, validator));
}

/**
 * Validate the _values_ of an iterable set of entries with a validator.
 *
 * @yield Entries with valid values.
 * @throw Feedback if one or more entry values did not validate.
 * - `feedback.details` will contain an entry for each invalid item (keyed by their count in the input iterable).
 */
export function* validateDictionaryItems<T>(unsafeItems: PossibleDictionary<unknown>, validator: Validator<T>): Iterable<Entry<string, T>> {
	let valid = true;
	const feedbacks: MutableDictionary<Feedback> = {};
	for (const [key, value] of getDictionaryItems(unsafeItems)) {
		try {
			yield [key, validate(value, validator)];
		} catch (thrown) {
			if (!isFeedback(thrown)) throw thrown;
			feedbacks[key] = thrown;
			valid = false;
		}
	}
	if (!valid) throw new Feedbacks(feedbacks, unsafeItems);
}

/**
 * Validate a data object with a set of validators.
 * - Defined props in the object will be validated against the corresponding validator.
 * - `undefined` props in the object will be set to the default value of that prop.
 *
 * @return Valid object.
 * @throw Feedback if one or more props did not validate.
 * - `feedback.details` will contain an entry for each invalid item (keyed by their count in the input iterable).
 */
export function validateData<T extends Data>(unsafeData: Data, validators: Validators<T>): T {
	return Object.fromEntries(validateDataProps(unsafeData, validators)) as T;
}

/**
 * Validate the props of a data object with a set of validators.
 *
 * @yield Valid props for the data object.
 * @throw Feedback if one or more props did not validate.
 * - `feedback.details` will contain an entry for each invalid item (keyed by their count in the input iterable).
 */
export function* validateDataProps<T extends Data>(unsafeData: Data, validators: Validators<T>): Iterable<DataProp<T>> {
	let valid = true;
	const feedbacks: MutableDictionary<Feedback> = {};
	for (const [key, validator] of getDataProps(validators)) {
		try {
			yield [key, validate(unsafeData[key], validator)];
		} catch (thrown) {
			if (!isFeedback(thrown)) throw thrown;
			feedbacks[key] = thrown;
			valid = false;
		}
	}
	if (!valid) throw new Feedbacks(feedbacks, unsafeData);
}
