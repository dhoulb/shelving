import { DatabaseDocument, Datas, Key, throwAsync, callAsync, getDocumentData } from "../index.js";
import { useAsyncDocument } from "./useDocument.js";

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
export function useAsyncDocumentData<D extends Datas, C extends Key<D>>(ref: DatabaseDocument<C, D>, maxAge?: number | true): D[C] | Promise<D[C]>;
export function useAsyncDocumentData<D extends Datas, C extends Key<D>>(
	ref: DatabaseDocument<C, D> | undefined,
	maxAge?: number | true,
): D[C] | PromiseLike<D[C]> | undefined;
export function useAsyncDocumentData<D extends Datas, C extends Key<D>>(
	ref: DatabaseDocument<C, D> | undefined,
	maxAge?: number | true,
): D[C] | PromiseLike<D[C]> | undefined {
	const result = useAsyncDocument(ref, maxAge);
	return ref ? callAsync(getDocumentData, result, ref) : undefined;
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
export function useDocumentData<D extends Datas, C extends Key<D>>(ref: DatabaseDocument<C, D>, maxAge?: number | true): D[C];
export function useDocumentData<D extends Datas, C extends Key<D>>(ref: DatabaseDocument<C, D> | undefined, maxAge?: number | true): D[C] | undefined;
export function useDocumentData<D extends Datas, C extends Key<D>>(ref: DatabaseDocument<C, D> | undefined, maxAge?: number | true): D[C] | undefined {
	return throwAsync(useAsyncDocumentData(ref, maxAge));
}
