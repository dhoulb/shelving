import { useEffect, useState } from "react";
import { Subscribable, subscribe } from "../observe/Observable.js";
import { State } from "../state/State.js";
import { BLACKHOLE } from "../util/function.js";

/**
 * Subscribe to a `Subscribable` so the component updates when it issues a next value or error.
 *
 * @param subscribable An object implementing the `Subscribable` interface.
 * - Subscription is recreated every time this value changes.
 * - Memoise this value to persist the subscription for the lifetime of the component.
 */
export function useSubscribe<T>(subscribable?: Subscribable<T>): void {
	const setState = useState<unknown>(subscribable instanceof State && !subscribable.loading ? subscribable.value : State.NOVALUE)[1];
	useEffect(
		subscribable
			? () => {
					// If the subscribable is an observer, only subscribe if the subscribable isn't closed.
					// Otherwise `subscribe()` is likely to throw a `Observer is closed` error.
					if (typeof subscribable === "function" || !subscribable.closed) return subscribe(subscribable, { next: setState, error: setState });
			  }
			: BLACKHOLE,
		[subscribable],
	);
}
