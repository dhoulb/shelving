import type { AnyConstructor } from "../util/class.js";
import type { AnyFunction } from "../util/function.js";

/** Any calling function or constructor that can appear in a stack tracer. */
export type AnyCaller = AnyFunction | AnyConstructor;

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
	/** Provide additional named contextual data that should be attached to the `Error` instance. */
	[key: string]: unknown;

	constructor(message?: string, options?: BaseErrorOptions) {
		if (options) {
			super(message, options);
			const { cause, caller = BaseError, ...rest } = options;
			for (const [key, value] of Object.entries(rest)) this[key] = value;
			Error.captureStackTrace(this, caller);
		} else {
			super(message);
			Error.captureStackTrace(this, BaseError);
		}
	}
}
BaseError.prototype.name = "BaseError";
BaseError.prototype.message = "Unknown error";
