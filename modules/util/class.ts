import { RequiredError } from "../error/RequiredError.js";
import type { Arguments } from "./function.js";

/** Class that has a public `constructor()` function. */
export type Constructor<T, A extends Arguments> = new (...args: A) => T;

/** Any function arguments (designed for use with `extends Arguments` guards). */
// biome-ignore lint/suspicious/noExplicitAny: `unknown` causes edge case matching issues.
export type AnyConstructor = new (...args: any) => any;

/** Class prototype that can be used with `instanceof`. */
// biome-ignore lint/suspicious/noExplicitAny: `unknown` causes edge case matching issues.
export type Class<T> = new (...args: any) => T;

/** Is a given value a class constructor? */
export function isConstructor(value: unknown): value is AnyConstructor {
	return typeof value === "function" && value.toString().startsWith("class");
}

/** Is a value an instance of a class? */
export function isInstance<T>(value: unknown, type: Class<T>): value is T {
	return value instanceof type;
}

/** Assert that a value is an instance of something. */
export function assertInstance<T>(value: unknown, type: Class<T>): asserts value is T {
	if (!(value instanceof type))
		throw new RequiredError(`Must be instance of class "${type.name}"`, { received: value, expected: type, caller: assertInstance });
}

/** Get the 'getter' function for a given property, or `undefined` if it doesn't exist. */
// biome-ignore lint/complexity/noBannedTypes: This is correct here.
export function getGetter<T extends Object, K extends keyof T>(obj: T, prop: K): ((this: T) => T[K]) | undefined {
	const descriptor = Object.getOwnPropertyDescriptor(obj, prop);
	return descriptor && typeof descriptor.get === "function" ? descriptor.get : undefined;
}

/** Get the 'setter' function for a given property, or `undefined` if it doesn't exist. */
// biome-ignore lint/complexity/noBannedTypes: This is correct here.
export function getSetter<T extends Object, K extends keyof T>(obj: T, prop: K): ((this: T, value: T[K]) => void) | undefined {
	const descriptor = Object.getOwnPropertyDescriptor(obj.constructor.prototype, prop);
	return descriptor && typeof descriptor.set === "function" ? descriptor.set : undefined;
}
