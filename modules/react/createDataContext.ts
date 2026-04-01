import type { ReactElement, ReactNode } from "react";
import type { Collection } from "../db/collection/Collection.js";
import { CacheDBProvider } from "../db/provider/CacheDBProvider.js";
import type { DBProvider } from "../db/provider/DBProvider.js";
import { ItemStore } from "../db/store/ItemStore.js";
import { QueryStore } from "../db/store/QueryStore.js";
import type { Data } from "../util/data.js";
import type { Identifier } from "../util/item.js";
import { setMapItem } from "../util/map.js";
import type { Nullish } from "../util/null.js";
import type { ItemQuery } from "../util/query.js";
import { getSource } from "../util/source.js";
import { createCacheContext } from "./createCacheContext.js";
import { useStore } from "./useStore.js";

export interface DataContext<I extends Identifier = Identifier> {
	/** Get an `ItemStore` for the specified collection item in the current `DataProvider` context and subscribe to any changes in it. */
	useItem<T extends Data>(this: void, collection: Collection<string, I, T>, id: I): ItemStore<I, T>;
	useItem<T extends Data>(this: void, collection: Nullish<Collection<string, I, T>>, id: Nullish<I>): ItemStore<I, T> | undefined;
	/** Get an `QueryStore` for the specified collection query in the current `DataProvider` context and subscribe to any changes in it. */
	useQuery<T extends Data>(this: void, collection: Collection<string, I, T>, query: ItemQuery<I, T>): QueryStore<I, T>;
	useQuery<T extends Data>(
		this: void,
		collection: Nullish<Collection<string, I, T>>,
		query: Nullish<ItemQuery<I, T>>,
	): QueryStore<I, T> | undefined;
	readonly DataContext: ({ children }: { children: ReactNode }) => ReactElement;
}

/**
 * Create a data context
 * - Allows React elements to call `useItem()` and `useQuery()` to access items/queries in a database provider.
 * - If the database has a `CacheDBProvider` in its chain then in-memory data will be used in the returned stores.
 */
export function createDataContext<I extends Identifier = Identifier>(provider: DBProvider<I>): DataContext<I> {
	// biome-ignore lint/suspicious/noExplicitAny: The outer function enforces the type.
	const { CacheContext, useCache } = createCacheContext<ItemStore<I, any> | QueryStore<I, any>>();

	// If this provider is backed by an in-memory cache, pass it to the `ItemStore` and `QueryStore` instances we create.
	const memory = getSource<CacheDBProvider<I>>(CacheDBProvider, provider)?.memory;

	return {
		useItem: <T extends Data>(collection: Nullish<Collection<string, I, T>>, id: Nullish<I>): ItemStore<I, T> | undefined => {
			const cache = useCache() as Map<string, ItemStore<I, T>>;
			const key = collection && id && `${collection.name}/${id}`;
			return useStore(key ? cache.get(key) || setMapItem(cache, key, new ItemStore(collection, id, provider, memory)) : undefined);
		},
		useQuery: <T extends Data>(
			collection: Nullish<Collection<string, I, T>>,
			query: Nullish<ItemQuery<I, T>>,
		): QueryStore<I, T> | undefined => {
			const cache = useCache() as Map<string, QueryStore<I, T>>;
			const key = collection && query && `${collection.name}?${JSON.stringify(query)}`;
			return useStore(key ? cache.get(key) || setMapItem(cache, key, new QueryStore(collection, query, provider, memory)) : undefined);
		},
		DataContext: CacheContext,
	} as DataContext<I>;
}
