import { AssertionError } from "../index.js";
import { isAsync } from "./async.js";
import { logError } from "./error.js";

/** Any function (designed for use with `extends AnyFunction` guards). */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyFunction = (...args: any) => any; // Note: `any` works better than `any[]` for `args`

/** Is a value a function? */
export const isFunction = <T extends AnyFunction>(v: T | unknown): v is T => typeof v === "function";

/** Assert that a value is a function. */
export function assertFunction<T extends AnyFunction>(v: T | unknown): asserts v is T {
	if (typeof v !== "function") throw new AssertionError("Must be function", v);
}

/** Readonly unknown array that is being used as a set of arguments to a function. */
export type Arguments = readonly unknown[];

/** Function that just passes through the first argument. */
export const PASSTHROUGH = <T>(value: T): T => value;

/** Function that does nothing with its arguments and always returns void. */
export const BLACKHOLE: (...args: Arguments) => void | undefined = () => undefined;

/** Function that receives a dispatched value. */
export type Dispatcher<T extends Arguments = []> = (...value: T) => void;

/** Function that receives a dispatched value. */
export type AsyncDispatcher<T extends Arguments = []> = (...value: T) => void | PromiseLike<void>;

/** Safely dispatch a value to a dispatcher function. */
export function dispatch<A extends Arguments>(dispatcher: AsyncDispatcher<A>, ...value: A): void {
	try {
		const result = dispatcher(...value);
		if (isAsync(result)) result.then(BLACKHOLE, logError);
	} catch (thrown) {
		logError(thrown);
	}
}

/** Return a function that dispatches a value to a dispatcher function. */
export function dispatched<A extends Arguments>(dispatcher: AsyncDispatcher<A>): Dispatcher<A> {
	return (...args: A) => dispatch(dispatcher, ...args);
}

/** Safely dispatch a value to a dispatcher method on an object. */
export function dispatchMethod<T extends Arguments, M extends string | symbol>(obj: { [K in M]: AsyncDispatcher<T> }, key: M, ...value: T): void {
	try {
		const result = obj[key](...value);
		if (isAsync(result)) result.then(BLACKHOLE, logError);
	} catch (thrown) {
		logError(thrown);
	}
}
