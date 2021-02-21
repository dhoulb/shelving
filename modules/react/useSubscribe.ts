import { useEffect, useRef, useState } from "react";
import { Subscribable, Unsubscriber, LOADING, ERROR, NOERROR } from "..";

type SubscribeInternal<T> = {
	subscribable: Subscribable<T>;
	effect(): Unsubscriber;
	value: T | typeof LOADING;
	error: Error | unknown | typeof NOERROR;
};

/**
 * Connect any `Subscribable` to a component so the component refreshes when the subscribable issues a new value or errors.
 * - First returned value will always be `LOADING` symbol and nth will be the issued value.
 * - If the subscribable errors, the resulting error will be thrown.
 */
export const useSubscribe = <T>(subscribable: Subscribable<T>): T | typeof LOADING => {
	const setValue = useState<T | typeof LOADING | typeof ERROR>(LOADING)[1];
	const ref: SubscribeInternal<T> = (useRef<SubscribeInternal<T>>().current ||= {
		subscribable,
		effect: () =>
			ref.subscribable.subscribe({
				next: value => {
					ref.value = value;
					setValue(value);
				},
				error: thrown => {
					ref.error = thrown;
					setValue(ERROR);
				},
			}),
		error: NOERROR,
		value: LOADING,
	});
	ref.subscribable = subscribable;
	const effect = ref.effect;
	useEffect(effect, [effect, subscribable]);
	if (ref.error) throw ref.error;
	return ref.value;
};
