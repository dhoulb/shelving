import type { MutableDictionary } from "../util/dictionary.js";
import type { AnyCaller } from "../util/function.js";

/** Options for `BaseError` that provide additional helpful error functionality. */
export interface BaseErrorOptions extends ErrorOptions {
	/**
	 * Provide additional named contextual data that should be attached to the `Error` instance.
	 * - The fields `cause:` and `caller:` are ignored.
	 * - `received` and `expected` are recommended for values.
	 */
	[key: string]: unknown;

	/** Modify the stack to trim off lines after a certain calling function. */
	caller?: AnyCaller | undefined;
}

/** An error that provides additional helpful functionality. */
export abstract class BaseError extends Error {
	/** Provide additional named contextual data that is relevant to the `Error` instance. */
	readonly [key: string]: unknown;

	constructor(message?: string, options: BaseErrorOptions = {}) {
		super(message, options);
		const { cause, caller = BaseError, ...rest } = options;
		for (const [key, value] of Object.entries(rest)) (this as MutableDictionary<unknown>)[key] = value;
		Error.captureStackTrace(this, caller);
	}
}
BaseError.prototype.name = "BaseError";
