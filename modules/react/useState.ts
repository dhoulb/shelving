import { useRef } from "react";
import type { Data } from "../util/data.js";
import type { ImmutableObject } from "../util/object.js";
import type { ImmutableArray } from "../util/array.js";
import { ArrayState } from "../stream/ArrayState.js";
import { BooleanState } from "../stream/BooleanState.js";
import { DataState } from "../stream/DataState.js";
import { ObjectState } from "../stream/ObjectState.js";
import { initialState, State } from "../stream/State.js";
import { NOVALUE } from "../util/constants.js";
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
export function useState<T>(initial: T | typeof NOVALUE): State<T> {
	// Create a memoized `State` instance from the initial value (if it's not a state itself).
	const state = (useRef<State<T>>().current ||= initial !== NOVALUE ? initialState(initial) : new State<T>());
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
