import { useRef } from "react";
import { ArrayState, ImmutableArray, ImmutableObject, LOADING, MapState, State } from "..";
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
	const memoizedState = (useRef<State<T>>().current ||= initial instanceof State ? initial : State.create<T>(initial));

	// Select either the `State` instance from the input parameters (if there is one) or use the memoized `State` instance from the initial value.
	const whichState = initial instanceof State ? initial : memoizedState;

	useObserve(whichState);
	return whichState;
};

/**
 * Subscribe to or create a new Shelving `MapState` instance.
 * - Defaults to a new `MapState` instance with no entries.
 */
export const useMapState = <T>(initial?: MapState<T> | ImmutableObject<T> | Promise<ImmutableObject<T>> | typeof LOADING): MapState<T> => {
	// Create a memoized `MapState` instance from the initial value (if it's not a state itself).
	const memoizedState = (useRef<MapState<T>>().current ||= initial instanceof MapState ? initial : MapState.create<T>(initial));

	// Select either the `MapState` instance from the input parameters (if there is one) or use the memoized `MapState` instance from the initial value.
	const whichState = initial instanceof MapState ? initial : memoizedState;

	useObserve(whichState);
	return whichState;
};

/**
 * Subscribe to or create a new Shelving `ArrayState` instance.
 * - Defaults to a new `ArrayState` instance with no items.
 */
export const useArrayState = <T>(initial?: ArrayState<T> | ImmutableArray<T> | Promise<ImmutableArray<T>> | typeof LOADING): ArrayState<T> => {
	// Create a memoized `ArrayState` instance from the initial value (if it's not a state itself).
	const memoizedState = (useRef<ArrayState<T>>().current ||= initial instanceof ArrayState ? initial : ArrayState.create<T>(initial));

	// Select either the `ArrayState` instance from the input parameters (if there is one) or use the memoized `ArrayState` instance from the initial value.
	const whichState = initial instanceof ArrayState ? initial : memoizedState;

	useObserve(whichState);
	return whichState;
};
