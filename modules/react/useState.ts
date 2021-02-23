import { useEffect, useRef, useState as useReactState } from "react";
import { isShallowEqual, LOADING, NOERROR, State } from "..";
import { Unsubscriber } from "../function";

/**
 * Subscribe or create a new Shelving `State` instance.
 *
 * @param initial The initial value of the state.
 * @param depend Dependency that is tested (with shallow equality) to see if the state should be reset and recreated.
 * @returns The value returned from the initialiser (if the dependencies haven't changed, will be the same exact instance as the last call).
 */
export const useState = <T>(initial: State<T> | T | Promise<T>, depend?: unknown): State<T> => {
	const setNext = useReactState<T | typeof LOADING>(LOADING)[1];
	const setError = useReactState<Error | unknown | typeof NOERROR>(NOERROR)[1];

	const internals: {
		state: State<T>;
		depend?: unknown;
		effect: () => Unsubscriber;
	} = (useRef<{
		state: State<T>;
		depend?: unknown;
		effect: () => Unsubscriber;
	}>().current ||= {
		state: initial instanceof State ? initial : State.create(initial),
		depend,
		effect: () => internals.state.subscribe(setNext, setError),
	});

	// Refresh value if the deps change.
	if (!isShallowEqual(depend, internals.depend)) {
		internals.state = initial instanceof State ? initial : State.create(initial);
		internals.depend = depend;
	}

	const { state, effect } = internals;
	useEffect(effect, [effect, state]);

	return state;
};
