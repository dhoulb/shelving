import { DatabaseDocument, getRequired, Datas, Key, throwAsync, Result, deriveAsync } from "../index.js";
import { useAsyncResult } from "./useResult.js";

/**
 * Use the cached data of a document in a React component (or a `Promise` to indicate the data is still loading).
 * - Requires database to use `CacheProvider` and will error if this does not exist.
 *
 * @param ref Document reference or `undefined`.
 * - If `undefined` is set this function will always return `undefined` (this simplifies scenarios where no document is needed, as hooks must always be called in the same order).
 * @param maxAge How 'out of date' data is allowed to be before it'll be refetched.
 * - If `maxAge` is true, a realtime subscription to the data will be created for the lifetime of the component.
 *
 * @returns The data of the document, or `Promise` that resolves when the data has loaded.
 *
 * @throws `RequiredError` if the document does not exist.
 * @trhows `Error` if a `CacheProvider` is not part of the database's provider chain.
 * @throws `Error` if there was a problem retrieving the data.
 */
export function useAsyncData<D extends Datas, C extends Key<D>>(ref: DatabaseDocument<D, C>, maxAge?: number | true): D[C] | Promise<D[C]>;
export function useAsyncData<D extends Datas, C extends Key<D>>(
	ref: DatabaseDocument<D, C> | undefined,
	maxAge?: number | true,
): D[C] | Promise<D[C]> | undefined;
export function useAsyncData<D extends Datas, C extends Key<D>>(
	ref: DatabaseDocument<D, C> | undefined,
	maxAge?: number | true,
): D[C] | Promise<D[C]> | undefined {
	const result = useAsyncResult(ref, maxAge);
	return ref ? deriveAsync<Result<D[C]>, D[C]>(result, getRequired) : undefined;
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
 * @returns The data of the document.
 *
 * @throws `Promise` that resolves when the data has loaded.
 * @throws `RequiredError` if the document does not exist.
 * @trhows `Error` if a `CacheProvider` is not part of the database's provider chain.
 * @throws `Error` if there was a problem retrieving the data.
 */
export function useData<D extends Datas, C extends Key<D>>(ref: DatabaseDocument<D, C>, maxAge?: number | true): D[C];
export function useData<D extends Datas, C extends Key<D>>(ref: DatabaseDocument<D, C> | undefined, maxAge?: number | true): D[C] | undefined;
export function useData<D extends Datas, C extends Key<D>>(ref: DatabaseDocument<D, C> | undefined, maxAge?: number | true): D[C] | undefined {
	return throwAsync(useAsyncData(ref, maxAge));
}
