import type { AsyncDatabase, Database } from "../db/Database.js";
import type { DataKey, Datas } from "../util/data.js";
import type { ItemQuery } from "../util/item.js";
import { ItemStore } from "../db/ItemStore.js";
import { QueryStore } from "../db/QueryStore.js";
import { setMapItem } from "../util/map.js";
import { type Optional, getRequired } from "../util/optional.js";
import { createCacheContext } from "./createCacheContext.js";
import { useStore } from "./useStore.js";

/**
 * Create a data context that can be provided to React elements and allows them to call `useItem()` and `useQuery()`
 */
export function createDataContext<T extends Datas>({
	provider,
}: Database<T> | AsyncDatabase<T>): {
	readonly useItem: <K extends DataKey<T>>(collection: K, id: string) => ItemStore<T[K]>;
	readonly useQuery: <K extends DataKey<T>>(collection: K, query: ItemQuery<T[K]>) => QueryStore<T[K]>;
	readonly useOptionalItem: <K extends DataKey<T>>(collection: K, id: Optional<string>) => ItemStore<T[K]> | undefined;
	readonly useOptionalQuery: <K extends DataKey<T>>(collection: K, query: Optional<ItemQuery<T[K]>>) => QueryStore<T[K]> | undefined;
	readonly DataProvider: ({ children }: { children: React.ReactNode }) => React.ReactElement;
} {
	const { CacheProvider, useCache } = createCacheContext<ItemStore<T[any]> | QueryStore<T[any]>>(); // eslint-disable-line @typescript-eslint/no-explicit-any

	const useOptionalItem = <K extends DataKey<T>>(collection: Optional<K>, id: Optional<string>): ItemStore<T[K]> | undefined => {
		const cache = useCache();
		const key = collection && id && `${collection}/${id}`;
		return useStore(key ? (cache.get(key) as ItemStore<T[K]>) || setMapItem(cache, key, new ItemStore<T[K]>(provider, collection, id)) : undefined);
	};

	const useOptionalQuery = <K extends DataKey<T>>(collection: Optional<K>, query: Optional<ItemQuery<T[K]>>): QueryStore<T[K]> | undefined => {
		const cache = useCache();
		const key = collection && query && `${collection}?${JSON.stringify(query)}`;
		return useStore(key ? (cache.get(key) as QueryStore<T[K]>) || setMapItem(cache, key, new QueryStore<T[K]>(provider, collection, query)) : undefined);
	};

	return {
		useOptionalItem,
		useOptionalQuery,
		useItem: <K extends DataKey<T>>(collection: K, id: string): ItemStore<T[K]> => getRequired(useOptionalItem(collection, id)),
		useQuery: <K extends DataKey<T>>(collection: K, query: ItemQuery<T[K]>): QueryStore<T[K]> => getRequired(useOptionalQuery(collection, query)),
		DataProvider: CacheProvider,
	};
}
