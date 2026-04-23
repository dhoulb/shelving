import type { AnyCaller } from "../util/function.js";

/** Options for `BaseError` that provide additional helpful error functionality. */
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

/** Define an error that provides additional helpful functionality. */
export interface BaseError extends Error {
	/** Provide additional named contextual data that is relevant to the `Error` instance. */
	readonly [key: string]: unknown;
}

export function setBaseErrorOptions(defaultCaller: AnyCaller, error: BaseError, options: BaseErrorOptions): void {
	const { cause: _cause, caller = defaultCaller, ...rest } = options;
	for (const [key, value] of Object.entries(rest)) (error as Record<string, unknown>)[key] = value;
	if (caller) Error.captureStackTrace(error, caller);
}
