import { useState } from "react";
import { Data, Documents, CacheProvider, Results, Dispatcher, throwAsync, Catcher, NOERROR, isAsync, findSourceProvider, NOVALUE } from "../index.js";
import { usePureEffect } from "./usePureEffect.js";
import { usePureMemo } from "./usePureMemo.js";
import { usePureState } from "./usePureState.js";

/**
 * Use the cached results of a set of documents in a React component.
 * - Requires database to use `CacheProvider` and will error if this does not exist.
 *
 * @param ref Documents reference.
 * @param maxAge How 'out of date' data is allowed to be before it'll be refetched.
 * - If `maxAge` is true, a realtime subscription to the data will be created for the lifetime of the component.
 *
 * @returns The results for the set of documents.
 *
 * @throws `Promise` if document results have not been cached yet (handle this with a React `<Suspense>` element).
 * @trhows `Error` if a `CacheProvider` is not part of the database's provider chain.
 * @throws `Error` if there was a problem retrieving the results.
 */
export function useDocuments<T extends Data>(ref: Documents<T>, maxAge?: number | true): Results<T> {
	return throwAsync(useAsyncDocuments(ref, maxAge));
}

/**
 * Use the cached result of a document in a React component.
 * - Like `useDocument()` but return `Promise` (rather than throwing `Promise`) if the document result has not been cached yet.
 */
export function useAsyncDocuments<T extends Data>(ref: Documents<T>, maxAge: number | true = 1000): Results<T> | Promise<Results<T>> {
	// Find the cache provider.
	const provider = findSourceProvider(ref.db.provider, CacheProvider);

	// Create a memoed version of `ref`
	const memoRef = usePureMemo(ref, ref.toString());

	// Create two states to hold the value and error.
	const [value, setNext] = usePureState(getCachedResults, memoRef, provider);
	const [error, setError] = useState<unknown | typeof NOERROR>(NOERROR);
	if (error !== NOERROR) throw error; // If there's an error throw it.

	// Register effects.
	usePureEffect(subscribeEffect, memoRef, provider, setNext, setError);
	usePureEffect(refreshEffect, memoRef, provider, maxAge, setNext, setError);

	// If document is cached return the cached value.
	if (value !== NOVALUE) return value;

	// If `maxAge` is `true` open a subscription for 10 seconds.
	// Done before `ref.get()` because efficient providers (i.e. `BatchProvider`) will reuse the subscription's first result as its first get request.
	if (maxAge === true) setTimeout(ref.subscribe(setNext, setError), 10000);

	// Return a promise for the result.
	const result = ref.get();
	if (isAsync(result)) result.then(setNext, setError);
	else setNext(result);
	return result;
}

/** Get the initial results for a reference from the cache. */
const getCachedResults = <T extends Data>(ref: Documents<T>, provider: CacheProvider) => (provider.isCached(ref) ? provider.cache.getDocuments(ref) : NOVALUE);

/** Effect that subscribes a component to the cache for a reference. */
const subscribeEffect = <T extends Data>(ref: Documents<T>, provider: CacheProvider, next: Dispatcher<Results<T>>, error: Catcher) =>
	provider.cache.onDocuments(ref, { next, error });

/** Effect that possibly refreshes data (based on `maxAge`) or starts a realtime subscription when the component is attached. */
const refreshEffect = <T extends Data>(ref: Documents<T>, provider: CacheProvider, maxAge: number | true, next: Dispatcher<Results<T>>, error: Catcher) => {
	if (maxAge === true) {
		// If `maxAge` is true subscribe to the source for as long as this component is attached.
		return provider.onDocuments(ref, { next, error });
	} else {
		// If cache provider's cached document is older than maxAge then force refresh the data.
		if (provider.getCachedAge(ref) > maxAge) provider.getDocuments(ref).then(next, error);
	}
};
