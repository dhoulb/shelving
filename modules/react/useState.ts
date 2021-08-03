import { useRef } from "react";
import { LOADING, State } from "..";
import { useObserve } from "./useObserve";

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
	// Create a memoized `State` instance from the initial value (if it's not a state itself).
	const memoizedState = (useRef<State<T>>().current ||= initial instanceof State ? initial : new State<T>(initial));

	// Select either the `State` instance from the input parameters (if there is one) or use the memoized `State` instance from the initial value.
	const whichState = initial instanceof State ? initial : memoizedState;

	useObserve(whichState);
	return whichState;
};
