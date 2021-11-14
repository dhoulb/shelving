import { isObject, ImmutableObject } from "./object.js";

/** Object that can validate an unknown value with its `validate()` method. */
export interface Validatable<T> {
	/**
	 * `validate()` method accepts an unsafe value and returns a valid value.
	 *
	 * @param unsafeValue A potentially invalid value.
	 *
	 * @returns Valid value.
	 *
	 * @throws `Error` If the value is invalid and cannot be fixed.
	 * @throws `InvalidFeedback` If the value is invalid and cannot be fixed and we want to explain why to an end user.
	 */
	validate(unsafeValue?: unknown): T;
}

/** Object that can validate an unknown value with its `validate()` method, or a function that can do the same. */
export type Validator<T> = Validatable<T> | ((unsafeValue?: unknown) => T);

/** Any observer (useful for `extends AnyValidator` clauses). */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyValidator = Validator<any>;

/** Extract the type from a Validator. */
export type ValidatorType<X extends AnyValidator> = X extends Validator<infer Y> ? Y : never;

/** Is a given value a validator? */
export const isValidator = <T extends AnyValidator>(validator: T | unknown): validator is T => isObject(validator) && typeof validator.validate === "function";

/** A set of named validators in `{ name: Validator }` format. */
export type Validators<T extends ImmutableObject> = { readonly [K in keyof T]: Validator<T[K]> };

/** Any observer (useful for `extends AnyValidators` clauses). */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyValidators = Validators<any>;

/** Extract the type from a `Validators`. */
export type ValidatorsType<X extends AnyValidators> = X extends Validators<infer Y> ? Y : never;

/** Validate an unknown value with a `Validator`. */
export function validate<T>(validator: Validator<T>, unsafeValue?: unknown): T {
	return typeof validator === "function" ? validator(unsafeValue) : validator.validate(unsafeValue);
}
