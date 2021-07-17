import { useRef, useState as useReactState } from "react";
import { LOADING, NOERROR, State, Catcher, Dispatcher } from "..";
import { usePureEffect } from "./usePureEffect";

/**
 * Subscribe or create a new Shelving `State` instance.
 *
 * @param initial The initial value of the state.
 * - `initial` is a `State` instance: component will subscribe to it and return it.
 * - `initial` is not a `State instance: component will create a new `State` instance, subscribe to it, and return it.
 *
 * @returns The state instance that was subscribed to.
 */
export const useState = <T>(initial: State<T> | T | Promise<T> | typeof LOADING): State<T> => {
	const setNext = useReactState<T | typeof LOADING>(LOADING)[1];
	const setError = useReactState<Error | unknown | typeof NOERROR>(NOERROR)[1];

	// Create a memoized `State` instance from the initial value (if it's not a state itself).
	const memoizedState = (useRef<State<T>>().current ||= initial instanceof State ? initial : new State<T>(initial));

	// Select either the `State` instance from the input parameters (if there is one) or use the memoized `State` instance from the initial value.
	const whichState = initial instanceof State ? initial : memoizedState;

	usePureEffect(stateSubscribeEffect, [whichState, setNext, setError]);
	return whichState;
};

/** Effect that subscribes the component to changes in the `State` instance for the lifetime of the component. */
const stateSubscribeEffect = <T>(state: State<T>, setNext: Dispatcher<T>, setError: Catcher) => state.subscribe(setNext, setError);
