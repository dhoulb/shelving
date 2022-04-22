import { Arguments, isFunction } from "./function.js";
import { isConstructor } from "./class.js";

/**
 * Lazy value: a plain value, or an initialiser function that returns that value.
 * @param ...args Any arguments the lazy value needs if it's a function.
 */
export type Lazy<T, A extends Arguments = []> = ((...args: A) => T) | (new (...args: A) => T) | T;

/**
 * Initialise a lazy value.
 *
 * @param value The lazy value to resolve.
 * - If this is a plain value, that value is returned.
 * - If this is a function, it is called and its returned value is returned.
 * - If this is a class constructor, a new instance of that class is instantiated and returned.
 *
 * @param ...args Any additional arguments the initialiser needs.
 * - This array of values is passed into the function or class constructor as its parameters.
 */
export function getLazy<T, A extends Arguments>(value: (...args: A) => T, ...args: A): T; // Generics flow through this overload better than using `Lazy`
export function getLazy<T, A extends Arguments>(value: new (...args: A) => T, ...args: A): T; // Generics flow through this overload better than using `Lazy`
export function getLazy<T, A extends Arguments>(value: Lazy<T, A>, ...args: A): T;
export function getLazy<T, A extends Arguments>(value: Lazy<T, A>, ...args: A): unknown {
	return isConstructor(value) ? new value(...args) : isFunction(value) ? value(...args) : value;
}
