import { ObserverType, Subscribable } from "../util/index.js";
import { AbstractStream } from "./AbstractStream.js";

/** Any stream (useful for `extends AnyStream` clauses). */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyStream = Stream<any>;

/**
 * Simple stream.
 * - Does no deriving (input and output types are the same).
 */
export class Stream<T> extends AbstractStream<T, T> {
	// Input and output types are the same for a plain stream.
	protected override _derive(value: T): void {
		this._dispatch(value);
	}
}

/** Subscribe from a source to a new or existing stream. */
export function subscribeStream<T extends AnyStream>(source: Subscribable<ObserverType<T>>, target: T): T;
export function subscribeStream<T>(source: Subscribable<T>): Stream<T>;
export function subscribeStream<T>(source: Subscribable<T>, target: Stream<T> = new Stream()): Stream<T> {
	target.start(source);
	return target;
}
