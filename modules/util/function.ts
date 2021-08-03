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
 * Lazy value: a plain value, or an initialiser function that returns that value.
 * @param ...args Any arguments the lazy value needs if it's a funtion.
 */
export type Lazy<T, A extends Arguments = []> = ((...args: A) => T) | T;

/**
 * Initialise a lazy value.
 *
 * @param value The lazy value to resolve.
 * @param ...args Any additional arguments the initialiser needs.
 */
export function getLazy<T, A extends Arguments = []>(value: (...args: A) => T, ...args: A): T;
export function getLazy<T, A extends Arguments = []>(value: Lazy<T, A>, ...args: A): T;
export function getLazy(value: Lazy<unknown, unknown[]>, ...args: unknown[]): unknown {
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
