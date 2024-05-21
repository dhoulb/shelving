import { isArrayEqual } from "../util/equal.js";
import type { Arguments } from "../util/function.js";
import { useInternals } from "./useInternals.js";

/**
 * Use a memoised class instance.
 * - Creates a new instance of `Constructor` using `args`
 * - Returns same instance for as long as `args` is equal to previous `args`.
 */
export function useInstance<T, A extends Arguments = []>(Constructor: new (...a: A) => T, ...args: A): T {
	const internals = useInternals<{ instance: T; args: A }>();

	// Update `internals` if `args` changes or `instance` is not set.
	if (!internals.args || !isArrayEqual<A>(args, internals.args)) {
		internals.instance = new Constructor(...args);
		internals.args = args;
	}

	// biome-ignore lint/style/noNonNullAssertion: We know this is set.
	return internals.instance!;
}
