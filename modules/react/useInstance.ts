import type { Arguments } from "../util/function.js";
import { useRef } from "react";
import { isArrayEqual } from "../util/equal.js";

/**
 * Use a memoised class instance.
 * - Creates a new instance of `Constructor` using `args`
 * - Returns same instance for as long as `args` is equal to previous `args`.
 */
export function useInstance<T, A extends Arguments = []>(Constructor: new (...a: A) => T, ...args: A): T {
	const internals = (useRef<{
		value: T;
		args: A;
	}>().current ||= {
		value: new Constructor(...args),
		args,
	});
	if (!isArrayEqual<A>(args, internals.args)) {
		internals.value = new Constructor(...args);
		internals.args = args;
	}
	return internals.value;
}
