import { isArrayEqual } from "../util/equal.js";
import type { Arguments } from "../util/function.js";
import { type Lazy, getLazy } from "../util/lazy.js";
import { useInternals } from "./useInternals.js";

/**
 * Use a memoised value with lazy initialisation.
 * - Returns `value` (if not a function) or the result of calling `value(...args)` (if a function).
 * - Returns same `value` for as long as `args` is equal to previous `args`.
 */
export function useLazy<T, A extends Arguments = []>(value: (...args: A) => T, ...args: A): T; // Generics flow through this overload better than using `Lazy`
export function useLazy<T>(value: T, ...args: Arguments): T;
export function useLazy<T, A extends Arguments = []>(value: Lazy<T, A>, ...args: A): T;
export function useLazy<T, A extends Arguments = []>(value: Lazy<T, A>, ...args: A): T {
	const internals = useInternals<{ value: T; args: A }>();

	// Update `internals` if `args` changes.
	if (internals.args === undefined || !isArrayEqual<A>(args, internals.args)) {
		internals.value = getLazy(value, ...args);
		internals.args = args;
	}

	// biome-ignore lint/style/noNonNullAssertion: We know this is set.
	return internals.value!;
}
