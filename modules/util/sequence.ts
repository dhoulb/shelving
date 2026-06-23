import { UnexpectedError } from "../error/UnexpectedError.js";
import { createDeferred, getDelay } from "./async.js";
import { ABORT } from "./constants.js";
import type { AnyCaller, ErrorCallback, ValueCallback } from "./function.js";

/**
 * Result of an iterator that was aborted via an external signal rather than concluding itself.
 * - `done` is the `ABORT` symbol, distinguishing it from an iterator's own `done: true` result.
 *
 * @see https://shelving.cc/util/sequence/IteratorAbortResult
 */
export interface IteratorAbortResult<R> {
	/** Always the `ABORT` symbol, marking this result as an external abort rather than the iterator finishing. */
	done: typeof ABORT;
	/** The value the abort signal resolved with. */
	value: R;
}

/**
 * Result of stepping an iterator that may either yield, finish itself, or be aborted externally.
 * - Union of a normal `IteratorResult<T, R>` and an `IteratorAbortResult<R>`.
 *
 * @see https://shelving.cc/util/sequence/IteratorAbortableResult
 */
export type IteratorAbortableResult<T, R> = IteratorResult<T, R> | IteratorAbortResult<R>;

/** Turn a `Promise<R>` into an `IteratorAbortResult<R>` */
function _awaitAbortResult<R>(value: PromiseLike<R>): PromiseLike<IteratorAbortResult<R>> {
	return value.then(_getAbortResult);
}

/** Turn a result `R` into an `IteratorAbortResult<R>` */
function _getAbortResult<R>(value: R): IteratorAbortResult<R> {
	return { done: ABORT, value };
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
 * - Any object with a `Symbol.asyncIterator` property is an async iterable.
 *
 * @param value The value to test.
 * @returns `true` if `value` is an `AsyncIterable`, narrowing its type.
 * @example isSequence((async function* () {})()) // true
 * @see https://shelving.cc/util/sequence/isSequence
 */
export function isSequence(value: unknown): value is AsyncIterable<unknown> {
	return typeof value === "object" && !!value && Symbol.asyncIterator in value;
}

/**
 * Infinite sequence that relays a source sequence until one of the abort signals resolves.
 * - Races each step of `source` against the supplied signal promises; when a signal wins, tells the source iterator to clean up and returns the signal's value.
 *
 * @param source The source sequence to relay values from.
 * @param signals One or more promises that, when resolved, abort the relay and end the sequence.
 * @returns The value the winning abort signal resolved with, or the source's own return value if it finishes first.
 * @throws {UnexpectedError} If the source iterator's `return()` does not return a `done` result.
 * @example for await (const item of repeatUntil(source, stopSignal)) doSomething(item);
 * @see https://shelving.cc/util/sequence/repeatUntil
 */
export async function* repeatUntil<T = void, R = void, N = void>(
	source: AsyncIterable<T, R | undefined, N | undefined>,
	...signals: [PromiseLike<R>, ...PromiseLike<R>[]]
): AsyncGenerator<T, R | undefined, N | undefined> {
	const iterator: AsyncIterator<T, R | undefined, N | undefined> = source[Symbol.asyncIterator]();
	const aborts = signals.map(_awaitAbortResult);
	let n: N | undefined;
	while (true) {
		try {
			const next = iterator.next(n);
			const { done, value } = await (aborts.length ? Promise.race([next, ...aborts]) : next);
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

/**
 * Infinite sequence that yields every X milliseconds (yields a count of the number of iterations).
 *
 * @param ms The number of milliseconds to wait between each yield.
 * @returns An infinite async generator yielding `1`, `2`, `3`… one per interval.
 * @example for await (const count of repeatDelay(1000)) console.log(count); // 1, 2, 3… one per second
 * @see https://shelving.cc/util/sequence/repeatDelay
 */
export async function* repeatDelay(ms: number): AsyncGenerator<number, void, void> {
	let count = 1;
	while (true) {
		await getDelay(ms);
		yield count++;
	}
}

/**
 * Dispatch items in a sequence to a (possibly async) callback.
 * - Calls `callback` with each item as it arrives, then re-yields the item unchanged.
 *
 * @param sequence The source sequence to relay.
 * @param callback Callback invoked with each yielded item.
 * @returns An async generator that yields the same items as `sequence`.
 * @example for await (const item of callSequence(source, console.log)) use(item);
 * @see https://shelving.cc/util/sequence/callSequence
 */
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
 * @param sequence The source sequence to iterate over.
 * @param onNext Called with each yielded value; its return value is fed back into the iterator as the next `next()` argument.
 * @param onError Called with any error thrown during iteration (iteration continues regardless).
 * @param onReturn Called with the final return value when the sequence ends or is stopped.
 * @returns Callback function that can end the sequence run, optionally with a return value.
 * @throws {UnexpectedError} If the source iterator's `return()` does not return a `done` result.
 * @example const stop = runSequence(source, onNext, onError, onReturn); stop(); // ends the run
 * @see https://shelving.cc/util/sequence/runSequence
 */
export function runSequence<T, R, N>(
	sequence: AsyncIterable<T, R | undefined, N | undefined>,
	onNext?: (value: T) => N | undefined,
	onError?: ErrorCallback,
	onReturn?: (value: R | undefined) => void,
): (value?: R | undefined) => void {
	const { promise, resolve } = createDeferred<IteratorAbortResult<R | undefined>>();
	void _runSequenceIterator(sequence[Symbol.asyncIterator](), promise, onNext, onError, onReturn);
	return (value?: R | undefined) => resolve(_getAbortResult(value));
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

/**
 * Merge several sequences (calls the sequences in series).
 * - Yields all items from the first sequence, then all items from the second, and so on.
 *
 * @param sequences The sequences to merge, drained one after another in order.
 * @returns An async iterable that yields every item from each sequence in turn.
 * @example for await (const item of mergeSequences(a, b)) use(item); // all of `a`, then all of `b`
 * @see https://shelving.cc/util/sequence/mergeSequences
 */
export async function* mergeSequences<T>(...sequences: AsyncIterable<T>[]): AsyncIterable<T> {
	for await (const sequence of sequences) yield* sequence;
}
