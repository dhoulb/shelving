/**
 * Deriver: a function that takes an input value and returns a value derived from it.
 * - Consistent with: `Dispatcher`, `Deriver`, `Filterer`, `Comparer`, `Matcher`
 * - Returning the `SKIP` constant from a `Deriver` should skip that value.
 */
export type Deriver<T = unknown, TT = unknown> = (input: T) => TT;

/** `Deriver` that might return a promise */
export type AsyncDeriver<T = unknown, TT = unknown> = (input: T) => TT | Promise<TT>;
