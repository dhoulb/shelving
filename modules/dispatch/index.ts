/* eslint-disable @typescript-eslint/no-explicit-any */

import { logError } from "../console";

/**
 * Dispatcher: a function that dispatches a value.
 * - We never care about the returned value of a dispatcher.
 * - Don't call dispatchers directly: they might throw or return a Promise that rejects.
 * - Use the `dispatch()` function from `shelving/helpers/error` to call a dispatcher safely.
 * - A dispatcher is considered 'safe' if it is handled, i.e. returns `void`
 */
export type Dispatcher<T> = (value: T) => void;

/** Type of Dispatcher that takes no value. */
export type EmptyDispatcher = () => void;

/**
 * Unhandled dispatcher: a type of function that dispatches a value but might throw or return a rejecting promise.
 * - We never care about the returned value of a dispatcher.
 * - Don't call dispatchers directly: they might throw or return a Promise that rejects.
 * - Use the `dispatch()` function from `shelving/helpers/error` to call a dispatcher safely.
 * - Returns `Promise<unknown>` to ensure the return type is handled.
 */
export type AsyncDispatcher<T> = (value: T) => void | Promise<void>;

/** Type of Dispatcher that takes no value but might throw or return a rejecting promise. */
export type EmptyAsyncDispatcher = () => void | Promise<void>;

/**
 * UnsubscribeDispatcher: a function that unsubscribes from a value.
 * - Guaranteed never to return, so safe to call directly.
 */
export type UnsubscribeDispatcher = () => void;

/**
 * ErrorDispatcher: a function that unsubscribes from a value.
 * - Guaranteed never to return, so safe to call directly.
 */
export type ErrorDispatcher = (thrown: Error | unknown) => void;

/**
 * Dispatch: call a dispatcher function safely.
 *
 * @param dispatcher Any dispatcher function.
 * - Any errors thrown or rejected by the dispatcher are caught and routed to the catcher.
 * @param value The value to dispatch into the dispatcher function.
 * @param catcher The catcher callback function that any thrown or rejected errors are dispatched to.
 */
export function dispatch<I = void>(dispatcher: AsyncDispatcher<I>, value: I, catcher = logError): void {
	try {
		const returned = dispatcher(value);
		if (returned instanceof Promise) returned.catch(logError);
	} catch (err) {
		catcher(err);
	}
}
