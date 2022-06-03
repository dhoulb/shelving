import { Feedback } from "../feedback/Feedback.js";
import { InvalidFeedback } from "../feedback/InvalidFeedback.js";
import type { Entry } from "./entry.js";
import type { ImmutableObject, MutableObject } from "./object.js";
import { Data, isData, Prop, toProps } from "./data.js";

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

/** Object that can validate an unknown value with its `validate()` method, or a function that can do the same. */
export type Validator<T = unknown> = Validatable<T> | ((unsafeValue: unknown) => T);

/** Any validator (useful for `extends AnyValidator` clauses). */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyValidator = Validator<any>;

/** Extract the type from a validator. */
export type ValidatorType<X extends AnyValidator> = X extends Validator<infer Y> ? Y : never;

/** Is a given value a validator? */
export const isValidator = <T extends AnyValidator>(v: T | unknown): v is T => typeof v === "function" || (isData(v) && typeof v.validate === "function");

/** A set of named validators in `{ name: Validator }` format. */
export type Validators<T extends Data> = { [K in keyof T]: Validator<T[K]> };

/** Any observer (useful for `extends AnyValidators` clauses). */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyValidators = Validators<any>;

/** Extract the type from a set of validators. */
export type ValidatorsType<T extends AnyValidators> = { [K in keyof T]: ValidatorType<T[K]> };

/** Validate an unknown value with a validator. */
export function validate<T>(unsafeValue: unknown, validator: Validator<T>): T {
	return typeof validator === "function" ? validator(unsafeValue) : validator.validate(unsafeValue);
}

/**
 * Validate an iterable set of items with a validator.
 *
 * @yield Valid items.
 * @throw InvalidFeedback if one or more items did not validate.
 * - `feedback.details` will contain an entry for each invalid item (keyed by their count in the input iterable).
 */
export function* validateItems<T>(unsafeItems: Iterable<unknown>, validator: Validator<T>): Iterable<T> {
	let invalid = false;
	let index = 0;
	const details: MutableObject<Feedback> = {};
	for (const unsafeItem of unsafeItems) {
		try {
			yield validate(unsafeItem, validator);
		} catch (thrown) {
			if (!(thrown instanceof Feedback)) throw thrown;
			invalid = true;
			details[index] = thrown;
		}
		index++;
	}
	if (invalid) throw new InvalidFeedback("Invalid items", details);
}

/**
 * Validate the _values_ of an iterable set of entries with a validator.
 *
 * @yield Entries with valid values.
 * @throw InvalidFeedback if one or more entry values did not validate.
 * - `feedback.details` will contain an entry for each invalid item (keyed by their count in the input iterable).
 */
export function* validateEntries<T>(unsafeValues: Iterable<Entry>, validator: Validator<T>): Iterable<Entry<T>> {
	let invalid = false;
	const details: MutableObject<Feedback> = {};
	for (const [k, v] of unsafeValues) {
		try {
			yield [k, validate(v, validator)];
		} catch (thrown) {
			if (!(thrown instanceof Feedback)) throw thrown;
			invalid = true;
			details[k] = thrown;
		}
	}
	if (invalid) throw new InvalidFeedback("Invalid entries", details);
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
	let invalid = false;
	const details: MutableObject<Feedback> = {};
	for (const [k, validator] of toProps(validators)) {
		try {
			yield [k, validate(unsafeData[k], validator)];
		} catch (thrown) {
			if (thrown instanceof Feedback) {
				invalid = true;
				details[k] = thrown;
			} else throw thrown;
		}
	}
	if (invalid) throw new InvalidFeedback("Invalid data", details);
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
