import { isConstructor } from "./class.js";

/** Is a value a function? */
export const isFunction = <X extends AnyFunction>(v: X | unknown): v is X => typeof v === "function";

/** Any function (designed for use with `extends AnyFunction` guards). */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyFunction = (...args: AnyArguments) => any;

/** Readonly unknown array that is being used as a set of arguments to a function. */
export type Arguments = readonly unknown[];

/** Any function arguments (designed for use with `extends AnyArguments` guards). */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyArguments = readonly any[];

/** Function that just passes through the first argument. */
export const PASSTHROUGH = <T>(value: T): T => value;

/** Function that does nothing with its arguments and always returns void. */
export const BLACKHOLE: (...args: AnyArguments) => void | undefined = () => undefined;

/**
 * Lazy value: a plain value, or an initialiser function that returns that value.
 * @param ...args Any arguments the lazy value needs if it's a function.
 */
export type Lazy<T, A extends AnyArguments = []> = ((...args: A) => T) | (new (...args: A) => T) | T;

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
export function getLazy<T, A extends AnyArguments = []>(value: (...args: A) => T, ...args: A): T; // Generics flow through this overload better than using `Lazy`
export function getLazy<T, A extends AnyArguments = []>(value: new (...args: A) => T, ...args: A): T; // Generics flow through this overload better than using `Lazy`
export function getLazy<T, A extends AnyArguments = []>(value: Lazy<T, A>, ...args: A): T;
export function getLazy(value: Lazy<unknown, unknown[]>, ...args: unknown[]): unknown {
	return typeof value !== "function" ? value : isConstructor(value) ? new value(...args) : value(...args);
}

/**
 * Fetcher: a function that fetches a value.
 *
 * @param ...args Any arguments the fetcher needs.
 * @returns The fetched value.
 */
export type Fetcher<T, A extends AnyArguments = []> = (...args: A) => T;

/** `Fetcher` that possibly returns a promise. */
export type AsyncFetcher<T, A extends AnyArguments = []> = (...args: A) => T | Promise<T>;
