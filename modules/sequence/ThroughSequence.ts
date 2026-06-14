import { awaitDispose, isAsyncDisposable } from "../util/dispose.js";
import { Sequence } from "./Sequence.js";

/**
 * Async iterable that pulls values from a source async iterable.
 * - Can be used to turn an `AsyncIterator` into an `AsyncIterableIterator`
 * - Can be used to ensure `throw()` and `return()` are always set on an `AsyncIterator`
 *
 * @example
 * 	const seq = new ThroughSequence(someAsyncIterator);
 * 	for await (const value of seq) console.log(value);
 * @see https://dhoulb.github.io/shelving/sequence/ThroughSequence/ThroughSequence
 */
export class ThroughSequence<T, R, N> extends Sequence<T, R | undefined, N | undefined> {
	/**
	 * Source async iterator that this sequence pulls values from.
	 *
	 * @see https://dhoulb.github.io/shelving/sequence/ThroughSequence/ThroughSequence/source
	 */
	readonly source: AsyncIterator<T, R | undefined, N | undefined>;

	/**
	 * Create a new `ThroughSequence` wrapping a source iterator.
	 *
	 * @param source Async iterator to pull values from.
	 */
	constructor(source: AsyncIterator<T, R | undefined, N | undefined>) {
		super();
		this.source = source;
	}
	next(value?: N | undefined): Promise<IteratorResult<T, R | undefined>> {
		return this.source.next(value);
	}
	override async return(value?: R | undefined | PromiseLike<R | undefined>): Promise<IteratorResult<T, R | undefined>> {
		return this.source.return ? this.source.return(value) : super.return(value);
	}
	override throw(reason?: unknown): Promise<IteratorResult<T, R | undefined>> {
		return this.source.throw ? this.source.throw(reason) : super.throw(reason);
	}
	override async [Symbol.asyncDispose](): Promise<void> {
		await awaitDispose(
			isAsyncDisposable(this.source) ? this.source : undefined, // Stop the source.
			super[Symbol.asyncDispose](),
		);
	}
}
