import { useRef, useState } from "react";
import { Arguments, getLazy, isArrayEqual, Lazy } from "../index.js";

/**
 * Version of React's `useState()` that allows the use of a pure (side-effect free) function.
 * - Unlike `useState()` the initialiser will be re-run and the state will be regenerated if `args` changes.
 *
 * @param initial The initial value of the state, or an initialiser function or class constructor that returns that value.
 * - If this is a plain value, that value is returned.
 * - If this is a function, it is called and its returned value is returned.
 * - If this is a class constructor, a new instance of that class is instantiated and returned.
 *
 * @param ...args Set of arguments that specify whether the returned value is refreshed or not.
 * - This array of values is passed into the function or class constructor as its parameters.
 * - This means you can create the function once (outside the component) rather than creating it on every render.
 * - This improves performance (though probably only noticeable on functions that render 1,000s of times).
 */
export function usePureState<T, A extends Arguments>(initial: (...args: A) => T, ...args: A): readonly [T, (next: T) => void]; // Generics flow through this overload better than using `Lazy`
export function usePureState<T, A extends Arguments>(initial: new (...args: A) => T, ...args: A): readonly [T, (next: T) => void]; // Generics flow through this overload better than using `Lazy`
export function usePureState<T>(initial: T, ...args: Arguments): readonly [T, (next: T) => void];
export function usePureState<T, A extends Arguments>(initial: Lazy<T, A>, ...args: A): readonly [T, (next: T) => void] {
	const setState = useState<T>()[1];
	const internals = (useRef<{ state: [T, (next: T) => void]; args: A }>().current ||= {
		state: [
			getLazy(initial, ...args),
			(v: T) => {
				if (internals.state[0] !== v) {
					setState(v);
					internals.state[0] = v;
				}
			},
		],
		args,
	});
	if (!isArrayEqual<A>(args, internals.args)) {
		internals.state = [getLazy(initial, ...args), internals.state[1]];
		internals.args = args;
	}
	return internals.state;
}
