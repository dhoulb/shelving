import { AssertionError } from "../error/AssertionError.js";
import { isAsync } from "./async.js";
import { logError } from "./error.js";

/** Unknown function. */
export type UnknownFunction = (...args: unknown[]) => unknown;

/** Any function (designed for use with `extends AnyFunction` guards). */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyFunction = (...args: any) => any; // Note: `any` works better than `any[]` for `args`

/** Is a value a function? */
export const isFunction = <T extends AnyFunction>(value: T | unknown): value is T => typeof value === "function";

/** Assert that a value is a function. */
export function assertFunction<T extends AnyFunction>(value: T | unknown): asserts value is T {
	if (typeof value !== "function") throw new AssertionError("Must be function", value);
}

/** Readonly unknown array that is being used as a set of arguments to a function. */
export type Arguments = readonly unknown[];

/** Function that just passes through the first argument. */
export const PASSTHROUGH = <T>(value: T): T => value;

/** Function that does nothing with its arguments and always returns void. */
export const BLACKHOLE: (...args: Arguments) => void | undefined = () => undefined;

/** Function that receives a dispatched value. */
export type Dispatch<T = void> = (value: T) => void;

/** Function that receives a dispatched value. */
export type AsyncDispatch<T = void> = (value: T) => void | PromiseLike<void>;

/** Safely dispatch a value to a dispatcher function. */
export function dispatch(func: () => void | PromiseLike<void>): void;
export function dispatch<T>(func: (value: T) => void | PromiseLike<void>, value: T): void;
export function dispatch<T>(func: AsyncDispatch<T>, value: T): void;
export function dispatch(func: AsyncDispatch<unknown>, value?: unknown): void {
	try {
		const result = func(value);
		if (isAsync(result)) result.then(undefined, logError);
	} catch (thrown) {
		logError(thrown);
	}
}

/** Return a function that dispatches a value to a dispatcher function. */
export function dispatched<T>(dispatcher: Dispatch<T>): Dispatch<T> {
	return (value: T) => dispatch(dispatcher, value);
}

/** Safely dispatch a value to a dispatcher method on an object. */
export function dispatchMethod<T, M extends string | symbol>(obj: { [K in M]: AsyncDispatch<T> }, key: M, value: T): void {
	try {
		const result = obj[key](value);
		if (isAsync(result)) result.then(BLACKHOLE, logError);
	} catch (thrown) {
		logError(thrown);
	}
}

/** Function that handles an error. */
export type Handler = (reason: Error | unknown) => void;
