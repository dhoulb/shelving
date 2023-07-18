import type { AsyncValueCallback, ErrorCallback, StopCallback, ValueCallback } from "./callback.js";
import { RequiredError } from "../error/RequiredError.js";
import { getDeferred, getDelay } from "./async.js";
import { call, callMethod } from "./callback.js";
import { STOP } from "./constants.js";

/**
 * Is a value an async iterable object?
 * - Any object with a `Symbol.iterator` property is iterable.
 * - Note: Array and Map instances etc will return true because they implement `Symbol.iterator`
 */
export const isSequence = <T extends AsyncIterable<unknown>>(value: T | unknown): value is T => typeof value === "object" && !!value && Symbol.asyncIterator in value;

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
export async function* callSequence<T>(sequence: AsyncIterable<T>, callback: AsyncValueCallback<T>): AsyncIterable<T> {
	for await (const item of sequence) {
		call(callback, item);
		yield item;
	}
}

/** Get the first value from an async iterator. **/
export async function getNextValue<T>(sequence: AsyncIterable<T>): Promise<T> {
	for await (const item of sequence) return item;
	throw new RequiredError("First value is required");
}

/** Pull values from a sequence until the returned function is called. */
export function runSequence<T>(sequence: AsyncIterable<T>, onNext?: ValueCallback<T>, onError?: ErrorCallback): StopCallback {
	const { promise, resolve } = getDeferred<void>();
	void _runSequence(sequence[Symbol.asyncIterator](), promise, onNext, onError);
	return resolve;
}
async function _runSequence<T>(sequence: AsyncIterator<T>, stopped: Promise<void>, onNext?: ValueCallback<T>, onError?: ErrorCallback): Promise<unknown> {
	try {
		const result = await Promise.race([stopped, sequence.next()]);
		if (!result) {
			// Stop iteration because the stop signal was sent.
			// Call `return()` on the iterator so it can perform any clean up.
			callMethod(sequence, "return");
			return;
		} else if (result.done) {
			// Stop iteration because iterator is done.
			// Don't need to call `return()` on the iterator (assume it stopped itself when it sent `done: true`).
			return;
		} else {
			// Forward the value to the next callback.
			if (onNext) call(onNext, result.value);
		}
	} catch (thrown) {
		// Forward the error to the error callback.
		if (onError) call(onError, thrown);
	}

	// Continue iteration.
	return _runSequence(sequence, stopped, onNext, onError);
}

/** Race several sequences (or promises) against each other and return a sequence that combines the output. */
export async function* combineSequences<T>(...sequences: AsyncIterable<T>[]): AsyncIterable<T> {
	const iterators = sequences.map<AsyncIterator<T, unknown, undefined>>(sequence => sequence[Symbol.asyncIterator]());
	try {
		while (true) {
			const { done, value } = await Promise.race(iterators.map(iterator => iterator.next()));
			if (done) return value;
			else yield value;
		}
	} finally {
		// Call `return()` on every iterator to ensure any created resources are destroyed.
		for (const iterator of iterators) iterator.return?.().then(undefined, logError);
	}
}
