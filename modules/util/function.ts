import { AssertionError } from "../error/AssertionError.js";

/** Unknown function. */
export type UnknownFunction = (...args: unknown[]) => unknown;

/** Any function (purposefully as wide as possible for use with `extends X` or `is X` statements). */
// Note: `any` works better than `any[]` for `args`
export type AnyFunction = (...args: any) => any; // eslint-disable-line @typescript-eslint/no-explicit-any

/** Is a value a function? */
export const isFunction = (value: unknown): value is AnyFunction => typeof value === "function";

/** Assert that a value is a function. */
export function assertFunction(value: unknown): asserts value is AnyFunction {
	if (typeof value !== "function") throw new AssertionError("Must be function", value);
}

/** Readonly unknown array that is being used as a set of arguments to a function. */
export type Arguments = readonly unknown[];

/** Function that just passes through the first argument. */
export const PASSTHROUGH = <T>(value: T): T => value;

/** Function that does nothing with its arguments and always returns void. */
export const BLACKHOLE: (...args: Arguments) => void | undefined = () => undefined;
