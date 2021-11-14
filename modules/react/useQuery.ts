import { useState } from "react";
import { Data, DatabaseQuery, CacheProvider, Results, Dispatcher, throwAsync, NOERROR, findSourceProvider, NOVALUE, dispatch, Unsubscriber } from "../index.js";
import { usePureEffect } from "./usePureEffect.js";
import { usePureMemo } from "./usePureMemo.js";
import { usePureState } from "./usePureState.js";

/**
 * Use the cached results of a set of documents in a React component.
 * - Requires database to use `CacheProvider` and will error if this does not exist.
 *
 * @param ref Documents reference or `undefined`.
 * - If `undefined` is set this function will always return `undefined` (this simplifies scenarios where no document is needed, as hooks must always be called in the same order).
 * @param maxAge How 'out of date' data is allowed to be before it'll be refetched.
 * - If `maxAge` is true, a realtime subscription to the data will be created for the lifetime of the component.
 *
 * @returns The results for the set of documents, or `undefined` if ref was set to `undefined`
 *
 * @throws `Promise` if document results have not been cached yet (handle this with a React `<Suspense>` element).
 * @trhows `Error` if a `CacheProvider` is not part of the database's provider chain.
 * @throws `Error` if there was a problem retrieving the results.
 */
export function useQuery<T extends Data>(ref: DatabaseQuery<T>, maxAge?: number | true): Results<T>;
export function useQuery<T extends Data>(ref: DatabaseQuery<T> | undefined, maxAge?: number | true): Results<T> | undefined;
export function useQuery<T extends Data>(ref: DatabaseQuery<T> | undefined, maxAge?: number | true): Results<T> | undefined {
	return throwAsync(useAsyncQuery(ref, maxAge));
}

/**
 * Use the cached result of a document in a React component (or a `Promise` to indicate the result is still loading).
 * - Requires database to use `CacheProvider` and will error if this does not exist.
 *
 * @param ref Documents reference or `undefined`.
 * - If `undefined` is set this function will always return `undefined` (this simplifies scenarios where no document is needed, as hooks must always be called in the same order).
 * @param maxAge How 'out of date' data is allowed to be before it'll be refetched.
 * - If `maxAge` is true, a realtime subscription to the data will be created for the lifetime of the component.
 *
 * @returns The results for the set of documents, or `Promise` that resolves when the result has loaded, or `undefined` if ref was set to `undefined`
 *
 * @trhows `Error` if a `CacheProvider` is not part of the database's provider chain.
 * @throws `Error` if there was a problem retrieving the results.
 */
export function useAsyncQuery<T extends Data>(ref: DatabaseQuery<T>, maxAge?: number | true): Results<T> | Promise<Results<T>>;
export function useAsyncQuery<T extends Data>(ref: DatabaseQuery<T> | undefined, maxAge?: number | true): Results<T> | Promise<Results<T>> | undefined;
export function useAsyncQuery<T extends Data>(ref: DatabaseQuery<T> | undefined, maxAge: number | true = 1000): Results<T> | Promise<Results<T>> | undefined {
	// Create a memoed version of `ref`
	const memoRef = usePureMemo(ref, ref?.toString());

	// Create two states to hold the value and error.
	const [value, setNext] = usePureState(getCachedResults, memoRef);
	const [error, setError] = useState<unknown>(NOERROR);
	if (error !== NOERROR) throw error; // If there's an error throw it.

	// Register effects.
	usePureEffect(subscribeEffect, memoRef, maxAge, setNext, setError);

	// Always return undefined if there's no ref.
	if (!ref) return undefined;

	// If document is cached return the cached value.
	if (value !== NOVALUE) return value;

	// If `maxAge` is `true` open a subscription for 10 seconds.
	// Done before `ref.get()` because efficient providers (i.e. `BatchProvider`) will reuse the subscription's first result as its first get request.
	if (maxAge === true) setTimeout(ref.subscribe(setNext, setError), 10000);

	// Return a promise for the result.
	const result = ref.get();
	dispatch(setNext, result, setError);
	return result;
}

/** Get the initial results for a reference from the cache. */
const getCachedResults = <T extends Data>(ref: DatabaseQuery<T> | undefined): Results<T> | typeof NOVALUE | undefined => {
	if (!ref) return undefined;
	const provider = findSourceProvider(ref.provider, CacheProvider);
	provider.isCached(ref) ? provider.cache.getQuery(ref) : NOVALUE;
};

/** Effect that subscribes a component to the cache for a reference. */
const subscribeEffect = <T extends Data>(
	ref: DatabaseQuery<T> | undefined,
	maxAge: number | true,
	next: Dispatcher<Results<T>>,
	error: Dispatcher<unknown>,
): Unsubscriber | void => {
	if (ref) {
		const provider = findSourceProvider(ref.provider, CacheProvider);
		const stopCache = provider.cache.subscribeQuery(ref, { next, error });
		if (maxAge === true) {
			// If `maxAge` is true subscribe to the source for as long as this component is attached.
			const stopSource = ref.subscribe({ next, error });
			return () => {
				stopCache();
				stopSource();
			};
		} else {
			// If cache provider's cached document is older than maxAge then force refresh the data.
			if (provider.getCachedAge(ref) > maxAge) dispatch(next, ref.get(), error);
		}
		return stopCache;
	}
};
