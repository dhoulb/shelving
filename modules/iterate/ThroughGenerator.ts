import { AbstractGenerator } from "./AbstractGenerator.js";

/** Iterable that pulls values from a source iterable. */
export class ThroughGenerator<T, R, N> extends AbstractGenerator<T, R, N> {
	private readonly _iterator: Iterator<T, R, N>;
	constructor(iterator: Iterator<T, R, N>) {
		super();
		this._iterator = iterator;
	}

	// Implement `AbstractGenerator`
	next(value: N): IteratorResult<T, R> {
		return this._iterator.next(value);
	}
	override throw(thrown: Error | unknown): IteratorResult<T, R> {
		return this._iterator.throw ? this._iterator.throw(thrown) : super.throw(thrown);
	}
	override return(value: R): IteratorResult<T, R> {
		return this._iterator.return ? this._iterator.return(value) : super.return(value);
	}
}
