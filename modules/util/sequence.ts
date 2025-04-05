import { NotFoundError } from "../error/NotFoundError.js";
import { getDeferred, getDelay } from "./async.js";
import type { AsyncValueCallback, ValueCallback } from "./callback.js";
import { call, callMethod } from "./callback.js";
import { STOP } from "./constants.js";
import type { Report } from "./error.js";
import type { Stop } from "./start.js";

/**
 * Is a value an async iterable object?
 * - Any object with a `Symbol.iterator` property is iterable.
 * - Note: Array and Map instances etc will return true because they implement `Symbol.iterator`
 */
export function isSequence(value: unknown): value is AsyncIterable<unknown> {
	return typeof value === "object" && !!value && Symbol.asyncIterator in value;
}

/** Infinite sequence that yields until a `SIGNAL` is received. */
export async function* repeatUntil<T>(
	source: AsyncIterable<T>,
	...signals: [Promise<typeof STOP>, ...Promise<typeof STOP>[]]
): AsyncIterable<T> {
	const iterator: AsyncIterator<T, unknown, undefined> = source[Symbol.asyncIterator]();
	while (true) {
		const result = await Promise.race([iterator.next(), ...signals]);
		if (result === STOP) {
			await iterator.return?.(); // Make sure we call `return()` on the iterator because it might do cleanup.
			return STOP;
		}
		if (result.done) {
			return result.value;
		}
		yield result.value;
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
	throw new NotFoundError("First value is required");
}

/** Pull values from a sequence until the returned function is called. */
export function runSequence<T>(sequence: AsyncIterable<T>, onNext?: ValueCallback<T>, onError?: Report): Stop {
	const { promise, resolve } = getDeferred<void>();
	void _runSequence(sequence[Symbol.asyncIterator](), promise, onNext, onError);
	return resolve;
}
async function _runSequence<T>(
	sequence: AsyncIterator<T>,
	stopped: Promise<void>,
	onNext?: ValueCallback<T>,
	onError?: Report,
): Promise<unknown> {
	try {
		const result = await Promise.race([stopped, sequence.next()]);
		if (!result) {
			// Stop iteration because the stop signal was sent.
			// Call `return()` on the iterator so it can perform any clean up.
			callMethod(sequence, "return");
			return;
		}
		if (result.done) {
			// Stop iteration because iterator is done.
			// Don't need to call `return()` on the iterator (assume it stopped itself when it sent `done: true`).
			return;
		}
		// Forward the value to the next callback.
		if (onNext) call(onNext, result.value);
	} catch (thrown) {
		// Forward the error to the error callback.
		if (onError) call(onError, thrown);
	}

	// Continue iteration.
	return _runSequence(sequence, stopped, onNext, onError);
}
