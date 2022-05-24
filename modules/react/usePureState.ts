import { useRef, useState } from "react";
import type { Arguments } from "../util/function.js";
import { isArrayEqual } from "../util/equal.js";
import { getLazy, Lazy } from "../util/lazy.js";

/**
 * Version of React's `useState()` that allows the use of a pure (side-effect free) function.
 * - Unlike `useState()` the initialiser will be re-run and the state will be regenerated if `args` changes.
 *
 * @param initial The initial value of the state, or an initialiser function that returns that value.
 * @param ...args Set of arguments that specify whether the returned value is refreshed or not.
 * - This array of values is passed into the initialiser function as its parameters.
 */
export function usePureState<T, A extends Arguments>(initial: (...args: A) => T, ...args: A): readonly [T, (next: T) => void]; // Generics flow through this overload better than using `Lazy`
export function usePureState<T>(initial: T, ...args: Arguments): readonly [T, (next: T) => void];
export function usePureState<T, A extends Arguments>(initial: Lazy<T, A>, ...args: A): readonly [T, (next: T) => void] {
	const setState = useState<T>()[1];
	const internals: {
		state: [T, (next: T) => void];
		args: A;
	} = (useRef<{
		state: [T, (next: T) => void];
		args: A;
	}>().current ||= {
		state: [getLazy(initial, ...args), v => void (internals.state[0] !== v && setState((internals.state[0] = v)))],
		args,
	});
	if (!isArrayEqual<A>(args, internals.args)) {
		internals.state[0] = getLazy(initial, ...args);
		internals.args = args;
	}
	return internals.state;
}
