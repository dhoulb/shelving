/** Sequence of values designed to be extended that implements the full async generator protocol. */
export abstract class AbstractSequence<T, R, N> implements AsyncIterator<T, R, N>, AsyncIterable<T, R, N> {
	readonly [Symbol.toStringTag] = "Sequence";

	// Implement `AsyncIterator`
	abstract next(value: N): Promise<IteratorResult<T, R>>;
	async return(returnValue: R | PromiseLike<R>): Promise<IteratorResult<T, R>> {
		// Default behaviour for a generator is to return `done: true` and the input value.
		return { done: true, value: await returnValue };
	}
	throw(reason: unknown): Promise<IteratorResult<T, R>> {
		// Default behaviour for a generator is to throw the error back out of the iterator and not continue.
		throw reason;
	}

	// Implement `AsyncIterable`
	[Symbol.asyncIterator](): AsyncIterator<T, R, N> {
		return this;
	}
}
