import { useRef } from "react";
import { Arguments, isArrayEqual } from "../index.js";

/**
 * Use a (memoized) class instance.
 *
 * @param Class The class constructor to create an instance of.
 *
 * @param ...args Set of arguments that specify whether the returned value is refreshed or not.
 * - This array of values is passed into the class constructor as its parameters.
 */
export function useInstance<T, A extends Arguments>(Class: new (...a: A) => T, ...args: A): T {
	const internals = (useRef<{
		value: T;
		args: A;
	}>().current ||= {
		value: new Class(...args),
		args,
	});
	if (!isArrayEqual<A>(args, internals.args)) {
		internals.value = new Class(...args);
		internals.args = args;
	}
	return internals.value;
}
