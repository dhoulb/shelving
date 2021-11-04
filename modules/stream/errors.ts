import type { Observer } from "../index.js";
import type { Stream } from "./Stream.js";

/** An error in a stream. */
export class StreamError<T> extends Error {
	readonly stream: Stream<T>;
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

/** Thrown if the observer we're trying to attach to a stream has already closed. */
export class ObserverClosedError<T> extends StreamError<T> {
	readonly observer: Observer<T>;
	constructor(stream: Stream<T>, observer: Observer<T>) {
		super("Observer is closed", stream);
		this.observer = observer;
	}
}
