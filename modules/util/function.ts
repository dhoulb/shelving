import { RequiredError } from "../error/RequiredError.js";
import type { AnyConstructor } from "./class.js";

/** Readonly unknown array that is being used as a set of arguments to a function. */
export type Arguments = readonly unknown[];

/** Unknown function. */
export type UnknownFunction = (...args: unknown[]) => unknown;

/** Any function (purposefully as wide as possible for use with `extends X` or `is X` statements). */
// biome-ignore lint/suspicious/noExplicitAny: `unknown` causes edge case matching issues.
export type AnyFunction = (...args: any) => any;

/** Any calling function or constructor, usually referring to something that can call in the current scope that can appear in a stack trace. */
export type AnyCaller = AnyFunction | AnyConstructor;

/** A callback is a function that is called when something happens, optionally with multiple values. */
export type Callback<A extends Arguments = []> = (...args: A) => void;

/** A callback is a function that is called when something happens with a value. */
export type ValueCallback<T> = (value: T) => void;

/** Function that is called when something errors. */
export type ErrorCallback = (reason: unknown) => void;

/** Is a value a function? */
export function isFunction(value: unknown): value is AnyFunction {
	return typeof value === "function";
}

/** Assert that a value is a function. */
export function assertFunction(value: unknown): asserts value is AnyFunction {
	if (typeof value !== "function") throw new RequiredError("Must be function", { received: value, caller: assertFunction });
}

/** Function that just passes through the first argument. */
export function PASSTHROUGH<T>(value: T): T {
	return value;
}

/** Function that does nothing with its arguments and always returns void. */
export function BLACKHOLE(..._unused: Arguments): void | undefined {
	return undefined;
}
