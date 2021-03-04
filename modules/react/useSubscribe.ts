import { useEffect, useRef, useState as useReactState } from "react";
import { Subscribable, Unsubscriber, LOADING, NOERROR } from "..";

/**
 * Connect any `Subscribable` to a React component.
 * - So the component refreshes when the subscribable issues a new value or errors.
 *
 * @returns The dispatched next value, or the `LOADING` symbol if no values have been dispatched yet.
 * @throws Any error caught by the subscribable.
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
