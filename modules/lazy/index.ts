import type { Dependencies } from "../array";

/**
 * Lazy value: either a simple value, or a function that, when called, returns that value.
 * - Optionally has an array of dependencies that
 */
export type Lazy<T, D extends Dependencies = []> = ((...deps: D) => T) | T;

/**
 * Resolve a lazy value.
 *
 * @param value The lazy value to resolve.
 * @param ...deps The list of values to pass into the lazy value if it's an initialiser function.
 */
export const lazy = <T, D extends Dependencies = []>(value: Lazy<T, D>, ...deps: D): T => (value instanceof Function ? value(...deps) : value);
