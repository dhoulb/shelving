import { AsyncDispatcher, Data, ErrorDispatcher, Result, Document, ReferenceRequiredError } from "..";
import { useSource, useLiveSource } from "./useSource";

// Getters.
const getDocumentResult = <T extends Data>(document: Document<T>) => document.result;
const getDocumentSubscription = <T extends Data>(onNext: AsyncDispatcher<Result<T>>, onError: ErrorDispatcher, document: Document<T>) =>
	document.on(onNext, onError);

/**
 * Use the result of a Shelving collection document in a React component.
 *
 * @param document Shelving `Document` object representing the document to be retrieved (or `undefined` to skip and always return undefined).
 *
 * @throws `Promise` when loading, which should be caught with a `<Suspense>` block higher up.
 * @throws Unknown error when something goes wrong.
 */
export const useDocument = <T extends Data>(document: Document<T> | undefined, maxAgeSeconds?: number): Result<T> => {
	const source = useSource<Result<T>>(document ? document.toString() : "undefined");
	if (document) source.fetch<[Document<T>]>(getDocumentResult, [document], maxAgeSeconds);
	const { value, error } = source.value;
	if (error) throw error;
	return value;
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
export const useDocumentData = <T extends Data>(document: Document<T>, maxAgeSeconds?: number): T => {
	const result = useDocument(document, maxAgeSeconds);
	if (!result) throw new ReferenceRequiredError(document);
	return result;
};

/**
 * Subscribe to the result of a Shelving collection document in a React component.
 *
 * @throws `Promise` when loading, which should be caught with a `<Suspense>` block higher up.
 * @throws Unknown error when something goes wrong.
 */
export const useDocumentSubscription = <T extends Data>(document: Document<T> | undefined): Result<T> => {
	const source = useLiveSource<Result<T>>(document ? document.toString() : "undefined");
	if (document) source.subscribe<[Document<T>]>(getDocumentSubscription, [document]);
	const { value, error } = source.value;
	if (error) throw error;
	return value;
};
