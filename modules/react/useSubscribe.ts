import { useEffect, useRef, useState as useReactState } from "react";
import { Subscribable, Unsubscriber, LOADING, NOERROR } from "..";

/**
 * Use the next value of a `Subscribable` object in a React component.
 * - `Subscribable` objects are those that implement a `subcribe()` function that can be called with an `Observer` to receive a stream of values.
 * - RxJS calls these `Observable`
 * - So the component refreshes when the subscribable issues a new value or errors.
 *
 * @returns The dispatched next value, or the `LOADING` symbol if no values have been dispatched yet.
 * @throws Any error received by the subscribable.
 */
export const useSubscribe = <T>(subscribable: Subscribable<T>): T | typeof LOADING => {
	const [next, setNext] = useReactState<T | typeof LOADING>(LOADING);
	const [error, setError] = useReactState<Error | unknown | typeof NOERROR>(NOERROR);

	const internals: {
		subscribable: Subscribable<T>;
		effect(): Unsubscriber;
	} = (useRef<{
		subscribable: Subscribable<T>;
		effect(): Unsubscriber;
	}>().current ||= {
		subscribable,
		effect: () => internals.subscribable.subscribe(setNext, setError),
	});
	internals.subscribable = subscribable;

	const { effect } = internals;
	useEffect(effect, [effect, subscribable]);

	if (error !== NOERROR) throw error;
	return next;
};
