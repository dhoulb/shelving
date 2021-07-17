import { Arguments, AsyncFetcher, serialise, State, LOADING, removeEntry } from "..";
import { useState } from "./useState";

/** Store a list of named cached `State` instances. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const sources: { [key: string]: State<any> } = {};

/**
 * Fetch a value in a React component.
 *
 * @param fetcher Plain value or fetch function that returns a plain value or async/promised value.
 * @param deps Value the async value relies on like `useEffect()` and `useMemo()` etc. Deps are passed as the arguments to `fetch()` if it's a function.
 * @param maxAgeMs How 'out of date' data is allowed to be before it'll be refetched.
 *
 * @returns `State` instance for the results of the fetch.
 * - `state.value` of the state allows you to read the data.
 * - If the data hasn't loaded yet, reading `state.value` will throw a `Promise` which can be caught by a `<Suspense />` element.
 *   - `state.loading` can tell you if the data is still loading before you read `state.value`
 * - If the data results in an error, reading `state.value` will throw that error.
 *   - `state.reason` can tell you if the state has an error before you read `state.value`
 */
export function useFetch<T, D extends Arguments>(fetcher: AsyncFetcher<T, D>, deps: D, maxAge = 86400000): State<T> {
	const key = `${serialise(fetcher)}:${serialise(deps)}`;
	const state: State<T> = (sources[key] ||= new State<T>(LOADING));

	// Clean up source in a few seconds if it's closed.
	if (state.closed) setTimeout(() => removeEntry(sources, key, state), 3000);
	// Fetch if no value is pending and source's ages is less than `maxAge`
	else if (!state.pending || state.age < maxAge) state.next(fetcher(...deps));

	useState(state);
	return state;
}
