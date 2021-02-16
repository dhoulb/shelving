import { fingerprint, Subscriptor, getSource, Dependencies } from "..";
import { useState } from "./useState";

/**
 * Use a subscription in a React component.
 * - If the subscription hasn't loaded for the first time yet this will throw a promise (to be caught by a `<Suspense>` above it).
 * - The dependencies MUST uniquely identify this async value! This is very important or you may get wrong values.
 *
 * @param subscribe Function that creates a subscription and returns an unsubscribe callback.
 * @param deps Value the promise relies on like `useEffect()` and `useMemo()` etc. Deps are passed as the arguments to `subscriber()` if it's a function.
 */
export const useSubscription = <T, D extends Dependencies>(subscribe: Subscriptor<T, D>, deps: D): T => {
	const source = getSource<T>(`${fingerprint(subscribe)}: ${fingerprint(deps)}`);
	void useState(source.subscription); // Use `source.subscription` not `source` directly to indicate this is a subscription.
	source.subscribeTo(subscribe, deps);
	return source.value;
};
