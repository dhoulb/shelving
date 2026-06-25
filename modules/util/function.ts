import { RequiredError } from "../error/RequiredError.js";
import type { AnyConstructor } from "./class.js";

/**
 * Readonly unknown array that is being used as a set of arguments to a function.
 *
 * @see https://shelving.cc/util/function/Arguments
 */
export type Arguments = readonly unknown[];

/**
 * Unknown function.
 *
 * @see https://shelving.cc/util/function/UnknownFunction
 */
export type UnknownFunction = (...args: unknown[]) => unknown;

/**
 * Any function (purposefully as wide as possible for use with `extends X` or `is X` statements).
 *
 * @see https://shelving.cc/util/function/AnyFunction
 */
// biome-ignore lint/suspicious/noExplicitAny: `unknown` causes edge case matching issues.
export type AnyFunction = (...args: any) => any;

/**
 * Any calling function or constructor, usually referring to something that can call in the current scope that can appear in a stack trace.
 *
 * @see https://shelving.cc/util/function/AnyCaller
 */
export type AnyCaller = AnyFunction | AnyConstructor;

/**
 * A callback is a function that is called when something happens, optionally with multiple values.
 *
 * @see https://shelving.cc/util/function/Callback
 */
export type Callback<A extends Arguments = []> = (...args: A) => void;

/**
 * A callback is a function that is called when something happens with a value.
 *
 * @see https://shelving.cc/util/function/ValueCallback
 */
export type ValueCallback<T> = (value: T) => void;

/**
 * Function that is called when something errors.
 *
 * @see https://shelving.cc/util/function/ErrorCallback
 */
export type ErrorCallback = (reason: unknown) => void;

/**
 * Is a value a function?
 *
 * @param value The value to test.
 * @returns `true` if `value` is a function, narrowing its type to `AnyFunction`.
 * @see https://shelving.cc/util/function/isFunction
 */
export function isFunction(value: unknown): value is AnyFunction {
	return typeof value === "function";
}

/**
 * Assert that a value is a function.
 *
 * @param value The value to assert.
 * @throws {RequiredError} If `value` is not a function.
 * @see https://shelving.cc/util/function/assertFunction
 */
export function assertFunction(value: unknown): asserts value is AnyFunction {
	if (typeof value !== "function") throw new RequiredError("Must be function", { received: value, caller: assertFunction });
}

/**
 * Function that just passes through the first argument.
 *
 * @param value The value to return.
 * @returns The exact `value` it was given, unchanged.
 * @see https://shelving.cc/util/function/PASSTHROUGH
 */
export function PASSTHROUGH<T>(value: T): T {
	return value;
}

/**
 * Function that does nothing with its arguments and always returns void.
 *
 * @param _unused Zero or more arguments, all ignored.
 * @returns Always `undefined`.
 * @see https://shelving.cc/util/function/BLACKHOLE
 */
export function BLACKHOLE(..._unused: Arguments): void | undefined {
	return undefined;
}
