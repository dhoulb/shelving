import { Sequence } from "./Sequence.js";

/**
 * Async iterable that pulls values from a source async iterable.
 * - Can be used to turn an `AsyncIterator` into an `AsyncIterableIterator`
 * - Can be used to ensure `throw()` and `return()` are always set on an `AsyncIterator`
 */
export class ThroughSequence<T, R, N> extends Sequence<T, R | undefined, N | undefined> {
	readonly source: AsyncIterator<T, R | undefined, N | undefined>;
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
}
