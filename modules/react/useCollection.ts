import { Data, Results, Unsubscriber, Collection, getSource } from "..";
import { Observer } from "../observe";
import { useState } from "./useState";

// Getters.
const getCollectionResults = <T extends Data>(collection: Collection<T>): Promise<Results<T>> => collection.results;
const getCollectionSubscription = <T extends Data>(observer: Observer<Results<T>>, collection: Collection<T>): Unsubscriber => collection.subscribe(observer);

/**
 * Use the results of a Shelving collection in a React component (once).
 *
 * @param collection Instance of `Collection` to get the results of, or an explicit `undefined`
 * - The `undefined` value allows for this hook to be called conditionally.
 * - If `collection` is `undefined` then `{}` empty results will always be returned.
 *
 * @throws `Promise` when loading, which should be caught with a `<Suspense>` block higher up.
 * @throws Unknown error when something goes wrong.
 */
export const useCollection = <T extends Data>(collection: Collection<T> | undefined, maxAgeSeconds?: number): Results<T> => {
	const source = getSource<Results<T>>(collection ? collection.toString() : "undefined");
	void useState(source);
	if (collection) source.fetchFrom<[Collection<T>]>(getCollectionResults, [collection], maxAgeSeconds);
	return source.value;
};

/**
 * Subscribe to the results of a Shelving collection in a React component.
 *
 * @param collection Instance of `Collection` to subscribe to, or an explicit `undefined`
 * - The `undefined` value allows for this hook to be called conditionally.
 * - If `collection` is `undefined` then `{}` empty results will always be returned.
 *
 * @throws `Promise` when loading, which should be caught with a `<Suspense>` block higher up.
 * @throws Unknown error when something goes wrong.
 */
export const useCollectionSubscription = <T extends Data>(collection: Collection<T> | undefined): Results<T> => {
	const source = getSource<Results<T>>(collection ? collection.toString() : "undefined");
	void useState(source.subscription); // Use `source.subscribers` not `source` directly to indicate this is a subscription.
	if (collection) source.subscribeTo<[Collection<T>]>(getCollectionSubscription, [collection]);
	return source.value;
};
