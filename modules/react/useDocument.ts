import { Data, Result, Document } from "..";
import { Source } from "./Source";
import { useState } from "./useState";

/** Store a list of named cached `Source` instances. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const sources: { [key: string]: Source<any> } = {};

/**
 * Use the result of a Shelving collection document in a React component.
 *
 * @param document Shelving `Document` object representing the document to be retrieved.
 * - If `document` is `undefined` then `undefined` will always be returned.
 * @param maxAgeMs How 'out of date' data is allowed to be before it'll be refetched.
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
export const useDocument = <T extends Data>(document: Document<T> | undefined, maxAgeMs?: number | true): Source<Result<T>> => {
	const key = `document:${document ? document.toString() : "undefined"}`;
	const source: Source<Result<T>> = (sources[key] ||= new Source<Result<T>>(
		document ? { subscribe: document, fetch: document } : { initial: undefined }, //
	));
	if (source.closed) setTimeout(() => source === sources[key] && delete sources[key], 3000);
	if (document) {
		if (maxAgeMs === true) source.start();
		else source.queueFetch(maxAgeMs);
	}
	useState(source);
	return source;
};
