/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useRef, useState as useReactState } from "react";
import { Dependencies, AnyFunction, Unsubscriber, isArrayEqual, State, createState, NOVALUE } from "..";

type StateInternal<T> = {
	state: State<T>;
	deps?: Dependencies;
	effect: () => void | Unsubscriber;
};

/**
 * Use or create a Shelving `State` instance.
 * - Listens to a `State` and every time it fires with new value, calls a React `setState()` and returns that value.
 * - Global state: If an existing `State` instance is passed in, attach it to this component and return the same instance.
 * - Local state: If a plain value or function initialiser is passed in, create a new `State` instance using that value as its initial value.
 *
 * @param value A plain value to use as the initial value for the returned `State` object.
 * @param initialiser A function to call to get the initial state for the returned `State` instance.
 * - Uses the `deps` dependencies array as the initialiser function's arguments.
 * - This allows you to define the initialiser function _outside_ the component (which saves creating a new function on every render).
 * @param state An existing `State` instance.
 * - If the instance changes from
 * @returns The value of the `State` object, whenever it is updated.
 */
export function useState<S extends State<any>>(input: S, deps?: Dependencies): S; // Detects existing `State` instances (dependencies are optional).
export function useState<T, D extends Dependencies>(input: (...deps: D) => T, deps: D): State<T>; // Detect initialiser functions (dependencies are required and must match
export function useState<T>(input: Exclude<T, AnyFunction>, deps?: Dependencies): State<T>; // Detect plain values (dependencies are optional).
export function useState<T>(input: State<T> | T | ((...d: Dependencies) => T), deps?: Dependencies): State<T> {
	const setValue = useReactState<T | typeof NOVALUE>(NOVALUE)[1];

	const ref = useRef<StateInternal<T>>();
	let state = ref.current?.state;
	let effect = ref.current?.effect;
	const lastDeps = ref.current?.deps;

	// If `input` is a `State` instance, update the internals if the deps or the instance change.
	// If `input` is not a `State` instance, update the internals if the deps change.
	if (!state || !effect || (deps && lastDeps ? !isArrayEqual(deps, lastDeps) : deps !== lastDeps)) {
		state = input instanceof State ? input : createState(input instanceof Function ? (deps ? input(...deps) : input()) : input);
		effect = () => {
			if (state) {
				if (!state.loading) setValue(state.value);
				return state.subscribe(setValue);
			}
		};
		ref.current = { state, deps, effect };
	}

	// Use an effect.
	useEffect(effect, [effect]);

	return state;
}
