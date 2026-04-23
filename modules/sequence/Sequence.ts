/** Sequence of values designed to be extended that implements the full async generator protocol. */
export abstract class Sequence<T, R, N> implements AsyncGenerator<T, R | undefined, N | undefined>, AsyncDisposable {
	readonly [Symbol.toStringTag] = "Sequence";

	/**
	 * Get a next value from this async iterator.
	 *
	 * @param value Optional next value that gets returned from `yield` statements.
	 * - Rarely used in real world appliations.
	 * - Will be `undefined` on the first call.
	 * - Will be the `N` next value on subsequent calls.
	 *
	 * @returns An incomplete iterator result with `done: false` and `value: T`.
	 */
	abstract next(value?: N | undefined): Promise<IteratorResult<T, R | undefined>>;

	/**
	 * Finish iteration and optionally provide the iterator's final return value.
	 * - Mirrors the default async generator `return()` behaviour.
	 * - Subclasses can override this to perform cleanup before the sequence stops.
	 *
	 * @param value Optional return value that gets returned
	 * - Rarely used in real world applications.
	 * - Will be `undefined` on the first call.
	 *
	 * @returns A completed iterator result with `done: true`.
	 */
	async return(value?: R | undefined | PromiseLike<R | undefined>): Promise<IteratorResult<T, R | undefined>> {
		// Default behaviour for a generator is to return `done: true` and repeat back input value.
		return { done: true, value: await value };
	}

	/**
	 * Throw an error into this iterator.
	 * - Mirrors the default async generator `throw()` behaviour.
	 * - Subclasses can override this to recover from errors or perform cleanup.
	 *
	 * @param reason Error or other thrown value to send into the iterator.
	 */
	throw(reason: unknown): Promise<IteratorResult<T, R | undefined>> {
		// Default behaviour for a generator is to throw the error back out of the iterator and not continue.
		throw reason;
	}

	// Implement `AsyncIterable`
	async *[Symbol.asyncIterator](): AsyncGenerator<T, R | undefined, N | undefined> {
		const result = await this.next();
		if (result.done) return result.value;
		let n = yield result.value;
		while (true) {
			const result = await this.next(n);
			if (result.done) return result.value;
			n = yield result.value;
		}
	}

	// Implement `AsyncDisposable`
	async [Symbol.asyncDispose](): Promise<void> {
		await this.return();
	}
}
