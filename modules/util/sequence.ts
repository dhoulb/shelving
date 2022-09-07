import { RequiredError } from "../error/RequiredError.js";
import { Delay, Signal, SIGNAL } from "./async.js";
import { logError } from "./error.js";
import { Handler, Stop, AsyncDispatch, Dispatch, dispatch } from "./function.js";

/** Slightly modify the definition of `AsyncIterable` to default `R` and `N` to `void` */
export declare interface AsyncIterable<T, R = void, N = void> {
	[Symbol.asyncIterator](): AsyncIterator<T, R, N>;
}

/**
 * Is a value an async iterable object?
 * - Any object with a `Symbol.iterator` property is iterable.
 * - Note: Array and Map instances etc will return true because they implement `Symbol.iterator`
 */
export const isAsyncIterable = <T extends AsyncIterable<unknown>>(value: T | unknown): value is T => typeof value === "object" && !!value && Symbol.asyncIterator in value;

/** Infinite sequence that yields until a `SIGNAL` is received. */
export async function* repeatUntil<T, R>(source: AsyncIterable<T, R>, ...signals: [Promise<typeof SIGNAL>, ...Promise<typeof SIGNAL>[]]): AsyncIterable<T, R | typeof SIGNAL> {
	const iterator = source[Symbol.asyncIterator]();
	while (true) {
		const result = await Promise.race([iterator.next(), ...signals]);
		if (result === SIGNAL) {
			await iterator.return?.(); // Make sure we call `return()` on the iterator because it might do cleanup.
			return SIGNAL;
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
		await new Delay(ms);
		yield count++;
	}
}

/** Dispatch items in a sequence to a (possibly async) callback. */
export async function* dispatchSequence<T, R>(sequence: AsyncIterable<T, R>, onNext: AsyncDispatch<[T]>): AsyncIterable<T> {
	for await (const item of sequence) {
		dispatch(onNext, item);
		yield item;
	}
}

/** Get the first value from an async iterator. **/
export async function getNextValue<T, R>(sequence: AsyncIterable<T, R>): Promise<T> {
	for await (const value of sequence) return value;
	throw new RequiredError("First value is required");
}

/** Pull values from a sequence until the returned function is called. */
export function runSequence<T, R>(sequence: AsyncIterable<T, R>, onNext?: Dispatch<[T]>, onError: Handler = logError): Stop {
	const stop = new Signal();
	_runSequence(sequence[Symbol.asyncIterator](), stop, onNext, onError).catch(onError).catch(logError);
	return stop.send;
}
async function _runSequence<T, R>(iterator: AsyncIterator<T, R>, stop: Signal, onNext: Dispatch<[T]> | undefined, onError: Handler): Promise<unknown> {
	try {
		const result = await Promise.race([stop, iterator.next()]);
		if (result === Signal.SIGNAL || result.done) {
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
	return _runSequence(iterator, stop, onNext, onError);
}
