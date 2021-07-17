import { useRef } from "react";
import { Arguments, isArrayEqual, initialise } from "..";
import { Initialiser } from "../util";

/**
 * Version of React's `useMemo()` that allows the use of a pure (side-effect free) function.
 *
 * @param initialiser The value to memoise, or an initialiser function that returns that value.
 * - If this is a non-function, it is used as the memoised value (the same instance will be returned if `args` are unchanged).
 * - If this is a function, it is called to retrieve the memoised value with `args` as its parameters.
 *
 * @param args Set of arguments that specify whether the returned value is refreshed or not.
 * - This array of values is passed _into_ the function as its parameters.
 * - This means you can create the function once (outside the component) rather than creating it on every render.
 * - This improves performance (though probably only noticeable on functions that render 1,000s of times).
 */
export function usePureMemo<T>(initialiser: T, args: Arguments): T;
export function usePureMemo<T, A extends Arguments>(initialiser: Initialiser<T, A>, args: A): T;
export function usePureMemo<T, A extends Arguments>(initialiser: T | Initialiser<T, A>, args: A): T {
	const internals = (useRef<{
		value: T;
		args: A;
	}>().current ||= {
		value: initialise(initialiser, ...args),
		args,
	});

	if (!isArrayEqual<A>(args, internals.args)) {
		internals.value = initialise(initialiser, ...args);
		internals.args = args;
	}

	return internals.value;
}
