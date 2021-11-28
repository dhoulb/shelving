/** Thrown if the observer we're trying to attach to a stream has already closed. */
export class StreamClosedError extends Error {
	constructor(message = "Stream is closed") {
		super(message);
	}
}
