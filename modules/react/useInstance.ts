import { isArrayEqual } from "../util/equal.js";
import type { Arguments } from "../util/function.js";
import { useProps } from "./useProps.js";

/**
 * Use a memoised class instance.
 * - Creates a new instance of `Constructor` using `args`
 * - Returns same instance for as long as `args` is equal to previous `args`.
 */
export function useInstance<T, A extends Arguments = []>(Constructor: new (...a: A) => T, ...args: A): T {
	const internals = useProps<{ instance: T; args: A }>();

	// Update `internals` if `args` changes or `instance` is not set.
	if (!internals.args || !internals.instance || !isArrayEqual<A>(args, internals.args)) {
		internals.instance = new Constructor(...args);
		internals.args = args;
	}

	return internals.instance;
}
