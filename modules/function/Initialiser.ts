import type { Arguments } from "./types";

/**
 * Initialiser function: a function that returns a (possibly expensive) initial value.
 * @param ...args Any arguments the initialiser needs.
 */
export type Initialiser<T, A extends Arguments = []> = ((...args: A) => T) | T;

/**
 * Lazy value: a plain value, or an initialiser function that returns that value.
 */
export type Lazy<T, A extends Arguments = []> = Initialiser<T, A> | T;

/**
 * Initialise a lazy value.
 *
 * @param value The lazy value to resolve.
 * @param ...args Any additional arguments the initialiser needs.
 */
export function initialise<T, A extends Arguments = []>(value: Lazy<T, A>, ...args: A): T;
export function initialise(value: Lazy<unknown, unknown[]>, ...args: unknown[]): unknown {
	return typeof value === "function" ? value(...args) : value;
}
