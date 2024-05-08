import { ValueError } from "../error/ValueError.js";
import { debug } from "./debug.js";
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
	if (!(value instanceof type)) throw new ValueError(`Must be instance of ${debug(type)}`, value);
}
