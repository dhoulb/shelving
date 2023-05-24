import type { Arguments } from "./function.js";
import { AssertionError } from "../error/AssertionError.js";
import { debug } from "./debug.js";

/** Class that has a public `constructor()` function. */
export type Constructor<T, A extends Arguments> = new (...args: A) => T;

/** Any function arguments (designed for use with `extends Arguments` guards). */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyConstructor = new (...args: any) => any; // Note: `any` works better than `any[]` for `args`

/** Class prototype that can be used with `instanceof` (string name, as per `Function`, and a prototype field matching the object). */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Class<T> = new (...args: any) => T;

/** Is a given value a class constructor? */
export const isConstructor = <T extends AnyConstructor>(value: T | unknown): value is T => typeof value === "function" && value.toString().startsWith("class");

/** Is a value an instance of a class? */
export const isInstance = <T>(value: unknown, type: Class<T>): value is T => value instanceof type;

/** Assert that a value is an instance of something. */
export function assertInstance<T>(value: T | unknown, type: Class<T>): asserts value is T {
	if (!(value instanceof type)) throw new AssertionError(`Must be instance of ${debug(type)}`, value);
}
