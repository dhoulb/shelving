import type { Data, Results, ErrorDispatcher, AsyncDispatcher, UnsubscribeDispatcher } from "shelving/tools";
import type { Collection } from "shelving/db";
import { useSource, useLiveSource } from "./useSource";

// Getters.
const getCollectionResults = <T extends Data>(collection: Collection<T>): Promise<Results<T>> => collection.results;
const getCollectionSubscription = <T extends Data>(
	onNext: AsyncDispatcher<Results<T>>,
	onError: ErrorDispatcher,
	collection: Collection<T>,
): UnsubscribeDispatcher => collection.on(onNext, onError);

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
	const source = useSource<Results<T>>(collection ? collection.toString() : "undefined");
	if (collection) source.fetch<[Collection<T>]>(getCollectionResults, [collection], maxAgeSeconds);
	const { value, error } = source.value;
	if (error) throw error;
	return value;
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
	const source = useLiveSource<Results<T>>(collection ? collection.toString() : "undefined");
	if (collection) source.subscribe<[Collection<T>]>(getCollectionSubscription, [collection]);
	const { value, error } = source.value;
	if (error) throw error;
	return value;
};
