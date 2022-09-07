import { setPrototype } from "../util/class.js";

/** Abstract generator designed to be extended that implements the full generator protocol. */
export abstract class AbstractGenerator<T, R, N> implements Generator<T, R, N> {
	@setPrototype(Symbol.toStringTag, "Generator") readonly [Symbol.toStringTag]!: string;

	// Implement `Iterator`
	abstract next(value: N): IteratorResult<T, R>;
	throw(thrown: Error | unknown): IteratorResult<T, R> {
		// Default behaviour for a generator is to throw the error back out of the iterator and not continue.
		throw thrown;
	}
	return(value: R): IteratorResult<T, R> {
		// Default behaviour for a generator is to return `done: true` and the input value.
		return { done: true, value };
	}

	// Implement `Iterable`
	[Symbol.iterator](): Generator<T, R, N> {
		return this;
	}
}
