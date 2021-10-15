import type { Stream } from "./Stream.js";

/** Thrown if we're dispatching to a Stream that has already closed. */
export class StreamClosedError<I, O> extends Error {
	stream: Stream<I, O>;
	constructor(stream: Stream<I, O>) {
		super("Stream is closed");
		this.stream = stream;
	}
}
