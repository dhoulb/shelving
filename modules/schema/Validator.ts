import { isObject, ImmutableObject } from "../object";

/** Options for the `validate()` method. */
export type ValidateOptions = {
	/** Whether partial object values are allowed, e.g. missing values aren't invalid. */
	partial?: boolean;

	/** Any additional options are passed through to the Provider. */
	[additional: string]: unknown;
};

/** Validate a partial value rather than a full value. */
export const PARTIAL = { partial: true } as const;

/**
 * Validator: an object that can validate something.
 */
export interface Validator<T = unknown> {
	/**
	 * `validate()` method accepts an unsafe value and returns a valid value.
	 *
	 * @param unsafeValue A potentially invalid value.
	 * @param partial Whether or not to to allow `undefined` values (i.e. call any functions and strip any undefined values).
	 *
	 * @returns Valid value.
	 *
	 * @throws `Error` If the value is invalid and cannot be fixed.
	 * @throws `InvalidFeedback` If the value is invalid and cannot be fixed and we want to explain why to an end user.
	 */
	validate(unsafeValue?: unknown, options?: ValidateOptions): T;
}

/** Extract the type from a Validator. */
export type ValidatorType<T extends Validator> = ReturnType<T["validate"]>;

/**
 * Is a given value a valid schema?
 * - This is a TypeScript assertion function, so if this function returns `true` the type is also asserted to implement `Validator`.
 */
export const isValidator = <T extends Validator>(validator: T | unknown): validator is T => isObject(validator) && typeof validator.validate === "function";

/** A set of named validators in `{ key: Validator }` format. */
export type Validators<T extends ImmutableObject> = { readonly [K in keyof T]: Validator<T[K]> };
