import { Arguments, AsyncFetcher, serialise, Source, Subscriptor } from "..";
import { LOADING } from "../constants";
import { useSubscribe } from "./useSubscribe";

/**
 * Use the value of a global source in a React component.
 *
 * @param fetcher Plain value or fetch function that returns a plain value or async/promised value.
 * @param deps Value the async value relies on like `useEffect()` and `useMemo()` etc. Deps are passed as the arguments to `fetch()` if it's a function.
 * @param maxAge How 'out of date' data is allowed to be before it'll be refetched.
 *
 * @throws `Promise` when loading, which should be caught with a `<Suspense>` block higher up.
 */
export function useSource<T, D extends Arguments>(fetcher: AsyncFetcher<T, D>, deps: D, maxAge?: number): T {
	const source = Source.get<T>(`${serialise(fetcher)}:${serialise(deps)}`, LOADING);
	useSubscribe(source);
	source.fetchFrom(fetcher, deps, maxAge);
	return source.value;
}

/**
 * Use the data of a source in a React component.
 *
 * @param fetcher Plain value or fetch function that returns a plain value or async/promised value.
 * @param deps Value the async value relies on like `useEffect()` and `useMemo()` etc. Deps are passed as the arguments to `fetch()` if it's a function.
 * @param maxAge How 'out of date' data is allowed to be before it'll be refetched.
 *
 * @throws `Promise` when loading, which should be caught with a `<Suspense>` block higher up.
 * @throws `RequiredError` when document does not exist.
 */
export function useSourceData<T, D extends Arguments>(fetcher: AsyncFetcher<T, D>, deps: D, maxAge?: number): Exclude<T, undefined> {
	const source = Source.get<T>(`${serialise(fetcher)}:${serialise(deps)}`, LOADING);
	useSubscribe(source);
	source.fetchFrom(fetcher, deps, maxAge);
	return source.data;
}

/**
 * Use a source subscription in a React component.
 * - If the subscription hasn't loaded for the first time yet this will throw a promise (to be caught by a `<Suspense>` above it).
 * - The dependencies MUST uniquely identify this async value! This is very important or you may get wrong values.
 *
 * @param subscriptor Function that creates a subscription and returns an unsubscribe callback.
 * @param deps Value the promise relies on like `useEffect()` and `useMemo()` etc. Deps are passed as the arguments to `subscriber()` if it's a function.
 *
 * @throws `Promise` when loading, which should be caught with a `<Suspense>` block higher up.
 */
export const useSourceSubscribe = <T, D extends Arguments>(subscriptor: Subscriptor<T, D>, deps: D): T => {
	const source = Source.get<T>(`${serialise(subscriptor)}:${serialise(deps)}`, LOADING);
	useSubscribe(source.active); // Use `source.active` not `source` directly to indicate we need an active subscription.
	source.subscribeTo(subscriptor, deps);
	return source.value;
};
