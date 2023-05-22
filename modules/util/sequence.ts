import type { Stop } from "./activity.js";
import type { AsyncDispatch, Dispatch, Handler } from "./function.js";
import { RequiredError } from "../error/RequiredError.js";
import { getDeferred, getDelay } from "./async.js";
import { STOP } from "./constants.js";
import { logError } from "./error.js";
import { dispatch } from "./function.js";

/**
 * Is a value an async iterable object?
 * - Any object with a `Symbol.iterator` property is iterable.
 * - Note: Array and Map instances etc will return true because they implement `Symbol.iterator`
 */
export const isAsyncIterable = <T extends AsyncIterable<unknown>>(value: T | unknown): value is T => typeof value === "object" && !!value && Symbol.asyncIterator in value;

/** Infinite sequence that yields until a `SIGNAL` is received. */
export async function* repeatUntil<T>(source: AsyncIterable<T>, ...signals: [Promise<typeof STOP>, ...Promise<typeof STOP>[]]): AsyncIterable<T> {
	const iterator: AsyncIterator<T, unknown, undefined> = source[Symbol.asyncIterator]();
	while (true) {
		const result = await Promise.race([iterator.next(), ...signals]);
		if (result === STOP) {
			await iterator.return?.(); // Make sure we call `return()` on the iterator because it might do cleanup.
			return STOP;
		} else if (result.done) {
			return result.value;
		} else {
			yield result.value;
		}
	}
}

/** Infinite sequence that yields every X milliseconds (yields a count of the number of iterations). */
export async function* repeatDelay(ms: number): AsyncIterable<number> {
	let count = 1;
	while (true) {
		await getDelay(ms);
		yield count++;
	}
}

/** Dispatch items in a sequence to a (possibly async) callback. */
export async function* dispatchSequence<T>(sequence: AsyncIterable<T>, onNext: AsyncDispatch<T>): AsyncIterable<T> {
	for await (const item of sequence) {
		dispatch(onNext, item);
		yield item;
	}
}

/** Get the first value from an async iterator. **/
export async function getNextValue<T>(sequence: AsyncIterable<T>): Promise<T> {
	for await (const item of sequence) return item;
	throw new RequiredError("First value is required");
}

/** Pull values from a sequence until the returned function is called. */
export function runSequence<T>(sequence: AsyncIterable<T>, onNext?: Dispatch<T>, onError: Handler = logError): Stop {
	const { promise, resolve } = getDeferred<typeof STOP>();
	_runSequence(sequence[Symbol.asyncIterator](), promise, onNext, onError).catch(onError).catch(logError);
	return () => resolve(STOP);
}
async function _runSequence<T>(iterator: AsyncIterator<T>, stopped: Promise<typeof STOP>, onNext: Dispatch<T> | undefined, onError: Handler): Promise<unknown> {
	try {
		const result = await Promise.race([stopped, iterator.next()]);
		if (result === STOP || result.done) {
			// Stop iteration because the stop signal was sent or the iterator is done.
			return iterator.return?.(); // Make sure we call `return()` on the iterator because it might do cleanup.
		} else {
			// Dispatch the current value and await the next value in the sequence.
			if (onNext) onNext(result.value);
		}
	} catch (thrown) {
		onError(thrown);
	}

	// Continue iteration.
	return _runSequence(iterator, stopped, onNext, onError);
}
