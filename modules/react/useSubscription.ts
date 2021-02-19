import { fingerprint, Subscriptor, Dependencies } from "..";
import { getCachedSource } from "./cache";
import { useState } from "./useState";

/**
 * Use a subscription in a React component.
 * - If the subscription hasn't loaded for the first time yet this will throw a promise (to be caught by a `<Suspense>` above it).
 * - The dependencies MUST uniquely identify this async value! This is very important or you may get wrong values.
 *
 * @param subscriptor Function that creates a subscription and returns an unsubscribe callback.
 * @param deps Value the promise relies on like `useEffect()` and `useMemo()` etc. Deps are passed as the arguments to `subscriber()` if it's a function.
 */
export const useSubscription = <T, D extends Dependencies>(subscriptor: Subscriptor<T, D>, deps: D): T => {
	const source = getCachedSource<T>(`${fingerprint(subscriptor)}:${fingerprint(deps)}`);
	void useState(source.subscription); // Use `source.subscription` not `source` directly to indicate this is a subscription.
	source.subscribeTo(subscriptor, deps);
	return source.value;
};
