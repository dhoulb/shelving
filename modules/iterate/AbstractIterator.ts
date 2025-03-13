/** Abstract generator designed to be extended that implements the full generator protocol. */
export abstract class AbstractIterator<T, R, N> implements Iterator<T, R, N>, Iterable<T, R, N> {
	// Implement `Iterator`
	abstract next(value: N): IteratorResult<T, R>;
	throw(thrown: unknown): IteratorResult<T, R> {
		// Default behaviour for a generator is to throw the error back out of the iterator and not continue.
		throw thrown;
	}
	return(value: R): IteratorResult<T, R> {
		// Default behaviour for a generator is to return `done: true` and the input value.
		return { done: true, value };
	}

	// Implement `Iterable`
	[Symbol.iterator](): Iterator<T, R, N> {
		return this;
	}
}
