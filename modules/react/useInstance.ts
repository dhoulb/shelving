import { useRef } from "react";
import { isArrayEqual } from "../util/equal.js";
import type { Arguments } from "../util/function.js";

/**
 * Use a memoised class instance.
 * - Creates a new instance of `Constructor` using `args`
 * - Returns same instance for as long as `args` is equal to previous `args`.
 */
export function useInstance<T, A extends Arguments = []>(Constructor: new (...a: A) => T, ...args: A): T {
	const _internals = (useRef<{ instance: T; args: A }>(undefined).current ??= {
		instance: new Constructor(...args),
		args,
	});

	// Update `_internals` if `args` changes.
	if (!isArrayEqual<A>(args, _internals.args)) {
		_internals.instance = new Constructor(...args);
		_internals.args = args;
	}

	return _internals.instance;
}
