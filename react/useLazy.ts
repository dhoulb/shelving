import { useRef } from "react";
import { isArrayEqual, Dependencies } from "shelving/tools";

type LazyInternal<T, D extends Dependencies> = {
	value: T;
	deps: D;
};

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
 * @param deps Array of dependencies that the initialiser relies on.
 * @returns The value returned from the initialiser (if the dependencies haven't changed, will be the same exact instance as the last call).
 */
export const useLazy = <T, D extends Dependencies>(initialiser: (...args: D) => T, deps: D): T => {
	const internals = (useRef<LazyInternal<T, D>>().current ||= {
		value: initialiser(...deps),
		deps,
	});

	// Refresh value if the deps change.
	if (!isArrayEqual<D>(deps, internals.deps)) {
		internals.value = initialiser(...deps);
		internals.deps = deps;
	}

	return internals.value;
};
