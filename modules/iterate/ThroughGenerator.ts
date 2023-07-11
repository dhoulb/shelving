import { AbstractGenerator } from "./AbstractGenerator.js";

/** Iterable that pulls values from a source iterable. */
export class ThroughGenerator<T, R, N> extends AbstractGenerator<T, R, N> {
	private readonly _source: Iterator<T, R, N>;
	constructor(iterator: Iterator<T, R, N>) {
		super();
		this._source = iterator;
	}

	// Implement `AbstractGenerator`
	next(value: N): IteratorResult<T, R> {
		return this._source.next(value);
	}
	override throw(thrown: Error | unknown): IteratorResult<T, R> {
		return this._source.throw ? this._source.throw(thrown) : super.throw(thrown);
	}
	override return(value: R): IteratorResult<T, R> {
		return this._source.return ? this._source.return(value) : super.return(value);
	}
}
