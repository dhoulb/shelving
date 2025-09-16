import type { BaseError, BaseErrorOptions } from "../error/BaseError.js";
import { ValueError } from "../error/ValueError.js";
import { Feedback, ValueFeedback } from "../feedback/Feedback.js";
import type { ImmutableArray, MutableArray, PossibleArray } from "./array.js";
import { isArray } from "./array.js";
import type { Constructor } from "./class.js";
import type { Data } from "./data.js";
import { getDataKeys, getDataProps } from "./data.js";
import type { ImmutableDictionary, MutableDictionary } from "./dictionary.js";
import { getDictionaryItems } from "./dictionary.js";
import { getNamedMessage } from "./error.js";
import type { AnyCaller } from "./function.js";
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
	caller: AnyCaller = getValid,
): T {
	try {
		return validator.validate(value);
	} catch (thrown) {
		if (thrown instanceof Feedback) {
			const { message, ...rest } = thrown;
			throw new ErrorConstructor(message, { ...rest, cause: thrown, caller });
		}
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

/** Keep track of whether we're doing a deep-partial match or not. */
let isDeeplyPartial = false;

/**
 * Validate a data object with a set of validators.
 * - Defined props in the object will be validated against the corresponding validator.
 * - `undefined` props in the object will be set to the default value of that prop.
 * - `undefined` props after validation will not be set in the output object.
 *
 * @param partial Whether we're validating a partial match or not. This allows props to be missing without error.
 *
 * @return Valid object.
 * @throw Feedback if one or more props did not validate.
 */
export function validateData<T extends Data>(unsafeData: Data, validators: Validators<T>, partial: true): DeepPartial<T>;
export function validateData<T extends Data>(unsafeData: Data, validators: Validators<T>, partial?: false): T;
export function validateData<T extends Data>(unsafeData: Data, validators: Validators<T>, partial = isDeeplyPartial): T {
	let changed = false;
	const safeData: MutableObject = {};
	const messages: MutableArray<string> = [];
	try {
		isDeeplyPartial = partial;
		const props = getDataProps(validators);
		for (const [key, validator] of props) {
			const unsafeValue = unsafeData[key];
			if (unsafeValue === undefined && partial) continue; // Silently skip `undefined` props if in partial mode.
			try {
				const safeValue = validator.validate(unsafeValue);
				if (safeValue !== undefined) safeData[key] = safeValue;
				if (!changed && safeValue !== unsafeValue) changed = true;
			} catch (thrown) {
				if (!(thrown instanceof Feedback)) throw thrown;
				messages.push(getNamedMessage(key, thrown.message));
			}
		}
		if (messages.length) throw new ValueFeedback(messages.join("\n"), unsafeData);
		if (changed || getDataKeys(unsafeData).length > props.length) return safeData as T;
		return unsafeData as T;
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
