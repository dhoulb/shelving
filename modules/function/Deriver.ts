import type { SKIP } from "../constants";

/**
 * Deriver: a function that takes an input value and returns a value derived from it.
 * - Consistent with: `Dispatcher`, `Deriver`, `Searcher`, `Comparer`, `Matcher`
 * - Returning the `SKIP` constant from a `Deriver` should skip that value.
 */
export type Deriver<T = unknown, TT = unknown> = (input: T) => TT | typeof SKIP;

/** `Deriver` that might return a promise */
export type AsyncDeriver<T = unknown, TT = unknown> = (input: T) => TT | typeof SKIP | Promise<TT | typeof SKIP>;
