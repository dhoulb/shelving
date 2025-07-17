import { isArrayEqual } from "../util/equal.js";
import type { Arguments } from "../util/function.js";
import { type Lazy, getLazy } from "../util/lazy.js";
import { useProps } from "./useProps.js";

/**
 * Use a memoised value with lazy initialisation.
 * - Returns `value` (if not a function) or the result of calling `value(...args)` (if a function).
 * - Returns same `value` for as long as `args` is equal to previous `args`.
 */
export function useLazy<T, A extends Arguments = []>(value: (...args: A) => T, ...args: A): T; // Generics flow through this overload better than using `Lazy`
export function useLazy<T>(value: T, ...args: Arguments): T;
export function useLazy<T, A extends Arguments = []>(value: Lazy<T, A>, ...args: A): T;
export function useLazy<T, A extends Arguments = []>(value: Lazy<T, A>, ...args: A): T {
	const internals = useProps<{ value: T; args: A }>();

	// Update `internals` if `args` changes.
	if (!internals.args || !isArrayEqual<A>(args, internals.args)) {
		internals.value = getLazy(value, ...args);
		internals.args = args;
	}

	return internals.value as T;
}
