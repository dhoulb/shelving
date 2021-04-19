import { Data, Results, Collection } from "..";
import { Source } from "./Source";
import { useState } from "./useState";

/** Store a list of named cached `Source` instances. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const sources: { [key: string]: Source<any> } = {};

/**
 * Use the results of a Shelving collection in a React component (once).
 *
 * @param collection Instance of `Collection` to get the results of, or an explicit `undefined`
 * - If `collection` is `undefined` then `{}` empty results will always be returned.
 * @param maxAge How 'out of date' data is allowed to be before it'll be refetched.
 * - If `maxAge` is true, a realtime subscription to the data will be created.
 *
 * @returns `State` instance for the results of the collection.
 * - `state.value` of the state allows you to read the data.
 * - If the data hasn't loaded yet, reading `state.value` will throw a `Promise` which can be caught by a `<Suspense />` element.
 *   - `state.loading` can tell you if the data is still loading before you read `state.value`
 * - If the data results in an error, reading `state.value` will throw that error.
 *   - `state.reason` can tell you if the state has an error before you read `state.value`
 */
export const useCollection = <T extends Data>(collection: Collection<T> | undefined, maxAge?: number | true): Source<Results<T>> => {
	const key = `collection:${collection ? collection.toString() : "undefined"}`;
	const source: Source<Results<T>> = (sources[key] ||= new Source<Results<T>>(
		collection
			? {
					subscriptor: s => collection.subscribe(s),
					fetcher: () => collection.results,
			  }
			: {
					initial: undefined,
			  },
	));
	if (source.closed) setTimeout(() => source === sources[key] && delete sources[key], 3000);
	if (collection) {
		if (maxAge === true) source.startSubscription();
		else source.possiblyFetch(maxAge);
	}
	useState(source);
	return source;
};
