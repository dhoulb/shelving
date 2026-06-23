import { useRef } from "react";
import type { Arguments } from "../util/function.js";

/**
 * Use memoised value with reduction logic.
 * - Calls `reduce()` on each render.
 * - First argument `previous` is either `undefined` (on first render) or the value returned by `reduce()` on the previous render (on subsequent renders).
 * - `reduce()` can implement custom logic to decide whether to return the previous value or a new one.
 * - Returns whatever `reduce()` returns on this render.
 *
 * @param reduce Reducer called on every render with the previous result and `args`; returns this render's value.
 * @param args Additional arguments forwarded to `reduce()` after `previous`.
 * @returns Whatever `reduce()` returned on this render.
 *
 * @example
 * // Keep the highest count ever seen.
 * const max = useReduce((previous = 0, next: number) => Math.max(previous, next), count);
 *
 * @see https://shelving.cc/react/useReduce
 */
export function useReduce<T, A extends Arguments = []>(reduce: (previous: T | undefined, ...a: A) => T, ...args: A): T;
export function useReduce<T, A extends Arguments = []>(
	reduce: (previous: T | undefined, ...a: A) => T | undefined,
	...args: A
): T | undefined; // Allows inference if `undefined` is a value that `reduce()` can return.
export function useReduce<T, A extends Arguments = []>(reduce: (previous: T | undefined, ...a: A) => T, ...args: A): T {
	const _ref = useRef<T | undefined>(undefined);
	_ref.current = reduce(_ref.current, ...args);
	return _ref.current;
}
