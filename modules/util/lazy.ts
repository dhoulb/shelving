import type { Arguments } from "./function.js";
import { isFunction } from "./function.js";

/**
 * Lazy value: a plain value, or an initialiser function that returns that value.
 *
 * @see https://dhoulb.github.io/shelving/util/lazy/Lazy
 */
export type Lazy<T, A extends Arguments = []> = ((...args: A) => T) | T;

/**
 * Initialise a lazy value.
 * - If `value` is a plain value, that value is returned.
 * - If `value` is a function, it is called with `args` and its returned value is returned.
 *
 * @param value The lazy value to resolve.
 * @param args Any additional arguments passed into the initialiser function as its parameters.
 * @returns The resolved value.
 * @example getLazy(() => 123) // 123
 * @example getLazy(123) // 123
 * @see https://dhoulb.github.io/shelving/util/lazy/getLazy
 */
export function getLazy<T, A extends Arguments>(value: (...args: A) => T, ...args: A): T; // Generics flow through this overload better than using `Lazy`
export function getLazy<T, A extends Arguments>(value: Lazy<T, A>, ...args: A): T;
export function getLazy<T, A extends Arguments>(value: Lazy<T, A>, ...args: A): unknown {
	return isFunction(value) ? value(...args) : value;
}
