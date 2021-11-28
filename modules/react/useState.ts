import { useRef } from "react";
import { ArrayState, Data, DataState, ImmutableArray, initialState } from "../index.js";
import { useSubscribe } from "./useSubscribe.js";

/**
 * Subscribe or create a new Shelving `State` instance.
 *
 * @param initial The initial value of the state.
 * - `initial` is a `State` instance: component will subscribe to it and return it.
 * - `initial` is not a `State instance: component will create a new `State` instance, subscribe to it, and return it.
 *
 * @returns The state instance that was subscribed to.
 */
export function useDataState<T extends Data>(initial: T): DataState<T> {
	// Create a memoized `State` instance from the initial value (if it's not a state itself).
	const state = (useRef<DataState<T>>().current ||= initialState(initial, new DataState<T>()));
	useSubscribe(state);
	return state;
}

/**
 * Subscribe to or create a new Shelving `ArrayState` instance.
 * - Defaults to a new `ArrayState` instance with no items.
 */
export function useArrayState<T>(initial: ImmutableArray<T> = []): ArrayState<T> {
	const state = (useRef<ArrayState<T>>().current ||= initialState(initial, new ArrayState<T>()));
	useSubscribe(state);
	return state;
}
