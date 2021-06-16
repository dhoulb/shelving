import { SKIP } from "./constants";

/**
 * Any function.
 * - Consistency with `AnyConstructor`
 * - Designed to be used with `extends AnyFunction` guards.
 * - Exists because it's hard to remember the `...args: any[]` syntax, and annoying to disable `no-explicit-any` every time.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyFunction = (...args: any) => any;

/**
 * Arguments: a readonly unknown array that is being used as a set of arguments to a function.
 */
export type Arguments = readonly unknown[];

/** Function that just passes through the first argument. */
export const PASSTHROUGH = <T>(value: T): T => value;

/** Function that does nothing with its arguments and always returns void. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const BLACKHOLE: (...args: any[]) => void | undefined = () => undefined;

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

/**
 * Fetcher: a function that fetches a value.
 *
 * @param ...args Any arguments the fetcher needs.
 * @returns The fetched value.
 */
export type Fetcher<T, A extends Arguments = []> = (...args: A) => T;

/** `Fetcher` that possibly returns a promise. */
export type AsyncFetcher<T, A extends Arguments = []> = (...args: A) => T | Promise<T>;

/**
 * Deriver: a function that takes an input value and returns a value derived from it.
 * - Consistent with: `Dispatcher`, `Deriver`, `Searcher`, `Comparer`, `Matcher`
 * - Returning the `SKIP` constant from a `Deriver` should skip that value.
 */
export type Deriver<T = unknown, TT = unknown> = (input: T) => TT | typeof SKIP;

/** `Deriver` that might return a promise */
export type AsyncDeriver<T = unknown, TT = unknown> = (input: T) => TT | typeof SKIP | Promise<TT | typeof SKIP>;
