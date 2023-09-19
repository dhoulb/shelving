import type { AbstractProvider } from "../db/Provider.js";
import type { DataKey, Database } from "../util/data.js";
import type { ItemQuery } from "../util/item.js";
import type { Optional } from "../util/optional.js";
import { ItemStore } from "../db/ItemStore.js";
import { QueryStore } from "../db/QueryStore.js";
import { setMapItem } from "../util/map.js";
import { createCacheContext } from "./createCacheContext.js";
import { useStore } from "./useStore.js";

export interface DataContext<T extends Database> {
	/** Get an `ItemStore` for the specified collection item in the current `DataProvider` context. */
	useCacheItem<K extends DataKey<T>>(this: void, collection: K, id: string): ItemStore<T, K>;
	useCacheItem<K extends DataKey<T>>(this: void, collection: Optional<K>, id: Optional<string>): ItemStore<T, K> | undefined;
	/** Get an `QueryStore` for the specified collection query in the current `DataProvider` context. */
	useCacheQuery<K extends DataKey<T>>(this: void, collection: K, query: ItemQuery<T[K]>): QueryStore<T, K>;
	useCacheQuery<K extends DataKey<T>>(this: void, collection: Optional<K>, query: Optional<ItemQuery<T[K]>>): QueryStore<T, K> | undefined;
	/** Get an `ItemStore` for the specified collection item in the current `DataProvider` context and subscribe to any changes in it. */
	useItem<K extends DataKey<T>>(this: void, collection: K, id: string): ItemStore<T, K>;
	useItem<K extends DataKey<T>>(this: void, collection: Optional<K>, id: Optional<string>): ItemStore<T, K> | undefined;
	/** Get an `QueryStore` for the specified collection query in the current `DataProvider` context and subscribe to any changes in it. */
	useQuery<K extends DataKey<T>>(this: void, collection: K, query: ItemQuery<T[K]>): QueryStore<T, K>;
	useQuery<K extends DataKey<T>>(this: void, collection: Optional<K>, query: Optional<ItemQuery<T[K]>>): QueryStore<T, K> | undefined;
	readonly DataProvider: ({ children }: { children: React.ReactNode }) => React.ReactElement;
}

/**
 * Create a data context that can be provided to React elements and allows them to call `useItem()` and `useQuery()`
 */
export function createDataContext<T extends Database>(provider: AbstractProvider<T>): DataContext<T> {
	const { CacheProvider, useCache } = createCacheContext<ItemStore<T, any> | QueryStore<T, any>>(); // eslint-disable-line @typescript-eslint/no-explicit-any

	const useCacheItem = <K extends DataKey<T>>(collection: Optional<K>, id: Optional<string>): ItemStore<T, K> | undefined => {
		const cache = useCache();
		const key = collection && id && `${collection}/${id}`;
		return key ? (cache.get(key) as ItemStore<T, K>) || setMapItem(cache, key, new ItemStore<T, K>(provider, collection, id)) : undefined;
	};

	const useCacheQuery = <K extends DataKey<T>>(collection: Optional<K>, query: Optional<ItemQuery<T[K]>>): QueryStore<T, K> | undefined => {
		const cache = useCache();
		const key = collection && query && `${collection}?${JSON.stringify(query)}`;
		return key ? (cache.get(key) as QueryStore<T, K>) || setMapItem(cache, key, new QueryStore<T, K>(provider, collection, query)) : undefined;
	};

	return {
		useCacheItem,
		useCacheQuery,
		useItem: <K extends DataKey<T>>(collection: Optional<K>, id: Optional<string>): ItemStore<T, K> | undefined => useStore(useCacheItem(collection, id)),
		useQuery: <K extends DataKey<T>>(collection: Optional<K>, query: Optional<ItemQuery<T[K]>>): QueryStore<T, K> | undefined => useStore(useCacheQuery(collection, query)),
		DataProvider: CacheProvider,
	} as DataContext<T>;
}
