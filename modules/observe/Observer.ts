import type { Dispatch } from "../util/function.js";
import { Handler, logError } from "../util/error.js";
import type { Connectable } from "./Observable.js";

/**
 * Observer
 * - An Observer is used to receive data from an Observable, and is supplied as an argument to subscribe.
 * - All methods are optional.
 * - Compatible with https://github.com/tc39/proposal-observable/
 */
export interface Observer<T> {
	/** Send the next value to this observer. */
	readonly next: Dispatch<[T]>;
	/** End this observer with an error. */
	readonly error: Handler;
	/** End this observer with success. */
	readonly complete: Dispatch;
	/** Is this observer closed? */
	readonly closed?: boolean;
}

/** Partial observer is an observer missing one or more of its callbacks. */
export type PartialObserver<T> = Partial<Observer<T>>;

/** Connectable observer is an observer that can connect to a subscribable source. */
export type ConnectableObserver<T> = Observer<T> & Connectable<T>;

/** Dispatch the next value to an observer (and if the next value errors log the error). */
export function dispatchNext<T>(observer: PartialObserver<T>, value: T): void {
	if (!observer.next) return;
	try {
		observer.next(value);
	} catch (thrown) {
		logError(thrown);
	}
}

/** Dispatch the next value to an observer (and if the next value errors log the error). */
export function dispatchAsyncNext<T>(observer: PartialObserver<T>, value: PromiseLike<T>): void {
	if (!observer.next) return;
	void _dispatchAsyncNext(observer, value);
}
async function _dispatchAsyncNext<T>(observer: PartialObserver<T>, value: PromiseLike<T>): Promise<void> {
	try {
		dispatchNext(observer, await value);
	} catch (reason) {
		dispatchError(observer, reason);
	}
}

/** Dispatch a complete call an observer (and if the next value errors log the error). */
export function dispatchComplete<T>(observer: PartialObserver<T>): void {
	if (!observer.complete) return;
	try {
		observer.complete();
	} catch (thrown) {
		logError(thrown);
	}
}

/** Dispatch an error value to an observer. */
export function dispatchError<T>(observer: PartialObserver<T>, reason: Error | unknown): void {
	if (!observer.error) return;
	try {
		observer.error(reason);
	} catch (thrown) {
		logError(thrown);
	}
}
