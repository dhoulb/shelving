import { Data, Result, Document, Observer, LOADING, State } from "..";
import { Source, Sources } from "./Source";
import { useState } from "./useState";

/** Store a list of named cached `Source` instances. */
const sources = new Sources();

// Getters.
const getDocumentResult = <T extends Data>(document: Document<T>) => document.result;
const getDocumentSubscription = <T extends Data>(observer: Observer<Result<T>>, document: Document<T>) => document.subscribe(observer);

/**
 * Use the result of a Shelving collection document in a React component.
 *
 * @param document Shelving `Document` object representing the document to be retrieved.
 * - If `document` is `undefined` then `undefined` will always be returned.
 * @param maxAge How 'out of date' data is allowed to be before it'll be refetched.
 * - If `maxAge` is true, a realtime subscription to the data will be created.
 *
 * @returns `State` instance for the result of the document.
 * - `state.value` of the state allows you to read the data.
 * - `state.data` allows you to read the data but throws a `RequiredError` if it was `undefined`
 * - If the data hasn't loaded yet, reading `state.value` will throw a `Promise` which can be caught by a `<Suspense />` element.
 *   - `state.loading` can tell you if the data is still loading before you read `state.value`
 * - If the data results in an error, reading `state.value` will throw that error.
 *   - `state.reason` can tell you if the state has an error before you read `state.value`
 */
export const useDocument = <T extends Data>(document: Document<T> | undefined, maxAge?: number | true): State<Result<T>> => {
	const key = `document:${document ? document.toString() : "undefined"}`;
	const source: Source<Result<T>> = sources.get<Result<T>>(key, document ? LOADING : undefined);
	if (document) {
		if (maxAge === true) source.subscribeTo<[Document<T>]>(getDocumentSubscription, [document]);
		else source.fetchFrom<[Document<T>]>(getDocumentResult, [document], maxAge);
	}
	return useState(source);
};
