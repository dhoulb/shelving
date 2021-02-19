import { Dependencies, AsyncFetcher, fingerprint, ImmutableObject, isObject, RequiredError } from "..";
import { getCachedSource } from "./cache";
import { useState } from "./useState";

/**
 * Use an async/promised value in a React component.
 * - If the value hasn't loaded yet this will throw a promise (to be caught by a `<Suspense>` above it).
 * - The dependencies MUST uniquely identify this async value! This is very important or you may get wrong values.
 *
 * @param fetcher Plain value or fetch function that returns a plain value or async/promised value.
 * @param deps Value the async value relies on like `useEffect()` and `useMemo()` etc. Deps are passed as the arguments to `fetch()` if it's a function.
 * @param maxAge How 'out of date' data is allowed to be before it'll be refetched.
 */
export function useFetch<T, D extends Dependencies>(fetcher: AsyncFetcher<T, D>, deps: D, maxAge?: number): T {
	const source = getCachedSource<T>(`${fingerprint(fetcher)}:${fingerprint(deps)}`);
	void useState(source);
	source.fetchFrom(fetcher, deps, maxAge);
	return source.value;
}

/**
 * Use the data of an async/promised value in a React component.
 *
 * @param fetcher Plain value or fetch function that returns a plain value or async/promised value.
 * @param deps Value the async value relies on like `useEffect()` and `useMemo()` etc. Deps are passed as the arguments to `fetch()` if it's a function.
 * @param maxAge How 'out of date' data is allowed to be before it'll be refetched.
 *
 * @throws `Promise` when loading, which should be caught with a `<Suspense>` block higher up.
 * @throws `RequiredError` when document does not exist.
 * @throws Unknown error when something goes wrong.
 */
export function useFetchData<T, D extends Dependencies>(fetcher: AsyncFetcher<T, D>, deps: D, maxAge?: number): T & ImmutableObject {
	const result = useFetch<T, D>(fetcher, deps, maxAge);
	if (!isObject(result)) throw new RequiredError("useFetchData(): Fetched data was null or undefined");
	return result;
}
