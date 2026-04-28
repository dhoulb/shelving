import { UnexpectedError } from "../error/UnexpectedError.js";
import { getDeferred, getDelay } from "./async.js";
import { ABORT } from "./constants.js";
import type { AnyCaller, ErrorCallback, ValueCallback } from "./function.js";

export interface IteratorAbortResult<R> {
	done: typeof ABORT;
	value: R;
}

/** An extension of  */
export type IteratorAbortableResult<T, R> = IteratorResult<T, R> | IteratorAbortResult<R>;

/** Turn a `Promise<R>` into an `IteratorAbortResult<R>` */
async function _awaitAbort<R>(value: PromiseLike<R>): Promise<IteratorAbortResult<R | undefined>> {
	return { done: ABORT, value: await value };
}

/** Call an iterator's `return()` method (if it exists) with an initial value, and return the `value` it returns. */
async function _iteratorReturn<T, R, N>(
	iterator: AsyncIterator<T, R | undefined, N | undefined>,
	initial: R | undefined,
	caller: AnyCaller,
): Promise<R | undefined> {
	if (iterator.return) {
		const { done, value } = await iterator.return(initial);
		if (done) return value;
		throw new UnexpectedError("Iterator return() must return done result", { received: done, iterator, caller });
	}
	return initial;
}

/**
 * Is a value an async iterable object?
 * - Any object with a `Symbol.iterator` property is iterable.
 * - Note: Array and Map instances etc will return true because they implement `Symbol.iterator`
 */
export function isSequence(value: unknown): value is AsyncIterable<unknown> {
	return typeof value === "object" && !!value && Symbol.asyncIterator in value;
}

/** Infinite sequence that yields until a `SIGNAL` is received. */
export async function* repeatUntil<T = void, R = void, N = void>(
	source: AsyncIterable<T, R | undefined, N | undefined>,
	...signals: [PromiseLike<R>, ...PromiseLike<R>[]]
): AsyncGenerator<T, R | undefined, N | undefined> {
	const iterator: AsyncIterator<T, R | undefined, N | undefined> = source[Symbol.asyncIterator]();
	let n: N | undefined;
	while (true) {
		try {
			const { done, value } = await Promise.race([
				iterator.next(n),
				...signals.map<Promise<IteratorAbortResult<R | undefined>>>(_awaitAbort),
			]);
			if (done) {
				// For aborts, tell the iterator we're no longer using it.
				if (done === ABORT) return _iteratorReturn(iterator, value, repeatUntil);

				// Don't need to do this for `done: true` results from the iterator, because we assume the iterator stopped itself.
				return value;
			}
			n = yield value;
		} catch (thrown) {
			// If the iterator threw we need to tell the iterator we're no longer using it so it can dispose of its resources.
			// Most iterators and generators will already have cleaned up when they threw.
			// But the iterator protocol does not _require_ that, so to be safe we explicitly tell the iterator it's no longer being used.
			if (iterator.return) await iterator.return(undefined);

			// Rethrow the error.
			throw thrown;
		}
	}
}

/** Infinite sequence that yields every X milliseconds (yields a count of the number of iterations). */
export async function* repeatDelay(ms: number): AsyncGenerator<number, void, void> {
	let count = 1;
	while (true) {
		await getDelay(ms);
		yield count++;
	}
}

/** Dispatch items in a sequence to a (possibly async) callback. */
export async function* callSequence<T>(sequence: AsyncIterable<T, void, void>, callback: ValueCallback<T>): AsyncGenerator<T, void, void> {
	for await (const item of sequence) {
		callback(item);
		yield item;
	}
}

/**
 * Iterate over a sequence until the returned `stop()` callback is called.
 *
 * Regarding errors:
 * - Does not stop iterating on errors, simply sends the error to `onError()` and continues to iterate.
 * - On the following iterator after throwing an error, a "generator" will return `done: true` (because they regard errors as concluding the iteration).
 * - But the iterator protocol does not require this, so this continues to iterate until it's explicitly ended via the returned `stop()` callback.
 *
 * @return Callback function that can end the sequence run.
 */
export function runSequence<T, R, N>(
	sequence: AsyncIterable<T, R | undefined, N | undefined>,
	onNext?: (value: T) => N | undefined,
	onError?: ErrorCallback,
	onReturn?: (value: R | undefined) => void,
): (value?: R | undefined) => void {
	const { promise, resolve } = getDeferred<IteratorAbortResult<R | undefined>>();
	void _runSequenceIterator(sequence[Symbol.asyncIterator](), promise, onNext, onError, onReturn);
	return (value?: R | undefined) => resolve({ done: ABORT, value });
}
async function _runSequenceIterator<T, R, N>(
	iterator: AsyncIterator<T, R | undefined, N | undefined>,
	stopped: Promise<IteratorAbortResult<R | undefined>>,
	onNext?: (value: T) => N | undefined,
	onError?: ErrorCallback,
	onReturn?: (value: R | undefined) => void,
): Promise<unknown> {
	let n: N | undefined;
	while (true) {
		try {
			const { done, value }: IteratorAbortableResult<T, R | undefined> = await Promise.race([stopped, iterator.next(n)]);
			if (done) {
				// For manual aborts tell the iterator we're no longer using it.
				if (done === ABORT) {
					const v = await _iteratorReturn(iterator, value, runSequence);
					return onReturn?.(v);
				}

				// Don't need to do this for `done: true` results from the iterator, because we assume the iterator stopped itself.
				return onReturn?.(value);
			}
			n = onNext?.(value);
		} catch (reason) {
			// Just send the reason to the error handler don't stop iteration.
			// On the next iteration generators and most iterators that keep internal state will return `done: true` anyway.
			onError?.(reason);
		}
	}
}

/** Merge several sequences (calls the sequences in series). */
export async function* mergeSequences<T>(...sequences: AsyncIterable<T>[]): AsyncIterable<T> {
	for await (const sequence of sequences) yield* sequence;
}
