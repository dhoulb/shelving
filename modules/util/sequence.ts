import { getDeferred, getDelay } from "./async.js";
import { STOP } from "./constants.js";
import type { ErrorCallback, ValueCallback } from "./function.js";

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
): AsyncGenerator<T> {
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
export async function* repeatDelay(ms: number): AsyncGenerator<number, void, void> {
	let count = 1;
	while (true) {
		await getDelay(ms);
		yield count++;
	}
}

/** Dispatch items in a sequence to a (possibly async) callback. */
export async function* callSequence<T>(sequence: AsyncIterable<T>, callback: ValueCallback<T>): AsyncGenerator<T, void, void> {
	for await (const item of sequence) {
		callback(item);
		yield item;
	}
}

/**
 * Pull values from a sequence until the returned function is called.
 *
 * @return Callback function that can end the sequence run.
 */
export function runSequence<T, R, N>(
	sequence: AsyncIterable<T, R | undefined, N | undefined>,
	onNext?: (value: T) => N | undefined,
	onError?: ErrorCallback,
	onReturn?: (value: R | undefined) => void,
): (value?: R | undefined) => void {
	const { promise, resolve } = getDeferred<IteratorResult<T, R | undefined>>();
	void _runSequence(sequence[Symbol.asyncIterator](), promise, onNext, onError, onReturn);
	return (value?: R | undefined) => resolve({ done: true, value });
}
async function _runSequence<T, R, N>(
	iterator: AsyncIterator<T, R | undefined, N | undefined>,
	stopped: Promise<IteratorResult<T, R | undefined>>,
	onNext?: (value: T) => N | undefined,
	onError?: ErrorCallback,
	onReturn?: (value: R | undefined) => void,
): Promise<unknown> {
	try {
		const result = await Promise.race([stopped, iterator.next()]);
		if (result.done) return result.value;
		let n = onNext?.(result.value);
		while (true) {
			const result = await Promise.race([stopped, iterator.next(n)]);
			if (result.done) return onReturn?.(result.value);
			n = onNext?.(result.value);
		}
	} catch (reason) {
		onError?.(reason);
	}
}

/** Merge several sequences (calls the sequences in series). */
export async function* mergeSequences<T>(...sequences: AsyncIterable<T>[]): AsyncIterable<T> {
	for await (const sequence of sequences) yield* sequence;
}
