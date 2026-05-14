import { useRef } from "react";
import { isArrayEqual } from "../util/equal.js";
import type { Arguments } from "../util/function.js";
import { getLazy, type Lazy } from "../util/lazy.js";

/**
 * Use a memoised value with lazy initialisation.
 * - Returns `value` (if not a function) or the result of calling `value(...args)` (if a function).
 * - Returns same `value` for as long as `args` is equal to previous `args`.
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
