import { AbstractSequence } from "./AbstractSequence.js";

/** Async iterable that pulls values from a source async iterable. */
export class ThroughSequence<T, R, N> extends AbstractSequence<T, R, N> {
	private readonly _source: AsyncIterator<T, R, N>;
	constructor(source: AsyncIterator<T, R, N>) {
		super();
		this._source = source;
	}

	// Implement `AbstractSequence`
	next(next: N): Promise<IteratorResult<T, R>> {
		return this._source.next(next);
	}
	override throw(thrown: unknown): Promise<IteratorResult<T, R>> {
		return this._source.throw ? this._source.throw(thrown) : super.throw(thrown);
	}
	override return(value: R | PromiseLike<R>): Promise<IteratorResult<T, R>> {
		return this._source.return ? this._source.return(value) : super.return(value);
	}
}
