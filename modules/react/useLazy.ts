import { useRef } from "react";
import { isArrayEqual, Arguments } from "..";

/**
 * Lazy: a value that only changes when its dependencies change.
 *
 * Similar to the built in React `useMemo()` but...
 * 1. Only allows the `initialiser()` function form.
 * 2. Uses the `deps` dependencies array as the initialiser function's arguments.
 *    - This allows you to define the initialiser function _outside_ the component (which saves creating a new function on every render).
 *
 * If the initialiser function doesn't require any arguments or you want to use a simple value rather than an initialiser function, use `useMemo()` instead.
 *
 * @param value The value or an initialiser function for the value.
 * @param ...args Any arguments the initialiser needs.
 * @returns The value returned from the initialiser (if the dependencies haven't changed, will be the same exact instance as the last call).
 */
export const useLazy = <T, A extends Arguments>(initialiser: (...args: A) => T, args: A): T => {
	const internals = (useRef<{
		value: T;
		args: A;
	}>().current ||= {
		value: initialiser(...args),
		args,
	});

	if (!isArrayEqual<A>(args, internals.args)) {
		internals.value = initialiser(...args);
		internals.args = args;
	}

	return internals.value;
};
