import { AssertionError } from "../errors";
import { ImmutableObject, isObject } from "../object";
import { isArray } from "../array";
import type { Constructor } from "../constructor";
import { debug } from "../debug";

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

/** Assert that a value is an array. */
export function assertArray<T extends unknown[] | readonly unknown[]>(value: T | unknown): asserts value is T {
	if (!isArray(value)) throw new AssertionError(`Must be array`, value);
}

/** Assert that a value is an instance of something. */
export function assertInstance<O>(value: O | unknown, constructor: Constructor<O>): asserts value is O {
	if (!(value instanceof constructor)) throw new AssertionError(`Must be instance of ${debug(constructor)}`, value);
}