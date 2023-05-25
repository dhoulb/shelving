import type { AnyState } from "../state/State.js";
import type { ImmutableArray } from "../util/array.js";
import type { StopCallback, ValueCallback } from "../util/callback.js";
import type { Nullish } from "../util/null.js";
import { useEffect, useState as useReactState } from "react";
import { call } from "../util/callback.js";
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
export function useState<T extends AnyState>(state?: Nullish<T>): Nullish<T>;
export function useState<T extends ImmutableArray<Nullish<AnyState>>>(...states: T): T;
export function useState(...states: Nullish<AnyState>[]): ImmutableArray<Nullish<AnyState>> | Nullish<AnyState> {
	const setValue = useReactState<unknown>(undefined)[1];
	useEffect(() => {
		const rerender = () => setValue({});
		const stops = mapArray(states, _startState, rerender);
		return () => stops.filter(isDefined).forEach(call);
	}, states);
	return states.length <= 1 ? states[0] : states;
}

/** Start a subscription to a `ReferenceState` instance and rerender a new value or error is issued. */
const _startState = (state: Nullish<AnyState>, rerender: ValueCallback<unknown>): StopCallback | undefined => state?.next.to(rerender, rerender);
