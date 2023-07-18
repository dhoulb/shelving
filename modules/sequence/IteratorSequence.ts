/**
 * Turn an `AsyncIterator` back into an `AsyncIterable`
 * - Useful to avoid infinite loops when you want to use `yield* this` in `[Symbol.asyncIterator]()`
 */
export class IteratorSequence<T> implements AsyncIterable<T> {
	private readonly _iterator: AsyncIterator<T, void, void>;
	constructor(iterator: AsyncIterator<T, void, void>) {
		this._iterator = iterator;
	}
	[Symbol.asyncIterator](): AsyncIterator<T, void, void> {
		return this._iterator;
	}
}
