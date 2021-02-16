import type { AsyncEmptyDispatcher, AsyncDispatcher, AsyncCatcher } from "../function";

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
	/** End the subscription has ended (either with success or failure). */
	readonly closed?: boolean;
}
