import { Feedback, isFeedback } from "../feedback/Feedback.js";
import { InvalidFeedback } from "../feedback/InvalidFeedback.js";
import type { Entry } from "./entry.js";
import type { ImmutableObject } from "./object.js";
import { Data, Prop, getProps } from "./data.js";
import { getArray, ImmutableArray } from "./array.js";

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
	 * @throws `InvalidFeedback` If the value is invalid and cannot be fixed and we want to explain why to an end user.
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
export type Validators<T extends Data = Data> = { [K in keyof T]: Validator<T[K]> };

/** Extract the type from a set of validators. */
export type ValidatorsType<T> = { [K in keyof T]: ValidatorType<T[K]> };

/** Validate an unknown value with a validator. */
export function validate<T>(unsafeValue: unknown, validator: Validator<T>): T {
	return typeof validator === "function" ? validator(unsafeValue) : validator.validate(unsafeValue);
}

/**
 * Validate an array of items.
 *
 * @return Array with valid items.
 * @throw InvalidFeedback if one or more entry values did not validate.
 * - `feedback.details` will contain an entry for each invalid item (keyed by their count in the input iterable).
 */
export function validateArray<T>(unsafeItems: Iterable<unknown>, validator: Validator<T>): ImmutableArray<T> {
	return getArray(validateItems(unsafeItems, validator));
}

/**
 * Validate an iterable set of items with a validator.
 *
 * @yield Valid items.
 * @throw InvalidFeedback if one or more items did not validate.
 * - `feedback.details` will contain an entry for each invalid item (keyed by their count in the input iterable).
 */
export function* validateItems<T>(unsafeItems: Iterable<unknown>, validator: Validator<T>): Iterable<T> {
	let index = 0;
	const feedbacks = new Map<number, Feedback>();
	for (const unsafeItem of unsafeItems) {
		try {
			yield validate(unsafeItem, validator);
		} catch (thrown) {
			if (!isFeedback(thrown)) throw thrown;
			feedbacks.set(index, thrown);
		}
		index++;
	}
	if (feedbacks.size) throw new InvalidFeedback("Invalid items", feedbacks);
}

/**
 * Validate the _values_ of an iterable set of entries with a validator.
 *
 * @yield Entries with valid values.
 * @throw InvalidFeedback if one or more entry values did not validate.
 * - `feedback.details` will contain an entry for each invalid item (keyed by their count in the input iterable).
 */
export function* validateEntries<T>(unsafeValues: Iterable<Entry<string, unknown>>, validator: Validator<T>): Iterable<Entry<string, T>> {
	const feedbacks = new Map<string, Feedback>();
	for (const [key, value] of unsafeValues) {
		try {
			yield [key, validate(value, validator)];
		} catch (thrown) {
			if (!isFeedback(thrown)) throw thrown;
			feedbacks.set(key, thrown);
		}
	}
	if (feedbacks.size) throw new InvalidFeedback("Invalid entries", feedbacks);
}

/**
 * Validate a map-like object.
 *
 * @throw InvalidFeedback if one or more entry values did not validate.
 * - `feedback.details` will contain an entry for each invalid item (keyed by their count in the input iterable).
 */
export function validateObject<T>(obj: ImmutableObject<T>, validator: Validator<T>): ImmutableObject<T> {
	return Object.fromEntries(validateEntries(Object.entries(obj), validator));
}

/**
 * Validate the props of a data object with a set of validators.
 * @yield Valid props for the data object.
 * @throw InvalidFeedback if one or more props did not validate.
 * - `feedback.details` will contain an entry for each invalid item (keyed by their count in the input iterable).
 */
export function* validateProps<T extends Data>(unsafeData: Data, validators: Validators<T>): Iterable<Prop<T>> {
	const feedbacks = new Map<string, Feedback>();
	for (const [key, validator] of getProps(validators)) {
		try {
			yield [key, validate(unsafeData[key], validator)];
		} catch (thrown) {
			if (!isFeedback(thrown)) throw thrown;
			feedbacks.set(key, thrown);
		}
	}
	if (feedbacks.size) throw new InvalidFeedback("Invalid data", feedbacks);
}

/**
 * Validate a data object with a set of validators.
 * - Defined props in the object will be validated against the corresponding validator.
 * - `undefined` props in the object will be set to the default value of that prop.
 *
 * @return Valid object.
 * @throw InvalidFeedback if one or more props did not validate.
 * - `feedback.details` will contain an entry for each invalid item (keyed by their count in the input iterable).
 */
export function validateData<T extends Data>(unsafeData: Data, validators: Validators<T>): T {
	return Object.fromEntries(validateProps(unsafeData, validators)) as T;
}
