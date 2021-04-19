import { Arguments, serialise, Subscriptor } from "..";
import { Source } from "./Source";
import { useState } from "./useState";

/** Store a list of named cached `Source` instances. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const sources: { [key: string]: Source<any> } = {};

/**
 * Subscribe to a value in a React component.
 * - If the subscription hasn't loaded for the first time yet this will throw a promise (to be caught by a `<Suspense>` above it).
 * - The dependencies MUST uniquely identify this async value! This is very important or you may get wrong values.
 *
 * @param subscriptor Function that creates a subscription and returns an unsubscribe callback.
 * @param deps Value the promise relies on like `useEffect()` and `useMemo()` etc. Deps are passed as the arguments to `subscriber()` if it's a function.
 *
 * @returns `State` instance for the current value of the subscription.
 * - `state.value` of the state allows you to read the data.
 * - If the data hasn't loaded yet, reading `state.value` will throw a `Promise` which can be caught by a `<Suspense />` element.
 *   - `state.loading` can tell you if the data is still loading before you read `state.value`
 * - If the data results in an error, reading `state.value` will throw that error.
 *   - `state.reason` can tell you if the state has an error before you read `state.value`
 */
export function useSubscribe<T, D extends Arguments>(subscriptor: Subscriptor<T, D>, deps: D): Source<T> {
	const key = `${serialise(subscriptor)}:${serialise(deps)}`;
	const source: Source<T> = (sources[key] ||= new Source<T>({ subscriptor: s => subscriptor(s, ...deps) }));
	if (source.closed) setTimeout(() => source === sources[key] && delete sources[key], 3000);
	source.startSubscription();
	useState(source);
	return source;
}
