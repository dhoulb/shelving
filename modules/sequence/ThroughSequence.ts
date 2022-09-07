import { AbstractSequence } from "./AbstractSequence.js";

/** Async iterable that pulls values from a source async iterable. */
export class ThroughSequence<T, R> extends AbstractSequence<T, R> {
	private readonly _source: AsyncIterator<T, R>;
	constructor(source: AsyncIterator<T, R>) {
		super();
		this._source = source;
	}

	// Implement `AbstractSequence`
	next(): Promise<IteratorResult<T, R>> {
		return this._source.next();
	}
	override throw(thrown: Error | unknown): Promise<IteratorResult<T, R>> {
		return this._source?.throw?.(thrown) || super.throw(thrown);
	}
	override return(value: R | PromiseLike<R>): Promise<IteratorResult<T, R>> {
		return this._source?.return?.(value) || super.return(value);
	}
}
