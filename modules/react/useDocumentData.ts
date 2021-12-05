import { DataDocument, throwAsync, callAsync, getDocumentData, Data } from "../index.js";
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
export function useAsyncDocumentData<T extends Data>(ref: DataDocument<T>, maxAge?: number | true): T | Promise<T>;
export function useAsyncDocumentData<T extends Data>(ref: DataDocument<T> | undefined, maxAge?: number | true): T | PromiseLike<T> | undefined;
export function useAsyncDocumentData<T extends Data>(ref: DataDocument<T> | undefined, maxAge?: number | true): T | PromiseLike<T> | undefined {
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
export function useDocumentData<T extends Data>(ref: DataDocument<T>, maxAge?: number | true): T;
export function useDocumentData<T extends Data>(ref: DataDocument<T> | undefined, maxAge?: number | true): T | undefined;
export function useDocumentData<T extends Data>(ref: DataDocument<T> | undefined, maxAge?: number | true): T | undefined {
	return throwAsync(useAsyncDocumentData(ref, maxAge));
}
