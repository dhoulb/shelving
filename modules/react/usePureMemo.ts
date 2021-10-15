import { useRef } from "react";
import { Arguments, isArrayEqual, getLazy, Lazy } from "../index.js";

/**
 * Version of React's `useMemo()` that allows the use of a pure (side-effect free) function.
 * - Also allows the first parameter to be a plain value that is memoised as long as `args` doesn't change.
 * - Also allows the first parameter to be a class constructor that will create a new instance of that class.
 *
 * @param value The value to memoise, or an initialiser function or class constructor that returns that value.
 * - If this is a plain value, that value is returned.
 * - If this is a function, it is called and its returned value is returned.
 * - If this is a class constructor, a new instance of that class is instantiated and returned.
 * - Class constructors are detected by whether the value is a function with a `name` property whose first character is an uppercase character.
 *
 * @param args Set of arguments that specify whether the returned value is refreshed or not.
 * - This array of values is passed into the function or class constructor as its parameters.
 * - This means you can create the function once (outside the component) rather than creating it on every render.
 * - This improves performance (though probably only noticeable on functions that render 1,000s of times).
 */
export function usePureMemo<T, A extends Arguments>(value: (...args: A) => T, args: A): T; // Generics flow through this overload better than using `Lazy`
export function usePureMemo<T, A extends Arguments>(value: new (...args: A) => T, args: A): T; // Generics flow through this overload better than using `Lazy`
export function usePureMemo<T>(value: T, args: Arguments): T;
export function usePureMemo<T, A extends Arguments>(value: Lazy<T, A>, args: A): T {
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
