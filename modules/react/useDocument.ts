import { Data, Result, Document, DocumentRequiredError, Observer, Source, LOADING } from "..";
import { useSubscribe } from "./useSubscribe";

// Getters.
const getDocumentResult = <T extends Data>(document: Document<T>) => document.result;
const getDocumentSubscription = <T extends Data>(observer: Observer<Result<T>>, document: Document<T>) => document.subscribe(observer);

/**
 * Use the result of a Shelving collection document in a React component.
 *
 * @param document Shelving `Document` object representing the document to be retrieved.
 * - If `document` is `undefined` then `undefined` will always be returned.
 * @param maxAge How 'out of date' data is allowed to be before it'll be refetched.
 *
 * @throws `Promise` when loading, which should be caught with a `<Suspense>` block higher up.
 */
export const useDocument = <T extends Data>(document: Document<T> | undefined, maxAge?: number): Result<T> => {
	const source = Source.get<Result<T>>(`document:${document ? document.toString() : "undefined"}`, document ? LOADING : undefined);
	useSubscribe(source);
	if (document) source.fetchFrom<[Document<T>]>(getDocumentResult, [document], maxAge);
	return source.value;
};

/**
 * Use the data of a Shelving collection document in a React component.
 *
 * @param document Shelving `Document` object representing the document to be retrieved.
 * @param maxAge How 'out of date' data is allowed to be before it'll be refetched.
 *
 * @throws `Promise` when loading, which should be caught with a `<Suspense>` block higher up.
 * @throws `RequiredError` when document does not exist.
 */
export const useDocumentData = <T extends Data>(document: Document<T>, maxAge?: number): T => {
	const result = useDocument(document, maxAge);
	if (!result) throw new DocumentRequiredError(document);
	return result;
};

/**
 * Subscribe to the result of a Shelving collection document in a React component.
 *
 * @param document Shelving `Document` object representing the document to be retrieved.
 * - If `document` is `undefined` then `undefined` will always be returned.
 *
 * @throws `Promise` when loading, which should be caught with a `<Suspense>` block higher up.
 */
export const useDocumentSubscribe = <T extends Data>(document: Document<T> | undefined): Result<T> => {
	const source = Source.get<Result<T>>(`document:${document ? document.toString() : "undefined"}`, document ? LOADING : undefined);
	useSubscribe(source.active); // Use `source.subscribers` not `source` directly to indicate this is a subscription.
	if (document) source.subscribeTo<[Document<T>]>(getDocumentSubscription, [document]);
	return source.value;
};
