import type { Arguments } from "../util/function.js";
import { useRef } from "react";

/**
 * Use memoised value with reduction logic.
 * - Calls `reduce()` on each render.
 * - First argument (`previous`) is either `undefined` (on first render) or the value returned by `reduce()` on the previous render (on subsequent renders).
 * - `reduce()` can implement custom logic to decide whether to return the previous value or a new one.
 * - Returns whatever `reduce()` returns on this render.
 */
export function useReduce<T, A extends Arguments = []>(reduce: (previous: T | undefined, ...a: A) => T, ...args: A): T;
export function useReduce<T, A extends Arguments = []>(reduce: (previous: T | undefined, ...a: A) => T | undefined, ...args: A): T | undefined; // Allows inference if `undefined` is a value that `reduce()` can return.
export function useReduce<T, A extends Arguments = []>(reduce: (previous: T | undefined, ...a: A) => T, ...args: A): T {
	const ref = useRef<T>();
	return (ref.current = reduce(ref.current, ...args));
}
