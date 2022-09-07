import { useEffect, useState as useReactState } from "react";
import { AnyState, State } from "../state/State.js";
import { BLACKHOLE } from "../util/function.js";
import { runSequence } from "../util/sequence.js";

/**
 * Subscribe to a Shelving `State` instance.
 *
 * @param state Shelving `State` instance.
 * - Subscription is recreated every time this value changes.
 * - Memoise this value to persist the subscription for the lifetime of the component.
 * - If the value is a `State` instance
 */
export function useState<S extends AnyState>(state: S): S;
export function useState<S extends AnyState>(state?: S | undefined): S | undefined;
export function useState<S extends AnyState>(state?: S | undefined): S | undefined {
	const setState = useReactState<unknown>(state && !state.loading ? state.value : State.NOVALUE)[1];
	const [error, setError] = useReactState<Error | unknown>(undefined);
	useEffect(state ? () => runSequence(state.next, setState, setError) : BLACKHOLE, [state]);
	if (error) throw error;
	return state;
}
