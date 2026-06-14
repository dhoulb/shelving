import type { AnyCaller } from "../util/function.js";

/**
 * Options for `BaseError` that provide additional helpful error functionality.
 * - Extends the built-in `ErrorOptions` (so `cause` is supported) and adds a `caller` plus arbitrary contextual fields.
 *
 * @see https://dhoulb.github.io/shelving/error/BaseError/BaseErrorOptions
 */
export interface BaseErrorOptions extends globalThis.ErrorOptions {
	/**
	 * Provide additional named contextual data that should be attached to the `Error` instance.
	 * - The fields `cause:` and `caller:` are ignored.
	 * - `received` and `expected` are recommended for values.
	 */
	[key: string]: unknown;

	/** Modify the stack to trim off lines after a certain calling function. */
	caller?: AnyCaller | undefined;
}

/**
 * An `Error` that provides additional helpful functionality.
 * - Carries arbitrary named contextual data alongside the standard `Error` fields.
 * - All concrete error classes in this module (`ValueError`, `RequiredError`, etc.) implement this shape.
 *
 * @see https://dhoulb.github.io/shelving/error/BaseError/BaseError
 */
export interface BaseError extends Error {
	/** Provide additional named contextual data that is relevant to the `Error` instance. */
	readonly [key: string]: unknown;
}

/**
 * Apply `BaseErrorOptions` to an error instance by copying contextual fields onto it and trimming its stack.
 * - Copies every option except `cause` and `caller` onto the error as a named property.
 * - Uses `Error.captureStackTrace()` with the resolved caller so the stack points at the user's call site, not the error plumbing.
 *
 * @param defaultCaller Function to attribute the stack to when `options.caller` is not supplied.
 * @param error The `BaseError` instance to mutate with contextual data and a trimmed stack.
 * @param options Options to apply — `cause` and `caller` are consumed, all other keys are copied onto `error`.
 * @returns Nothing — `error` is mutated in place.
 * @example
 * 	const error = new ValueError("Wrong");
 * 	setBaseErrorOptions(ValueError, error, { received: 123, caller: myFunction });
 * @see https://dhoulb.github.io/shelving/error/BaseError/setBaseErrorOptions
 */
export function setBaseErrorOptions(defaultCaller: AnyCaller, error: BaseError, options: BaseErrorOptions): void {
	const { cause: _cause, caller = defaultCaller, ...rest } = options;
	for (const [key, value] of Object.entries(rest)) (error as Record<string, unknown>)[key] = value;
	if (caller) Error.captureStackTrace(error, caller);
}
