import type { AnyState } from "../state/State.js";
import type { ImmutableArray } from "../util/array.js";
import type { Handler, Stop } from "../util/function.js";
import type { Dispatch } from "react";
import { useEffect, useState as useReactState } from "react";
import { dispatch } from "../util/function.js";
import { mapArray } from "../util/transform.js";
import { isDefined } from "../util/undefined.js";

/**
 * Subscribe to one or more `State` instances.
 *
 * @param state `State` instance.
 * - Subscription is recreated every time the state instance changes.
 * - Memoise this value to persist the subscription for the lifetime of the component.
 * - If the value is a `State` instance
 */
export function useState<T extends AnyState>(state: T): T;
export function useState<T extends AnyState>(state?: T | undefined): T | undefined;
export function useState<T extends ImmutableArray<AnyState | undefined>>(...states: T): T;
export function useState(...states: (AnyState | undefined)[]): ImmutableArray<AnyState | undefined> | AnyState | undefined {
	const setValue = useReactState<unknown>(undefined)[1];
	const [error, setError] = useReactState<Error | unknown>(undefined);
	useEffect(() => {
		const forceRerender = () => setValue({});
		const stops = mapArray(states, _startState, forceRerender, setError);
		return () => stops.filter(isDefined).forEach(dispatch);
	}, states);
	if (error) throw error;
	return states.length <= 1 ? states[0] : states;
}

/** Start a subscription to a `ReferenceState` instance. */
function _startState(state: AnyState | undefined, setValue: Dispatch<[unknown]>, setError: Handler): Stop | undefined {
	return state?.next.to(setValue, setError);
}
