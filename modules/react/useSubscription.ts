import { fingerprint } from "..";
import type { Dependencies } from "..";
import { SourceSubscriber, useLiveSource } from "./useSource";

/**
 * Use a subscription in a React component.
 * - If the subscription hasn't loaded for the first time yet this will throw a `Promise` (to be caught by a `<Suspense>` above it).
 * - The dependencies MUST uniquely identify this async value! This is very important or you may get wrong values.
 *
 * @param subscribe Function that creates a subscription and returns an unsubscribe callback.
 * @param deps Value the promise relies on like `useEffect()` and `useMemo()` etc. Deps are passed as the arguments to `subscriber()` if it's a function.
 */
export const useSubscription = <T, D extends Dependencies>(subscribe: SourceSubscriber<T, D>, deps: D): T => {
	const source = useLiveSource<T>(`${fingerprint(subscribe)}: ${fingerprint(deps)}`);
	source.subscribe(subscribe, deps);
	const { value, error } = source.value;
	if (error) throw error;
	return value;
};
