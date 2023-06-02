import { isAsync } from "./async.js";
import { logError } from "./error.js";

/** Callback function with no value. */
export type Callback = () => void;

/** Callback function with no value. */
export type AsyncCallback = () => void | PromiseLike<void>;

/** Callback function that receives a value. */
export type ValueCallback<T> = (value: T) => void;

/** Callback function that receives a value. */
export type AsyncValueCallback<T = void> = (value: T) => void | PromiseLike<void>;

/** Callback function that handles an error. */
export type ErrorCallback = (reason: Error | unknown) => void;

/** Callback function that starts something (and returns an optional stop callback). */
export type StartCallback<T> = (value: T) => StopCallback;

/** Callback function that stops something. */
export type StopCallback = () => void;

/** Safely call a callback function (possibly with a value). */
export function call(callback: () => void | PromiseLike<void>): void;
export function call<T>(callback: (value: T) => void | PromiseLike<void>, value: T): void;
export function call(callback: AsyncValueCallback<unknown>, value?: unknown): void {
	try {
		const result = callback(value);
		if (isAsync(result)) result.then(undefined, logError);
	} catch (thrown) {
		logError(thrown);
	}
}

/** Return a callback function that safely calls a callback function (possibly with a value). */
export function called<T>(dispatcher: AsyncValueCallback<T>): ValueCallback<T> {
	return (value: T) => call(dispatcher, value);
}

/** Safely call a callback method (possibly wth a value). */
export function callMethod<M extends string | symbol>(obj: { [K in M]: () => void | PromiseLike<void> }, key: M): void;
export function callMethod<T, M extends string | symbol>(obj: { [K in M]: (value: T) => void | PromiseLike<void> }, key: M, value: T): void;
export function callMethod<M extends string | symbol>(obj: { [K in M]: AsyncValueCallback<unknown> }, key: M, value?: unknown): void {
	try {
		const result = obj[key](value);
		if (isAsync(result)) result.then(undefined, logError);
	} catch (thrown) {
		logError(thrown);
	}
}