import { Data, Result, Document, DocumentRequiredError, Observer } from "..";
import { getCachedSource } from "./cache";
import { useState } from "./useState";

// Getters.
const getDocumentResult = <T extends Data>(document: Document<T>) => document.result;
const getDocumentSubscription = <T extends Data>(observer: Observer<Result<T>>, document: Document<T>) => document.subscribe(observer);

/**
 * Use the result of a Shelving collection document in a React component.
 *
 * @param document Shelving `Document` object representing the document to be retrieved (or `undefined` to skip and always return undefined).
 *
 * @throws `Promise` when loading, which should be caught with a `<Suspense>` block higher up.
 * @throws Unknown error when something goes wrong.
 */
export const useDocument = <T extends Data>(document: Document<T> | undefined, maxAge?: number): Result<T> => {
	const source = getCachedSource<Result<T>>(`document:${document ? document.toString() : "undefined"}`);
	void useState(source);
	if (document) source.fetchFrom<[Document<T>]>(getDocumentResult, [document], maxAge);
	return source.value;
};

/**
 * Use the data of a Shelving collection document in a React component.
 *
 * @param document Shelving `Document` object representing the document to be retrieved.
 *
 * @throws `Promise` when loading, which should be caught with a `<Suspense>` block higher up.
 * @throws `RequiredError` when document does not exist.
 * @throws Unknown error when something goes wrong.
 */
export const useDocumentData = <T extends Data>(document: Document<T>, maxAge?: number): T => {
	const result = useDocument(document, maxAge);
	if (!result) throw new DocumentRequiredError(document);
	return result;
};

/**
 * Subscribe to the result of a Shelving collection document in a React component.
 *
 * @throws `Promise` when loading, which should be caught with a `<Suspense>` block higher up.
 * @throws Unknown error when something goes wrong.
 */
export const useDocumentSubscription = <T extends Data>(document: Document<T> | undefined): Result<T> => {
	const source = getCachedSource<Result<T>>(`document:${document ? document.toString() : "undefined"}`);
	void useState(source.subscription); // Use `source.subscribers` not `source` directly to indicate this is a subscription.
	if (document) source.subscribeTo<[Document<T>]>(getDocumentSubscription, [document]);
	return source.value;
};
