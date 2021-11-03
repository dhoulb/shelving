import type { Stream } from "./Stream.js";

/** An error in a stream. */
export class StreamError<T> extends Error {
	stream: Stream<T>;
	constructor(message: string, stream: Stream<T>) {
		super(message);
		this.stream = stream;
	}
}

/** Thrown if we're dispatching to a Stream that has already closed. */
export class StreamClosedError<T> extends StreamError<T> {
	constructor(stream: Stream<T>) {
		super("Stream is closed", stream);
	}
}

/** Thrown if we're dispatching to a Stream that already has a source subscription. */
export class StreamStartedError<T> extends StreamError<T> {
	constructor(stream: Stream<T>) {
		super("Stream already has a source subscription", stream);
	}
}
