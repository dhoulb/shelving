import { type BaseError, type BaseErrorOptions, setBaseErrorOptions } from "./BaseError.js";

/** Thrown in the event of network issues e.g. the user's internet connection is down, or the server is down. */
export class NetworkError extends Error implements BaseError {
	/** Provide additional named contextual data that is relevant to the `Error` instance. */
	readonly [key: string]: unknown;

	constructor(message?: string, options: BaseErrorOptions = {}) {
		super(message, options);
		setBaseErrorOptions(NetworkError, this, options);
	}
}
NetworkError.prototype.name = "NetworkError";
