import { Data, Results, Unsubscriber, Collection, Observer, Source, LOADING } from "..";
import { useSubscribe } from "./useSubscribe";

// Getters.
const getCollectionResults = <T extends Data>(collection: Collection<T>): Promise<Results<T>> => collection.results;
const getCollectionSubscription = <T extends Data>(observer: Observer<Results<T>>, collection: Collection<T>): Unsubscriber => collection.subscribe(observer);

/**
 * Use the results of a Shelving collection in a React component (once).
 *
 * @param collection Instance of `Collection` to get the results of, or an explicit `undefined`
 * - If `collection` is `undefined` then `{}` empty results will always be returned.
 * @param maxAge How 'out of date' data is allowed to be before it'll be refetched.
 *
 * @throws `Promise` when loading, which should be caught with a `<Suspense>` block higher up.
 * @throws Unknown error when something goes wrong.
 */
export const useCollection = <T extends Data>(collection: Collection<T> | undefined, maxAge?: number): Results<T> => {
	const source = Source.get<Results<T>>(`collection:${collection ? collection.toString() : "undefined"}`, collection ? LOADING : {});
	useSubscribe(source);
	if (collection) source.fetchFrom<[Collection<T>]>(getCollectionResults, [collection], maxAge);
	return source.value;
};

/**
 * Subscribe to the results of a Shelving collection in a React component.
 *
 * @param collection Instance of `Collection` to subscribe to, or an explicit `undefined`
 * - If `collection` is `undefined` then `{}` empty results will always be returned.
 *
 * @throws `Promise` when loading, which should be caught with a `<Suspense>` block higher up.
 * @throws Unknown error when something goes wrong.
 */
export const useCollectionSubscribe = <T extends Data>(collection: Collection<T> | undefined): Results<T> => {
	const source = Source.get<Results<T>>(`collection:${collection ? collection.toString() : "undefined"}`, collection ? LOADING : {});
	useSubscribe(source.active); // Use `source.subscribers` not `source` directly to indicate this is a subscription.
	if (collection) source.subscribeTo<[Collection<T>]>(getCollectionSubscription, [collection]);
	return source.value;
};
