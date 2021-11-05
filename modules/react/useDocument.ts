import { useState } from "react";
import {
	Data,
	Document,
	CacheProvider,
	Result,
	Dispatcher,
	throwAsync,
	Catcher,
	NOERROR,
	isAsync,
	findSourceProvider,
	NOVALUE,
	getRequired,
} from "../index.js";
import { usePureEffect } from "./usePureEffect.js";
import { usePureMemo } from "./usePureMemo.js";
import { usePureState } from "./usePureState.js";

/**
 * Use the cached result of a document in a React component (or a `Promise` to indicate the result is still loading).
 * - Requires database to use `CacheProvider` and will error if this does not exist.
 *
 * @param ref Document reference.
 * @param maxAge How 'out of date' data is allowed to be before it'll be refetched.
 * - If `maxAge` is true, a realtime subscription to the data will be created for the lifetime of the component.
 *
 * @returns The result of the document (i.e. its data or `undefined` if it doesn't exist), or `Promise` that resolves when the result has loaded.
 *
 * @trhows `Error` if a `CacheProvider` is not part of the database's provider chain.
 * @throws `Error` if there was a problem retrieving the result.
 */
export function useAsyncDocument<T extends Data>(ref: Document<T>, maxAge: number | true = 1000): Result<T> | Promise<Result<T>> {
	// Find the cache provider.
	const provider = findSourceProvider(ref.db.provider, CacheProvider);

	// Create a memoed version of `ref`
	const memoRef = usePureMemo(ref, ref.toString());

	// Create two states to hold the value and error.
	const [value, setNext] = usePureState(getCachedResult, memoRef, provider);
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

/**
 * Use the cached data of a document in a React component.
 * - Requires database to use `CacheProvider` and will error if this does not exist.
 *
 * @param ref Document reference.
 * @param maxAge How 'out of date' data is allowed to be before it'll be refetched.
 * - If `maxAge` is true, a realtime subscription to the data will be created for the lifetime of the component.
 *
 * @returns The result of the document (i.e. its data or `undefined` if it doesn't exist).
 *
 * @throws `Promise` that resolves when the result has loaded.
 * @trhows `Error` if a `CacheProvider` is not part of the database's provider chain.
 * @throws `Error` if there was a problem retrieving the result.
 */
export function useDocument<T extends Data>(ref: Document<T>, maxAge?: number | true): Result<T> {
	return throwAsync(useAsyncDocument(ref, maxAge));
}

/**
 * Use the cached data of a document in a React component (or a `Promise` to indicate the data is still loading).
 * - Requires database to use `CacheProvider` and will error if this does not exist.
 *
 * @param ref Document reference.
 * @param maxAge How 'out of date' data is allowed to be before it'll be refetched.
 * - If `maxAge` is true, a realtime subscription to the data will be created for the lifetime of the component.
 *
 * @returns The data of the document, or `Promise` that resolves when the data has loaded.
 *
 * @throws `RequiredError` if the document does not exist.
 * @trhows `Error` if a `CacheProvider` is not part of the database's provider chain.
 * @throws `Error` if there was a problem retrieving the data.
 */
export function useAsyncDocumentData<T extends Data>(ref: Document<T>, maxAge?: number | true): T | Promise<T> {
	const result = useAsyncDocument(ref, maxAge);
	return isAsync(result) ? result.then(getRequired) : getRequired(result);
}

/**
 * Use the cached data of a document in a React component.
 * - Requires database to use `CacheProvider` and will error if this does not exist.
 *
 * @param ref Document reference.
 * @param maxAge How 'out of date' data is allowed to be before it'll be refetched.
 * - If `maxAge` is true, a realtime subscription to the data will be created for the lifetime of the component.
 *
 * @returns The data of the document.
 *
 * @throws `Promise` that resolves when the data has loaded.
 * @throws `RequiredError` if the document does not exist.
 * @trhows `Error` if a `CacheProvider` is not part of the database's provider chain.
 * @throws `Error` if there was a problem retrieving the data.
 */
export function useDocumentData<T extends Data>(ref: Document<T>, maxAge?: number | true): T {
	return getRequired(useDocument(ref, maxAge));
}

/** Get the initial result for a reference from the cache. */
const getCachedResult = <T extends Data>(ref: Document<T>, provider: CacheProvider) => (provider.isCached(ref) ? provider.cache.getDocument(ref) : NOVALUE);

/** Effect that subscribes a component to the cache for a reference. */
const subscribeEffect = <T extends Data>(ref: Document<T>, provider: CacheProvider, next: Dispatcher<Result<T>>, error: Catcher) =>
	provider.cache.onDocument(ref, { next, error });

/** Effect that possibly refreshes data (based on `maxAge`) or starts a realtime subscription when the component is attached. */
const refreshEffect = <T extends Data>(ref: Document<T>, provider: CacheProvider, maxAge: number | true, next: Dispatcher<Result<T>>, error: Catcher) => {
	if (maxAge === true) {
		// If `maxAge` is true subscribe to the source for as long as this component is attached.
		return provider.onDocument(ref, { next, error });
	} else {
		// If cache provider's cached document is older than maxAge then force refresh the data.
		if (provider.getCachedAge(ref) > maxAge) provider.getDocument(ref).then(next, error);
	}
};
