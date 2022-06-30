import { useEffect, useState } from "react";
import { Subscribable, subscribe } from "../observe/Observable.js";
import { State } from "../state/State.js";
import { NOVALUE } from "../util/constants.js";
import { BLACKHOLE } from "../util/function.js";

/**
 * Subscribe to a `Subscribable` so the component updates when it issues a next value or error.
 *
 * @param subscribable An object implementing the `Subscribable` interface.
 * - Subscription is recreated every time this value changes.
 * - Memoise this value to persist the subscription for the lifetime of the component.
 */
export function useSubscribe<T>(subscribable?: Subscribable<T>): void {
	const setState = useState<unknown>(subscribable instanceof State && !subscribable.loading ? subscribable.value : NOVALUE)[1];
	useEffect(subscribable ? () => subscribe(subscribable, { next: setState, error: setState }) : BLACKHOLE, [subscribable]);
}
