import { type BaseError, type BaseErrorOptions, setBaseErrorOptions } from "./BaseError.js";

/** Thrown when a value is wrong or unexpected. */
export class ValueError extends Error implements BaseError {
	/** Provide additional named contextual data that is relevant to the `Error` instance. */
	readonly [key: string]: unknown;

	constructor(message?: string, options: BaseErrorOptions = {}) {
		super(message, options);
		setBaseErrorOptions(ValueError, this, options);
	}
}
ValueError.prototype.name = "ValueError";
