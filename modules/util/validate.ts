import { isObject, ImmutableObject } from "./object";

/**
 * Validator: an object that can validate something via its `validate()` method.
 */
export interface Validator<T = unknown> {
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

/** Extract the type from a Validator. */
export type ValidatorType<T extends Validator> = ReturnType<T["validate"]>;

/** Is a given value a validator? */
export const isValidator = <T extends Validator>(validator: T | unknown): validator is T => isObject(validator) && typeof validator.validate === "function";

/** A set of named validators in `{ key: Validator }` format. */
export type Validators<T extends ImmutableObject> = {
	readonly [K in keyof T]: Validator<T[K]>;
};
