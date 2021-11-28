import { logError } from "./error.js";
import { isAsync } from "./promise.js";

/** Function that dispatches a value (we never care about the returned value). */
export type Dispatcher<T> = (value: T) => void | Promise<void>;

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
		const returned = dispatcher(value);
		if (isAsync(returned)) returned.then(undefined, handler);
	} catch (thrown) {
		handler(thrown);
	}
}

/** Safely dispatch an async value to a dispatcher function. */
export function dispatchAsync<T>(value: T | Promise<T>, dispatcher: Dispatcher<T>, handler = logError): void {
	if (isAsync(value)) value.then(dispatcher).catch(handler);
	else dispatch(value, dispatcher, handler);
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
		const returned = obj[key](value);
		if (isAsync(returned)) returned.then(undefined, handler);
	} catch (thrown) {
		handler(thrown);
	}
}

/** Safely dispatch an async value to a dispatcher method on an object. */
export function thispatchAsync<T, M extends string | symbol>(value: T | Promise<T>, obj: { [K in M]: Dispatcher<T> }, key: M, handler = logError): void {
	if (isAsync(value)) value.then(v => obj[key](v)).catch(handler);
	else thispatch(value, obj, key, handler);
}
