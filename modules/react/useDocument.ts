import { useState } from "react";
import { DatabaseDocument, CacheProvider, Result, throwAsync, NOERROR, findSourceProvider, NOVALUE, Data, Unsubscriber, Handler, callAsync, getDocumentData, DocumentData, isAsync } from "../index.js";
import { usePureEffect } from "./usePureEffect.js";
import { useLazy } from "./useLazy.js";
import { usePureState } from "./usePureState.js";

/**
 * Use the cached result of a document in a React component (or a `Promise` to indicate the result is still loading).
 * - Requires database to use `CacheProvider` and will error if this does not exist.
 *
 * @param ref Document reference or `undefined`.
 * - If `undefined` is set this function will always return `undefined` (this simplifies scenarios where no document is needed, as hooks must always be called in the same order).
 * @param maxAge How 'out of date' data is allowed to be before it'll be refetched.
 * - If `maxAge` is true, a realtime subscription to the data will be created for the lifetime of the component.
 *
 * @returns The result of the document (i.e. its data or `undefined` if it doesn't exist), or `Promise` that resolves when the result has loaded, or `undefined` if ref was set to `undefined`
 *
 * @trhows `Error` if a `CacheProvider` is not part of the database's provider chain.
 * @throws `Error` if there was a problem retrieving the result.
 */
export function useAsyncDocument<T extends Data>(ref: DatabaseDocument<T>, maxAge?: number | true): Result<T> | PromiseLike<Result<T>>;
export function useAsyncDocument<T extends Data>(ref: DatabaseDocument<T> | undefined, maxAge?: number | true): Result<T> | PromiseLike<Result<T>> | undefined;
export function useAsyncDocument<T extends Data>(ref: DatabaseDocument<T> | undefined, maxAge: number | true = 1000): Result<T> | PromiseLike<Result<T>> | undefined {
	// Create a memoed version of `ref`
	const memoRef = useLazy(ref, ref?.toString());

	// Create two states to hold the value and error.
	const [value, setNext] = usePureState(_getCachedResult, memoRef);
	const [error, setError] = useState<unknown>(NOERROR);

	// Register effect.
	usePureEffect(_subscribeEffect, memoRef, maxAge, setNext, setError);

	// Always return undefined if there's no ref.
	if (!ref) return undefined;

	// If there's an error throw it.
	if (error !== NOERROR) throw error;

	// If document is cached return the cached value.
	if (value !== NOVALUE) return value;

	// If `maxAge` is `true` open a subscription for 10 seconds.
	// Done before `ref.get()` because efficient providers (i.e. `BatchProvider`) will reuse the subscription's first result as its first get request.
	if (maxAge === true) setTimeout(ref.subscribe({ next: setNext, error: setError }), 10000);

	// Return a promise for the result.
	const result = ref.result;
	if (isAsync(result)) result.then(setNext, setError);
	return result;
}

/** Get the initial result for a reference from the cache. */
function _getCachedResult<T extends Data>(ref: DatabaseDocument<T> | undefined): Result<T> | typeof NOVALUE | undefined {
	if (!ref) return undefined;
	const provider = findSourceProvider(ref.db.provider, CacheProvider);
	return provider.isCached(ref) ? provider.cache.get(ref) : NOVALUE;
}

/** Effect that subscribes a component to the cache for a reference. */
function _subscribeEffect<T extends Data>(ref: DatabaseDocument<T> | undefined, maxAge: number | true, setNext: (result: Result<T>) => void, setError: Handler): Unsubscriber | void {
	if (ref) {
		const provider = findSourceProvider(ref.db.provider, CacheProvider);
		const stopCache = provider.cache.subscribe(ref, { next: setNext, error: setError });
		if (maxAge === true) {
			// If `maxAge` is true subscribe to the source for as long as this component is attached.
			const stopSource = ref.subscribe({ next: setNext, error: setError });
			return () => {
				stopCache();
				stopSource();
			};
		} else if (provider.getCachedAge(ref) > maxAge) {
			// If cache provider's cached document is older than maxAge then force refresh the data.
			try {
				const result = ref.result;
				if (isAsync(result)) result.then(setNext, setError);
				else setNext(result);
			} catch (e) {
				setError(e);
			}
		}
		return stopCache;
	}
}

/**
 * Use the cached data of a document in a React component.
 * - Requires database to use `CacheProvider` and will error if this does not exist.
 *
 * @param ref Document reference or `undefined`.
 * - If `undefined` is set this function will always return `undefined` (this simplifies scenarios where no document is needed, as hooks must always be called in the same order).
 * @param maxAge How 'out of date' data is allowed to be before it'll be refetched.
 * - If `maxAge` is true, a realtime subscription to the data will be created for the lifetime of the component.
 *
 * @returns The result of the document (i.e. its data or `undefined` if it doesn't exist).
 *
 * @throws `Promise` that resolves when the result has loaded.
 * @trhows `Error` if a `CacheProvider` is not part of the database's provider chain.
 * @throws `Error` if there was a problem retrieving the result.
 */
export function useDocument<T extends Data>(ref: DatabaseDocument<T>, maxAge?: number | true): Result<T>;
export function useDocument<T extends Data>(ref: DatabaseDocument<T> | undefined, maxAge?: number | true): Result<T> | undefined;
export function useDocument<T extends Data>(ref: DatabaseDocument<T> | undefined, maxAge?: number | true): Result<T> | undefined {
	return throwAsync(useAsyncDocument(ref, maxAge));
}

/** Use the data of a document or `undefined` if the query has no matching results (or a promise indicating the result is loading). */
export function useAsyncDocumentData<T extends Data>(ref: DatabaseDocument<T>, maxAge?: number | true): DocumentData<T> | PromiseLike<DocumentData<T>>;
export function useAsyncDocumentData<T extends Data>(ref: DatabaseDocument<T> | undefined, maxAge?: number | true): DocumentData<T> | PromiseLike<DocumentData<T>> | undefined;
export function useAsyncDocumentData<T extends Data>(ref: DatabaseDocument<T> | undefined, maxAge?: number | true): DocumentData<T> | PromiseLike<DocumentData<T>> | undefined {
	const result = useAsyncDocument(ref, maxAge);
	return ref && result !== undefined ? callAsync(getDocumentData, result, ref) : undefined;
}

/** Use the data of a document or `undefined` if the query has no matching results. */
export function useDocumentData<T extends Data>(ref: DatabaseDocument<T>, maxAge?: number | true): T;
export function useDocumentData<T extends Data>(ref: DatabaseDocument<T> | undefined, maxAge?: number | true): T | undefined;
export function useDocumentData<T extends Data>(ref: DatabaseDocument<T> | undefined, maxAge?: number | true): T | undefined {
	return throwAsync(useAsyncDocumentData(ref, maxAge));
}
