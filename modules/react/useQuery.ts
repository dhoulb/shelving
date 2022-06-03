import { useState } from "react";
import type { QueryReference } from "../db/Reference.js";
import type { Data, Entity, Result } from "../util/data.js";
import type { Handler } from "../util/error.js";
import { getArray, ImmutableArray } from "../util/array.js";
import { NOERROR, NOVALUE } from "../util/constants.js";
import { CacheProvider } from "../provider/CacheProvider.js";
import { findSourceProvider } from "../provider/ThroughProvider.js";
import { callAsync, isAsync, throwAsync } from "../util/async.js";
import { ArrayObserver, Unsubscriber } from "../util/observe.js";
import { getQueryData, getQueryResult } from "../db/util.js";
import { useCompare } from "./useCompare.js";
import { usePureState } from "./usePureState.js";
import { usePureEffect } from "./usePureEffect.js";

/**
 * Use the cached result of a document in a React component (or a `Promise` to indicate the result is still loading).
 * - Requires database to use `CacheProvider` and will error if this does not exist.
 *
 * @param ref Documents reference or `undefined`.
 * - If `undefined` is set this function will always return `undefined` (this simplifies scenarios where no document is needed, as hooks must always be called in the same order).
 * @param maxAge How 'out of date' data is allowed to be before it'll be refetched.
 * - If `maxAge` is true, a realtime subscription to the data will be created for the lifetime of the component.
 *
 * @returns The results for the set of documents as a map, or promise that resolves when the result has loaded, or `undefined` if ref was set to `undefined`
 * - Always uses returns results as a map because the same results might be used for several renders.
 *
 * @trhows `Error` if a `CacheProvider` is not part of the database's provider chain.
 * @throws `Error` if there was a problem retrieving the results.
 */
export function useAsyncQuery<T extends Data>(ref: QueryReference<T>, maxAge?: number | true): ImmutableArray<Entity<T>> | PromiseLike<ImmutableArray<Entity<T>>>;
export function useAsyncQuery<T extends Data>(ref: QueryReference<T> | undefined, maxAge?: number | true): ImmutableArray<Entity<T>> | PromiseLike<ImmutableArray<Entity<T>>> | undefined;
export function useAsyncQuery<T extends Data>(ref: QueryReference<T> | undefined, maxAge: number | true = 1000): ImmutableArray<Entity<T>> | PromiseLike<ImmutableArray<Entity<T>>> | undefined {
	// Create a memoed version of `ref`
	const memoRef = useCompare(_isSameReference, ref);

	// Create two states to hold the value and error.
	const [value, setNext] = usePureState(_getCachedResults, memoRef);
	const [error, setError] = useState<unknown>(NOERROR);
	if (error !== NOERROR) throw error; // If there's an error throw it.

	// Register effects.
	usePureEffect(_subscribeEffect, memoRef, maxAge, setNext, setError);

	// Always return undefined if there's no ref.
	if (!ref) return undefined;

	// If document is cached return the cached value.
	if (value !== NOVALUE) return value;

	// If `maxAge` is `true` open a subscription for 10 seconds.
	// Done before `ref.get()` because efficient providers (i.e. `BatchProvider`) will reuse the subscription's first result as its first get request.
	if (maxAge === true) setTimeout(ref.subscribe({ next: setNext, error: setError }), 10000);

	// Return a promise for the result.
	const results = ref.array;
	if (isAsync(results)) results.then(setNext, setError);
	return results;
}

/** Do two database query references point to the same query? */
const _isSameReference = <T extends Data>(left: QueryReference<T> | undefined, right: QueryReference<T> | undefined) => left === right || left?.toString() === right?.toString();

/** Get the initial results for a reference from the cache. */
function _getCachedResults<T extends Data>(ref: QueryReference<T> | undefined): ImmutableArray<Entity<T>> | typeof NOVALUE | undefined {
	if (!ref) return undefined;
	const provider = findSourceProvider(ref.db.provider, CacheProvider);
	return provider.isCached(ref) ? getArray(provider.cache.getQuery(ref)) : NOVALUE;
}

/** Effect that subscribes a component to the cache for a reference. */
function _subscribeEffect<T extends Data>(ref: QueryReference<T> | undefined, maxAge: number | true, setNext: (results: ImmutableArray<Entity<T>>) => void, setError: Handler): Unsubscriber | void {
	if (ref) {
		const observer = new ArrayObserver({ next: setNext, error: setError });
		const provider = findSourceProvider(ref.db.provider, CacheProvider);
		const stopCache = provider.cache.subscribeQuery(ref, observer);
		if (maxAge === true) {
			// If `maxAge` is true subscribe to the source for as long as this component is attached.
			const stopSource = ref.db.provider.subscribeQuery(ref, observer);
			return () => {
				stopCache();
				stopSource();
			};
		} else if (provider.getCachedAge(ref) > maxAge) {
			// If cache provider's cached document is older than maxAge then force refresh the data.
			Promise.resolve(ref.array).then(setNext, setError);
			try {
				const results = ref.array;
				if (isAsync(results)) results.then(setNext, setError);
				else setNext(results);
			} catch (e) {
				setError(e);
			}
		}
		return stopCache;
	}
}

/**
 * Use the cached results of a set of documents in a React component.
 * - Requires database to use `CacheProvider` and will error if this does not exist.
 *
 * @param ref Documents reference or `undefined`.
 * - If `undefined` is set this function will always return `undefined` (this simplifies scenarios where no document is needed, as hooks must always be called in the same order).
 * @param maxAge How 'out of date' data is allowed to be before it'll be refetched.
 * - If `maxAge` is true, a realtime subscription to the data will be created for the lifetime of the component.
 *
 * @returns The results for the set of documents.
 *
 * @throws `Promise` if document results have not been cached yet (handle this with a React `<Suspense>` element).
 * @trhows `Error` if a `CacheProvider` is not part of the database's provider chain.
 * @throws `Error` if there was a problem retrieving the results.
 */
export function useQuery<T extends Data>(ref: QueryReference<T>, maxAge?: number | true): ImmutableArray<Entity<T>>;
export function useQuery<T extends Data>(ref: QueryReference<T> | undefined, maxAge?: number | true): ImmutableArray<Entity<T>> | undefined;
export function useQuery<T extends Data>(ref: QueryReference<T> | undefined, maxAge?: number | true): ImmutableArray<Entity<T>> | undefined {
	return throwAsync(useAsyncQuery(ref, maxAge));
}

/** Use the first result of a query or `undefined` if the query has no matching results (or a promise indicating the result is loading). */
export function useAsyncQueryResult<T extends Data>(ref: QueryReference<T>, maxAge?: number | true): Result<Entity<T>> | PromiseLike<Result<Entity<T>>>;
export function useAsyncQueryResult<T extends Data>(ref: QueryReference<T> | undefined, maxAge?: number | true): Result<Entity<T>> | PromiseLike<Result<Entity<T>>> | undefined;
export function useAsyncQueryResult<T extends Data>(ref: QueryReference<T> | undefined, maxAge?: number | true): Result<Entity<T>> | PromiseLike<Result<Entity<T>>> | undefined {
	const results = useAsyncQuery(ref ? ref.max(1) : undefined, maxAge);
	return ref && results ? callAsync(getQueryResult, results) : undefined;
}

/** Use the first result of a query or `undefined` if the query has no matching results */
export function useQueryResult<T extends Data>(ref: QueryReference<T>, maxAge?: number | true): Result<Entity<T>>;
export function useQueryResult<T extends Data>(ref: QueryReference<T> | undefined, maxAge?: number | true): Result<Entity<T>> | undefined;
export function useQueryResult<T extends Data>(ref: QueryReference<T> | undefined, maxAge?: number | true): Result<Entity<T>> | undefined {
	return throwAsync(useAsyncQueryResult(ref, maxAge));
}

/** Use the first result of a query (or a promise indicating the result is loading). */
export function useAsyncQueryData<T extends Data>(ref: QueryReference<T>, maxAge?: number | true): Entity<T> | PromiseLike<Entity<T>>;
export function useAsyncQueryData<T extends Data>(ref: QueryReference<T> | undefined, maxAge?: number | true): Entity<T> | PromiseLike<Entity<T>> | undefined;
export function useAsyncQueryData<T extends Data>(ref: QueryReference<T> | undefined, maxAge?: number | true): Entity<T> | PromiseLike<Entity<T>> | undefined {
	const results = useAsyncQuery(ref ? ref.max(1) : undefined, maxAge);
	return ref && results ? callAsync(getQueryData, results, ref) : undefined;
}

/** Use the first result of a query. */
export function useQueryData<T extends Data>(ref: QueryReference<T>, maxAge?: number | true): Entity<T>;
export function useQueryData<T extends Data>(ref: QueryReference<T> | undefined, maxAge?: number | true): Entity<T> | undefined;
export function useQueryData<T extends Data>(ref: QueryReference<T> | undefined, maxAge?: number | true): Entity<T> | undefined {
	return throwAsync(useAsyncQueryData(ref, maxAge));
}
