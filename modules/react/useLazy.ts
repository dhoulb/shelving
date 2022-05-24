import { useRef } from "react";
import type { Arguments } from "../util/function.js";
import { isArrayEqual } from "../util/equal.js";
import { getLazy, Lazy } from "../util/lazy.js";

/**
 * Use a lazy value.
 *
 * Similar to React's `useMemo()` except...
 * - Calls the initialiser function with `args` as its parameters.
 * - Allows `initial` to be an initialiser function _or_ a plain value.
 *
 * @param value The plain value to memoise, or an initialiser function that returns that value.
 * @param ...args Set of arguments that specify whether the returned value is refreshed or not.
 * - This array of values is passed into the initialiser function as its parameters.
 */
export function useLazy<T, A extends Arguments>(value: (...args: A) => T, ...args: A): T; // Generics flow through this overload better than using `Lazy`
export function useLazy<T>(value: T, ...args: Arguments): T;
export function useLazy<T, A extends Arguments>(value: Lazy<T, A>, ...args: A): T {
	const internals = (useRef<{
		value: T;
		args: A;
	}>().current ||= {
		value: getLazy(value, ...args),
		args,
	});
	if (!isArrayEqual<A>(args, internals.args)) {
		internals.value = getLazy(value, ...args);
		internals.args = args;
	}
	return internals.value;
}
