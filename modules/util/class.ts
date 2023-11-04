import type { Arguments } from "./function.js";
import { ValueError } from "../error/ValueError.js";
import { debug } from "./debug.js";

/** Class that has a public `constructor()` function. */
export type Constructor<T, A extends Arguments> = new (...args: A) => T;

/** Any function arguments (designed for use with `extends Arguments` guards). */
// Note: `any` works better than `any[]` for `args`
export type AnyConstructor = new (...args: any) => any; // eslint-disable-line @typescript-eslint/no-explicit-any

/** Class prototype that can be used with `instanceof`. */
export type Class<T> = new (...args: any) => T; // eslint-disable-line @typescript-eslint/no-explicit-any

/** Is a given value a class constructor? */
export const isConstructor = (value: unknown): value is AnyConstructor => typeof value === "function" && value.toString().startsWith("class");

/** Is a value an instance of a class? */
export const isInstance = <T>(value: unknown, type: Class<T>): value is T => value instanceof type;

/** Assert that a value is an instance of something. */
export function assertInstance<T>(value: unknown, type: Class<T>): asserts value is T {
	if (!(value instanceof type)) throw new ValueError(`Must be instance of ${debug(type)}`, value);
}
