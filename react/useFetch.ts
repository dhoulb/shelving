import { Dependencies, isObject, ReadonlyObject, fingerprint } from "shelving/tools";
import { RequiredError } from "shelving/errors";
import { SourceFetcher, useSource } from "./useSource";

/**
 * Use an async/promised value in a React component.
 * - If the value hasn't loaded yet this will throw a `Promise` (to be caught by a `<Suspense>` above it).
 * - The dependencies MUST uniquely identify this async value! This is very important or you may get wrong values.
 *
 * @param fetch Plain value or fetch function that returns a plain value or async/promised value.
 * @param deps Value the async value relies on like `useEffect()` and `useMemo()` etc. Deps are passed as the arguments to `fetch()` if it's a function.
 * @param maxAgeSeconds How 'out of date' data is allowed to be before it'll be refetched.
 */
export const useFetch = <T, D extends Dependencies>(fetch: SourceFetcher<T, D>, deps: D, maxAgeSeconds?: number): T => {
	const source = useSource<T>(`${fingerprint(fetch)}: ${fingerprint(deps)}`);
	source.fetch(fetch, deps, maxAgeSeconds);
	const { value, error } = source.value;
	if (error) throw error;
	return value;
};

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
export const useFetchData = <T, D extends Dependencies>(fetch: SourceFetcher<T, D>, deps: D, maxAgeSeconds?: number): T & ReadonlyObject => {
	const result = useFetch<T, D>(fetch, deps, maxAgeSeconds);
	if (!isObject(result)) throw new RequiredError("useFetchData(): Fetched data was null or undefined");
	return result;
};
