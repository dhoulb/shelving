import { useEffect, useRef, useState as useReactState } from "react";
import { isShallowEqual, LOADING, NOERROR, State, Unsubscriber } from "..";

/**
 * Subscribe or create a new Shelving `State` instance.
 *
 * @param initial The initial value of the state.
 * - `initial` is a `State` instance: the component will subscribe to it.
 * - `initial` is not a `State instance: the component will create a new `State` instance and subscribe to it.
 * @param depend Dependency array that is used to control whether a new `State` instance is created.
 * - This is only used if `initial` is not a `State` instance.
 *
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
		state: initial instanceof State ? initial : new State(initial),
		depend,
		effect: () => internals.state.subscribe(setNext, setError),
	});

	// Refresh value if the initial value changes.
	if (initial instanceof State) {
		internals.state = initial;
		internals.depend = depend;
	} else if (!isShallowEqual(depend, internals.depend)) {
		internals.state = new State(initial);
		internals.depend = depend;
	}

	const { state, effect } = internals;
	useEffect(effect, [effect, state]);

	return state;
};
