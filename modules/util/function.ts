import { AssertionError } from "../error/AssertionError.js";

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
