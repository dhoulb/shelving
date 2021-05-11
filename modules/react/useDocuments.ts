import { Data, Results, Documents } from "..";
import { Source } from "./Source";
import { useState } from "./useState";

/** Store a list of named cached `Source` instances. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const sources: { [key: string]: Source<any> } = {};

/**
 * Use a set of documents in a React component.
 *
 * @param ref Shelving `Documents` reference, or an explicit `undefined`
 * - If `collection` is `undefined` then `{}` empty results will always be returned.
 * @param maxAgeMs How 'out of date' data is allowed to be before it'll be refetched.
 * - If `maxAge` is true, a realtime subscription to the data will be created.
 *
 * @returns `State` instance for the results of the collection.
 * - `state.value` of the state allows you to read the data.
 * - If the data hasn't loaded yet, reading `state.value` will throw a `Promise` which can be caught by a `<Suspense />` element.
 *   - `state.loading` can tell you if the data is still loading before you read `state.value`
 * - If the data results in an error, reading `state.value` will throw that error.
 *   - `state.reason` can tell you if the state has an error before you read `state.value`
 */
export const useDocuments = <T extends Data>(
	ref: Documents<T> | undefined,
	options: { subscribe?: boolean; maxAge?: number; initial?: Results<T> },
): Source<Results<T>> => {
	const key = ref ? ref.toString() : "undefined";
	const source: Source<Results<T>> = (sources[key] ||= new Source<Results<T>>(
		!ref ? { initial: undefined } : { ...options, subscriptor: ref, fetcher: ref }, //
	));
	if (source.closed) setTimeout(() => source === sources[key] && delete sources[key], 3000);
	if (ref) {
		if (options.subscribe === true) source.start();
		else source.queueFetch(options.maxAge);
	}
	useState(source);
	return source;
};
