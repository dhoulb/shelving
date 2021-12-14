import { DataQuery, Data, callAsync, getQueryFirst, Entry, throwAsync } from "../index.js";
import { useAsyncQuery } from "./useQuery.js";

/**
 * Use the cached data of a document in a React component (or a `Promise` to indicate the data is still loading).
 * - Requires database to use `CacheProvider` and will error if this does not exist.
 *
 * @param ref Query reference or `undefined`.
 * - If `undefined` is set this function will always return `undefined` (this simplifies scenarios where no document is needed, as hooks must always be called in the same order).
 * @param maxAge How 'out of date' data is allowed to be before it'll be refetched.
 * - If `maxAge` is true, a realtime subscription to the data will be created for the lifetime of the component.
 *
 * @returns The data of the document, or `Promise` that resolves when the data has loaded.
 *
 * @throws `RequiredError` if the query had no results.
 * @trhows `Error` if a `CacheProvider` is not part of the database's provider chain.
 * @throws `Error` if there was a problem retrieving the data.
 */
export function useAsyncQueryFirst<T extends Data>(ref: DataQuery<T>, maxAge?: number | true): Entry<T> | PromiseLike<Entry<T>>;
export function useAsyncQueryFirst<T extends Data>(ref: DataQuery<T> | undefined, maxAge?: number | true): Entry<T> | PromiseLike<Entry<T>> | undefined;
export function useAsyncQueryFirst<T extends Data>(ref: DataQuery<T> | undefined, maxAge?: number | true): Entry<T> | PromiseLike<Entry<T>> | undefined {
	const results = useAsyncQuery(ref, maxAge);
	return ref && results ? callAsync(getQueryFirst, results, ref) : undefined;
}

/**
 * Use the cached data of a document in a React component.
 * - Requires database to use `CacheProvider` and will error if this does not exist.
 *
 * @param ref Query reference or `undefined`.
 * - If `undefined` is set this function will always return `undefined` (this simplifies scenarios where no document is needed, as hooks must always be called in the same order).
 * @param maxAge How 'out of date' data is allowed to be before it'll be refetched.
 * - If `maxAge` is true, a realtime subscription to the data will be created for the lifetime of the component.
 *
 * @returns The data of the document.
 *
 * @throws `Promise` that resolves when the data has loaded.
 * @throws `RequiredError` if the query had no results.
 * @trhows `Error` if a `CacheProvider` is not part of the database's provider chain.
 * @throws `Error` if there was a problem retrieving the data.
 */
export function useQueryFirst<T extends Data>(ref: DataQuery<T>, maxAge?: number | true): Entry<T>;
export function useQueryFirst<T extends Data>(ref: DataQuery<T> | undefined, maxAge?: number | true): Entry<T> | undefined;
export function useQueryFirst<T extends Data>(ref: DataQuery<T> | undefined, maxAge?: number | true): Entry<T> | undefined {
	return throwAsync(useAsyncQueryFirst(ref, maxAge));
}
