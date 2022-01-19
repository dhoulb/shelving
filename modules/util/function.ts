import { isAsync } from "./async.js";
import { logError } from "./error.js";

/** Any function (designed for use with `extends AnyFunction` guards). */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyFunction = (...args: any) => any; // Note: `any` works better than `any[]` for `args`

/** Is a value a function? */
export const isFunction = <T extends AnyFunction>(v: T | unknown): v is T => typeof v === "function";

/** Readonly unknown array that is being used as a set of arguments to a function. */
export type Arguments = readonly unknown[];

/** Function that just passes through the first argument. */
export const PASSTHROUGH = <T>(value: T): T => value;

/** Function that does nothing with its arguments and always returns void. */
export const BLACKHOLE: (...args: Arguments) => void | undefined = () => undefined;

/** Function that receives a dispatched value. */
export type Dispatcher<T extends Arguments = []> = (...value: T) => void;

/** Function that receives a dispatched value. */
export type AsyncDispatcher<T extends Arguments = []> = (...value: T) => void | Promise<void>;

/** Safely dispatch a value to a dispatcher function. */
export function dispatch<T extends Arguments>(dispatcher: Dispatcher<T> | AsyncDispatcher<T>, ...value: T): void {
	try {
		const result = dispatcher(...value);
		if (isAsync(result)) result.catch(logError);
	} catch (thrown) {
		logError(thrown);
	}
}

/** Safely dispatch a value to a dispatcher method on an object. */
export function dispatchMethod<T extends Arguments, M extends string | symbol>(obj: { [K in M]: Dispatcher<T> | AsyncDispatcher<T> }, key: M, ...value: T): void {
	try {
		const result = obj[key](...value);
		if (isAsync(result)) result.catch(logError);
	} catch (thrown) {
		logError(thrown);
	}
}
