import { Data, Results, Unsubscriber, Collection, Observer, LOADING, State } from "..";
import { Sources, Source } from "./Source";
import { useState } from "./useState";

/** Store a list of named cached `Source` instances. */
const sources = new Sources();

// Getters.
const getCollectionResults = <T extends Data>(collection: Collection<T>): Promise<Results<T>> => collection.results;
const getCollectionSubscription = <T extends Data>(observer: Observer<Results<T>>, collection: Collection<T>): Unsubscriber => collection.subscribe(observer);

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
export const useCollection = <T extends Data>(collection: Collection<T> | undefined, maxAge?: number | true): State<Results<T>> => {
	const key = `collection:${collection ? collection.toString() : "undefined"}`;
	const source: Source<Results<T>> = sources.get<Results<T>>(key, collection ? LOADING : {});
	if (collection) {
		if (maxAge === true) source.subscribeTo<[Collection<T>]>(getCollectionSubscription, [collection]);
		else source.fetchFrom<[Collection<T>]>(getCollectionResults, [collection], maxAge);
	}
	return useState(source);
};
