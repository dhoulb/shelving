import { AsyncEmptyDispatcher, AsyncDispatcher, AsyncCatcher, thispatch } from "../function";

/**
 * Observer
 * - An Observer is used to receive data from an Observable, and is supplied as an argument to subscribe.
 * - All methods are optional.
 * - Compatible with https://github.com/tc39/proposal-observable/
 */
export interface Observer<T> {
	/** Receive the next value. */
	readonly next?: AsyncDispatcher<T>;
	/** End the subscription with an error. */
	readonly error?: AsyncCatcher;
	/** End the subscription with success. */
	readonly complete?: AsyncEmptyDispatcher;
	/** Whether the subscription has ended (either with success or failure). */
	readonly closed?: boolean;
}

/** Dispatch the next value to an observer (and if the next value errors, calls the observer's error function). */
export const dispatchNext = <T>(observer: Observer<T>, value: T): void => thispatch(observer, "next", value, observer, "error");

/** Dispatch a complete call an observer (and if the next value errors, calls the observer's error function). */
export const dispatchComplete = <T>(observer: Observer<T>): void => thispatch(observer, "complete", undefined, observer, "error");

/** Dispatch an error value to an observer. */
export const dispatchError = <T>(observer: Observer<T>, error: Error | unknown): void => thispatch(observer, "error", error);
