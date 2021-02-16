import { Dependencies, isObject, ImmutableObject, fingerprint, RequiredError, Fetcher } from "..";
import { getSource } from "../source";
import { useState } from "./useState";

/**
 * Use an async/promised value in a React component.
 * - If the value hasn't loaded yet this will throw a promise (to be caught by a `<Suspense>` above it).
 * - The dependencies MUST uniquely identify this async value! This is very important or you may get wrong values.
 *
 * @param fetch Plain value or fetch function that returns a plain value or async/promised value.
 * @param deps Value the async value relies on like `useEffect()` and `useMemo()` etc. Deps are passed as the arguments to `fetch()` if it's a function.
 * @param maxAgeSeconds How 'out of date' data is allowed to be before it'll be refetched.
 */
export function useFetch<T, D extends Dependencies>(fetch: (...deps: D) => T | Promise<T>, deps: D, maxAgeSeconds?: number): T;
export function useFetch<T, D extends Dependencies>(fetch: T | Promise<T>, deps: D, maxAgeSeconds?: number): T;
export function useFetch<T, D extends Dependencies>(fetch: Fetcher<T, D>, deps: D, maxAgeSeconds?: number): T;
export function useFetch<T, D extends Dependencies>(fetch: Fetcher<T, D>, deps: D, maxAgeSeconds?: number): T {
	const source = getSource<T>(`${fingerprint(fetch)}: ${fingerprint(deps)}`);
	void useState(source);
	source.fetchFrom(fetch, deps, maxAgeSeconds);
	return source.value;
}

/**
 * Use the data of an async/promised value in a React component.
 *
 * @param fetch Plain value or fetch function that returns a plain value or async/promised value.
 * @param deps Value the async value relies on like `useEffect()` and `useMemo()` etc. Deps are passed as the arguments to `fetch()` if it's a function.
 * @param maxAgeSeconds How 'out of date' data is allowed to be before it'll be refetched.
 *
 * @throws `Promise` when loading, which should be caught with a `<Suspense>` block higher up.
 * @throws `RequiredError` when document does not exist.
 * @throws Unknown error when something goes wrong.
 */
export function useFetchData<T, D extends Dependencies>(fetch: (...deps: D) => T | Promise<T>, deps: D, maxAgeSeconds?: number): T & ImmutableObject;
export function useFetchData<T, D extends Dependencies>(fetch: T, deps: D, maxAgeSeconds?: number): T & ImmutableObject;
export function useFetchData<T, D extends Dependencies>(fetch: Fetcher<T, D>, deps: D, maxAgeSeconds?: number): T & ImmutableObject;
export function useFetchData<T, D extends Dependencies>(fetch: Fetcher<T, D>, deps: D, maxAgeSeconds?: number): T & ImmutableObject {
	const result = useFetch<T, D>(fetch, deps, maxAgeSeconds);
	if (!isObject(result)) throw new RequiredError("useFetchData(): Fetched data was null or undefined");
	return result;
}
