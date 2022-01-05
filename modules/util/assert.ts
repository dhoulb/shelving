import { AssertionError } from "../error/index.js";
import type { AnyFunction } from "./function.js";
import type { Class } from "./class.js";
import { debug } from "./debug.js";
import { isObject } from "./object.js";
import { ImmutableArray, isArray } from "./array.js";
import { NOVALUE } from "./constants.js";
import { isAsync } from "./async.js";
import { Data } from "./data.js";

/** Assert a boolean condition is true. */
export function assert(condition: unknown, ...received: unknown[]): asserts condition {
	if (!condition) throw new AssertionError(`Must assert`, ...received);
}

/** Assert two values are equal. */
export function assertEqual<T>(value: T | unknown, target: T): asserts value is T {
	if (value !== target) throw new AssertionError(`Must be equal`, value, target);
}

/** Assert two values are equal. */
export function assertNot<T, N>(value: T | N, target: N): asserts value is T {
	if (value === target) throw new AssertionError(`Must not be equal`, value, target);
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

/** Assert that a value is a `Date` instance. */
export function assertDate(value: unknown): asserts value is Date {
	if (value instanceof Date) throw new AssertionError(`Must be date`, value);
}

/** Assert that a value is a plain object (but not an array or function). */
export function assertObject<T extends Data>(value: T | unknown): asserts value is T {
	if (!isObject(value)) throw new AssertionError(`Must be object`, value);
}

/** Assert that a value is an object with a specific property. */
export function assertProp<K extends string | number | symbol, T extends { [L in K]: unknown }>(value: T | unknown, key: K): asserts value is T {
	if (!isObject(value) || !(key in value)) throw new AssertionError(`Must have prop "${key}"`, value);
}

/** Assert that a value is an array. */
export function assertArray<T>(value: ImmutableArray<T> | unknown): asserts value is ImmutableArray<T> {
	if (!(value instanceof Array)) throw new AssertionError(`Must be array`, value);
}

/** Assert that a value has a specific length (or length is in a specific range). */
export function assertLength<T>(value: ImmutableArray<T> | unknown, length: number): asserts value is ImmutableArray<T> {
	if (!isArray(value) || value.length !== length) throw new AssertionError(`Must be array with length ${length}`, value);
}

/** Assert that a value has a specific length (or length is in a specific range). */
export function assertMinLength<T>(value: ImmutableArray<T> | unknown, min?: 1): asserts value is [T, ...T[]];
export function assertMinLength<T>(value: ImmutableArray<T> | unknown, min: 2): asserts value is [T, T, ...T[]];
export function assertMinLength<T>(value: ImmutableArray<T> | unknown, min: 3): asserts value is [T, T, T, ...T[]];
export function assertMinLength<T>(value: ImmutableArray<T> | unknown, min: 4): asserts value is [T, T, T, T, ...T[]];
export function assertMinLength<T>(value: ImmutableArray<T> | unknown, min: number): asserts value is [T, T, T, T, T, ...T[]];
export function assertMinLength<T>(value: ImmutableArray<T> | unknown, min = 1): asserts value is ImmutableArray<T> {
	if (!isArray(value) || value.length < min) throw new AssertionError(`Must be array with minimum length ${min}`, value);
}

/** Assert that a value is a number greater than. */
export function assertBetween(value: number | unknown, min: number, max: number): asserts value is number {
	if (typeof value !== "number" || value < min || value > max) throw new AssertionError(`Must be number between ${min}-${max}`, value);
}

/** Assert that a value is a number greater than. */
export function assertMax(value: number | unknown, max: number): asserts value is number {
	if (typeof value !== "number" || value > max) throw new AssertionError(`Must be number with maximum ${max}`, value);
}

/** Assert that a value is a number less than. */
export function assertMin(value: number | unknown, min: number): asserts value is number {
	if (typeof value !== "number" || value < min) throw new AssertionError(`Must be number with minimum ${min}`, value);
}

/** Assert that a value is an instance of something. */
export function assertInstance<T>(value: T | unknown, type: Class<T>): asserts value is T {
	if (!(value instanceof type)) throw new AssertionError(`Must be instance of ${debug(type)}`, value);
}

/** Assert that a value is a function. */
export function assertFunction<T extends AnyFunction>(value: T | unknown): asserts value is T {
	if (typeof value !== "function") throw new AssertionError("Must be function", value);
}

/** Assert that a value is not the `NOVALUE` constant. */
export function assertValue<T>(value: T | typeof NOVALUE): asserts value is T {
	if (value === NOVALUE) throw new AssertionError("Must have value", value);
}

/** Assert that a value is not the `NOVALUE` constant. */
export function assertDefined<T>(value: T | undefined): asserts value is T {
	if (value === undefined) throw new AssertionError("Must be defined", value);
}

/** Expect a synchronous value. */
export function assertSync<T>(value: Promise<T> | T): asserts value is T {
	if (isAsync(value)) throw new AssertionError("Must be synchronous", value);
}

/** Expect an asynchronous value. */
export function assertAsync<T>(value: PromiseLike<T> | T): asserts value is PromiseLike<T> {
	if (!isAsync(value)) throw new AssertionError("Must be asynchronous", value);
}

/** Expect a promise. */
export function assertPromise<T>(value: Promise<T> | T): asserts value is Promise<T> {
	if (!(value instanceof Promise)) throw new AssertionError("Must be promise", value);
}
