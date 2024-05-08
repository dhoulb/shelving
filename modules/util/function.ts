import { ValueError } from "../error/ValueError.js";

/** Unknown function. */
export type UnknownFunction = (...args: unknown[]) => unknown;

/** Any function (purposefully as wide as possible for use with `extends X` or `is X` statements). */
// biome-ignore lint/suspicious/noExplicitAny: `unknown` causes edge case matching issues.
export type AnyFunction = (...args: any) => any;

/** Is a value a function? */
export function isFunction(value: unknown): value is AnyFunction {
	return typeof value === "function";
}

/** Assert that a value is a function. */
export function assertFunction(value: unknown): asserts value is AnyFunction {
	if (typeof value !== "function") throw new ValueError("Must be function", value);
}

/** Readonly unknown array that is being used as a set of arguments to a function. */
export type Arguments = readonly unknown[];

/** Function that just passes through the first argument. */
export function PASSTHROUGH<T>(value: T): T {
	return value;
}

/** Function that does nothing with its arguments and always returns void. */
// biome-ignore lint/suspicious/noConfusingVoidType: Allow `BLACKHOLE` to be used in places that allow `void`
export function BLACKHOLE(...unused: Arguments): void | undefined {
	return undefined;
}
