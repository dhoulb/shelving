import type { Arguments } from "./types";

/**
 * Initialiser function: a function that returns a (possibly expensive) initial value.
 * @param ...args Any arguments the initialiser needs.
 */
export type Initialiser<T, A extends Arguments = []> = ((...args: A) => T) | T;

/**
 * Initialise a value.
 *
 * @param value The lazy value to resolve.
 * @param ...args Any additional arguments the initialiser needs.
 */
export function initialise<T, A extends Arguments = []>(value: Initialiser<T, A>, ...args: A): T;
export function initialise(value: Initialiser<unknown, unknown[]>, ...args: unknown[]): unknown {
	return typeof value === "function" ? value(...args) : value;
}
