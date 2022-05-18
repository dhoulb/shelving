import { useRef } from "react";
import { ArrayState, BooleanState, Data, DataState, ImmutableArray, ImmutableObject, initialState, LOADING, ObjectState, State } from "../index.js";
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
export function useState<T>(initial: T | typeof LOADING): State<T> {
	// Create a memoized `State` instance from the initial value (if it's not a state itself).
	const state = (useRef<State<T>>().current ||= initial !== LOADING ? initialState(initial, new State<T>()) : new State<T>());
	useSubscribe(state);
	return state;
}

/**
 * Subscribe or create a new Shelving `DataState` instance.
 * - Defaults to a new `DataState` instance with this provided initial value.
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

/**
 * Subscribe to or create a new Shelving `ObjectState` instance.
 * - Defaults to a new `ObjectState` instance with no items.
 */
export function useObjectState<T>(initial: ImmutableObject<T> = {}): ObjectState<T> {
	const state = (useRef<ObjectState<T>>().current ||= initialState(initial, new ObjectState<T>()));
	useSubscribe(state);
	return state;
}

/**
 * Subscribe to or create a new Shelving `BooleanState` instance.
 * - Defaults to a new `BooleanState` instance set to false.
 */
export function useBooleanState(initial = false): BooleanState {
	const state = (useRef<BooleanState>().current ||= initialState(initial, new BooleanState()));
	useSubscribe(state);
	return state;
}
