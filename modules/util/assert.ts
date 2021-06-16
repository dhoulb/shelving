import { AssertionError } from "../errors";
import type { AnyFunction } from "./function";
import type { Class } from "./class";
import { debug } from "./debug";
import { ImmutableObject, isObject } from "./object";
import { isArray } from "./array";

/** Assert a boolean condition is true. */
export function assert(condition: unknown, ...received: unknown[]): asserts condition {
	if (!condition) throw new AssertionError(`Must assert`, ...received);
}

/** Assert two values are equal. */
export function assertEqual<T>(a: T, b: T | unknown): asserts b is T {
	if (a !== b) throw new AssertionError(`Must be exactly equal`, a, b);
}

/** Assert that a value is a string. */
export function assertString(value: unknown): asserts value is string {
	if (typeof value !== "string") throw new AssertionError(`Must be string`, value);
}

/** Assert that a value is a number. */
export function assertNumber(value: unknown): asserts value is number {
	if (typeof value !== "number") throw new AssertionError(`Must be number`, value);
}

/** Assert that a value is a boolean. */
export function assertBoolean(value: unknown): asserts value is boolean {
	if (typeof value !== "boolean") throw new AssertionError(`Must be boolean`, value);
}

/** Assert that a value is a plain object (but not an array or function). */
export function assertObject<T extends ImmutableObject>(value: T | unknown): asserts value is T {
	if (!isObject(value)) throw new AssertionError(`Must be object`, value);
}

/** Assert that a value is an object with a specific property. */
export function assertProp<K extends string | number | symbol, T extends { [L in K]: unknown }>(value: T | unknown, key: K): asserts value is T {
	if (!isObject(value) || !(key in value)) throw new AssertionError(`Must have prop "${key}"`, value);
}

/** Assert that a value is an array. */
export function assertArray<T extends unknown[] | readonly unknown[]>(value: T | unknown): asserts value is T {
	if (!isArray(value)) throw new AssertionError(`Must be array`, value);
}

/** Assert that a value has a specific length (or length is in a specific range). */
export function assertLength<T extends { length: number }>(value: T | unknown, min: number, max = min): asserts value is T {
	if (!isObject(value) || typeof value.length !== "number" || value.length < min || value.length > max)
		throw new AssertionError(`Must have length ${min}–${max}`, value);
}

/** Assert that a value is an instance of something. */
export function assertInstance<O>(value: O | unknown, constructor: Class<O>): asserts value is O {
	if (!(value instanceof constructor)) throw new AssertionError(`Must be instance of ${debug(constructor)}`, value);
}

/** Assert that a value is a function. */
export function assertFunction<T extends AnyFunction>(value: T | unknown): asserts value is T {
	if (typeof value !== "function") throw new AssertionError(`Must be function`, value);
}
