import type { Arguments } from "./function.js";
import { isAsync } from "./async.js";
import { logError } from "./error.js";

/** Callback function with no value. */
export type Callback = () => void;

/** Callback function with no value and possibly returns a promise that must be handled. */
export type AsyncCallback = () => void | PromiseLike<void>;

/** Callback function that receives a value. */
export type ValueCallback<T> = (value: T) => void;

/** Callback function that receives a value and possibly returns a promise that must be handled. */
export type AsyncValueCallback<T = void> = (value: T) => void | PromiseLike<void>;

/** Callback function that receives multiple values. */
export type ValuesCallback<T extends Arguments = []> = (...values: T) => void;

/** Callback function that receives multiple values and possibly returns a promise that must be handled. */
export type AsyncValuesCallback<T extends Arguments = []> = (...values: T) => void | PromiseLike<void>;

/** Callback function that handles an error. */
export type ErrorCallback = (reason: unknown) => void;

/** Callback function that starts something (and returns an optional stop callback). */
export type StartCallback<T> = (value: T) => StopCallback;

/** Callback function that stops something. */
export type StopCallback = () => void;

/** Safely call a callback function (possibly with a value). */
export function call<A extends Arguments = []>(callback: (...v: A) => unknown, ...values: A): void {
	try {
		const result = callback(...values);
		if (isAsync(result)) result.then(undefined, logError);
	} catch (thrown) {
		logError(thrown);
	}
}

/** Return a callback function that safely calls a callback function (possibly with a value). */
export function called<A extends Arguments = []>(dispatcher: (...v: A) => unknown, ...values: A): Callback {
	return () => call(dispatcher, ...values);
}

/** Safely call a callback method (possibly wth a value). */
export function callMethod<A extends Arguments, M extends string | symbol>(obj: { [K in M]?: ((...v: A) => unknown) | undefined }, key: M, ...values: A): void {
	try {
		const result = obj[key]?.(...values);
		if (isAsync(result)) result.then(undefined, logError);
	} catch (thrown) {
		logError(thrown);
	}
}
