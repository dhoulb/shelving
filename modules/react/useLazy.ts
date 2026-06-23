import { useRef } from "react";
import { isArrayEqual } from "../util/equal.js";
import type { Arguments } from "../util/function.js";
import { getLazy, type Lazy } from "../util/lazy.js";

/**
 * Use a memoised value with lazy initialisation.
 * - Returns `value` (if not a function) or the result of calling `value(...args)` (if a function).
 * - Returns same `value` for as long as `args` is equal to previous `args`.
 *
 * @param value Value to return, or a function called with `args` to lazily produce it.
 * @param args Arguments passed to `value()` when it is a function — a change in `args` recomputes the value.
 * @returns The memoised value, recomputed only when `args` changes.
 *
 * @example const config = useLazy(() => expensiveConfig(id), id);
 *
 * @see https://shelving.cc/react/useLazy
 */
export function useLazy<T, A extends Arguments = []>(value: (...args: A) => T, ...args: A): T; // Generics flow through this overload better than using `Lazy`
export function useLazy<T>(value: T, ...args: Arguments): T;
export function useLazy<T, A extends Arguments = []>(value: Lazy<T, A>, ...args: A): T;
export function useLazy<T, A extends Arguments = []>(value: Lazy<T, A>, ...args: A): T {
	const _internals = (useRef<{ value: T; args: A }>(undefined).current ??= {
		value: getLazy(value, ...args),
		args,
	});

	// Update `_internals` if `args` changes.
	if (!isArrayEqual<A>(args, _internals.args)) {
		_internals.value = getLazy(value, ...args);
		_internals.args = args;
	}

	return _internals.value;
}
