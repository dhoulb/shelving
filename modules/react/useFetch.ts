import { Arguments, AsyncFetcher, serialise, State } from "..";
import { LOADING } from "../constants";
import { useState } from "./useState";
import { Source, Sources } from "./Source";

/** Store a list of named cached `Source` instances. */
const sources = new Sources();

/**
 * Fetch a value in a React component.
 *
 * @param fetcher Plain value or fetch function that returns a plain value or async/promised value.
 * @param deps Value the async value relies on like `useEffect()` and `useMemo()` etc. Deps are passed as the arguments to `fetch()` if it's a function.
 * @param maxAge How 'out of date' data is allowed to be before it'll be refetched.
 *
 * @returns `State` instance for the results of the fetch.
 * - `state.value` of the state allows you to read the data.
 * - If the data hasn't loaded yet, reading `state.value` will throw a `Promise` which can be caught by a `<Suspense />` element.
 *   - `state.loading` can tell you if the data is still loading before you read `state.value`
 * - If the data results in an error, reading `state.value` will throw that error.
 *   - `state.reason` can tell you if the state has an error before you read `state.value`
 */
export function useFetch<T, D extends Arguments>(fetcher: AsyncFetcher<T, D>, deps: D, maxAge = 60000): State<T> {
	const key = `${serialise(fetcher)}:${serialise(deps)}`;
	const source: Source<T> = sources.get<T>(key, LOADING);
	source.fetchFrom(fetcher, deps, maxAge);
	return useState(source);
}
