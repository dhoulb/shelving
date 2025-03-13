import { AbstractIterator } from "./AbstractIterator.js";

/** Iterable that pulls values from a source iterable. */
export class ThroughIterator<T, R, N> extends AbstractIterator<T, R, N> implements Iterator<T, R, N>, Iterable<T, R, N> {
	private readonly _source: Iterator<T, R, N>;
	constructor(iterator: Iterator<T, R, N>) {
		super();
		this._source = iterator;
	}

	// Implement `AbstractIterator`
	next(value: N): IteratorResult<T, R> {
		return this._source.next(value);
	}
	override throw(thrown: unknown): IteratorResult<T, R> {
		return this._source.throw ? this._source.throw(thrown) : super.throw(thrown);
	}
	override return(value: R): IteratorResult<T, R> {
		return this._source.return ? this._source.return(value) : super.return(value);
	}
}
