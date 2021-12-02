import { logError } from "./error.js";
import { callAsync } from "./async.js";

/** Function that dispatches a value (we never care about the returned value). */
export type Dispatcher<T> = (value: T) => void;

/**
 * Safely dispatch a value to a dispatcher function.
 *
 * @param value The value to dispatch into the dispatcher function.
 * @param dispatcher Any dispatcher function.
 * - Any errors thrown or rejected by the dispatcher are caught and routed to the catcher.
 * @param handler Handler that handles any thrown errors.
 */
export function dispatch<T>(value: T, dispatcher: Dispatcher<T>, handler = logError): void {
	try {
		dispatcher(value);
	} catch (thrown) {
		handler(thrown);
	}
}

/** Safely dispatch an async value to a dispatcher function. */
export function dispatchAsync<T>(value: T | PromiseLike<T>, dispatcher: Dispatcher<T>, handler = logError): void {
	void callAsync(dispatch, value, dispatcher, handler);
}

/**
 * Safely dispatch a value to a dispatcher method on an object.
 *
 * @param value The value to dispatch into the dispatcher method.
 * @param obj The object containing the method.
 * @param key The key specifiying which method to call (if the method is not defined, nothing will be dispatched).
 * - Any errors thrown or rejected by the dispatcher are caught and routed to the catcher.
 * @param handler Handler that handles any thrown errors.
 */
export function thispatch<T, M extends string | symbol>(value: T, obj: { [K in M]: Dispatcher<T> }, key: M, handler = logError): void {
	try {
		obj[key](value);
	} catch (thrown) {
		handler(thrown);
	}
}

/** Safely dispatch an async value to a dispatcher method on an object. */
export function thispatchAsync<T, M extends string | symbol>(value: T | PromiseLike<T>, obj: { [K in M]: Dispatcher<T> }, key: M, handler = logError): void {
	void callAsync(thispatch, value, obj, key, handler);
}
