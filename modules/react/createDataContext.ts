import type { ReactElement, ReactNode } from "react";
import { CacheProvider } from "../db/CacheProvider.js";
import { ItemStore } from "../db/ItemStore.js";
import type { AbstractProvider } from "../db/Provider.js";
import { QueryStore } from "../db/QueryStore.js";
import type { DataKey, Database } from "../util/data.js";
import type { ItemQuery } from "../util/item.js";
import { setMapItem } from "../util/map.js";
import type { Optional } from "../util/optional.js";
import { getOptionalSource } from "../util/source.js";
import { createCacheContext } from "./createCacheContext.js";
import { useStore } from "./useStore.js";

export interface DataContext<T extends Database> {
	/** Get an `ItemStore` for the specified collection item in the current `DataProvider` context and subscribe to any changes in it. */
	useItem<K extends DataKey<T>>(this: void, collection: K, id: string): ItemStore<T, K>;
	useItem<K extends DataKey<T>>(this: void, collection: Optional<K>, id: Optional<string>): ItemStore<T, K> | undefined;
	/** Get an `QueryStore` for the specified collection query in the current `DataProvider` context and subscribe to any changes in it. */
	useQuery<K extends DataKey<T>>(this: void, collection: K, query: ItemQuery<T[K]>): QueryStore<T, K>;
	useQuery<K extends DataKey<T>>(this: void, collection: Optional<K>, query: Optional<ItemQuery<T[K]>>): QueryStore<T, K> | undefined;
	readonly DataContext: ({ children }: { children: ReactNode }) => ReactElement;
}

/**
 * Create a data context that can be provided to React elements and allows them to call `useItem()` and `useQuery()`
 */
export function createDataContext<T extends Database>(provider: AbstractProvider<T>): DataContext<T> {
	// biome-ignore lint/suspicious/noExplicitAny: The outer function enforces the type.
	const { CacheContext, useCache } = createCacheContext<ItemStore<T, any> | QueryStore<T, any>>();

	// If this provider is backed by an in-memory cache, pass it to the `ItemStore` and `QueryStore` instances we create.
	const memory = getOptionalSource<CacheProvider<T>>(CacheProvider, provider)?.memory;

	return {
		useItem: <K extends DataKey<T>>(collection: Optional<K>, id: Optional<string>): ItemStore<T, K> | undefined => {
			const cache = useCache() as Map<string, ItemStore<T, K>>;
			const key = collection && id && `${collection}/${id}`;
			return useStore(key ? cache.get(key) || setMapItem(cache, key, new ItemStore(collection, id, provider, memory)) : undefined);
		},
		useQuery: <K extends DataKey<T>>(collection: Optional<K>, query: Optional<ItemQuery<T[K]>>): QueryStore<T, K> | undefined => {
			const cache = useCache() as Map<string, QueryStore<T, K>>;
			const key = collection && query && `${collection}?${JSON.stringify(query)}`;
			return useStore(key ? cache.get(key) || setMapItem(cache, key, new QueryStore(collection, query, provider, memory)) : undefined);
		},
		DataContext: CacheContext,
	} as DataContext<T>;
}
