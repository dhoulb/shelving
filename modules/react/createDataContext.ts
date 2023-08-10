import type { AsyncDatabase, Database } from "../db/Database.js";
import type { DataKey, Datas } from "../util/data.js";
import type { ItemQuery } from "../util/item.js";
import { ItemState } from "../db/ItemState.js";
import { QueryState } from "../db/QueryState.js";
import { setMapItem } from "../util/map.js";
import { type Optional, getRequired } from "../util/optional.js";
import { createCacheContext } from "./createCacheContext.js";
import { useState } from "./useState.js";

/**
 * Create a data context that can be provided to React elements and allows them to call `useItem()` and `useQuery()`
 */
export function createDataContext<T extends Datas>({
	provider,
}: Database<T> | AsyncDatabase<T>): {
	readonly useItem: <K extends DataKey<T>>(collection: K, id: string) => ItemState<T[K]>;
	readonly useQuery: <K extends DataKey<T>>(collection: K, query: ItemQuery<T[K]>) => QueryState<T[K]>;
	readonly useOptionalItem: <K extends DataKey<T>>(collection: K, id: Optional<string>) => ItemState<T[K]> | undefined;
	readonly useOptionalQuery: <K extends DataKey<T>>(collection: K, query: Optional<ItemQuery<T[K]>>) => QueryState<T[K]> | undefined;
	readonly DataProvider: ({ children }: { children: React.ReactNode }) => React.ReactElement;
} {
	const { CacheProvider, useCache } = createCacheContext<ItemState<T[any]> | QueryState<T[any]>>(); // eslint-disable-line @typescript-eslint/no-explicit-any

	const useOptionalItem = <K extends DataKey<T>>(collection: K, id: Optional<string>): ItemState<T[K]> | undefined => {
		const cache = useCache();
		const key = id && `${collection}/${id}`;
		return useState(id && key ? (cache.get(key) as ItemState<T[K]>) || setMapItem(cache, key, new ItemState<T[K]>(provider, collection, id)) : undefined);
	};

	const useOptionalQuery = <K extends DataKey<T>>(collection: K, query: Optional<ItemQuery<T[K]>>): QueryState<T[K]> | undefined => {
		const cache = useCache();
		const key = `${collection}?${JSON.stringify(query)}`;
		return useState(query && key ? (cache.get(key) as QueryState<T[K]>) || setMapItem(cache, key, new QueryState<T[K]>(provider, collection, query)) : undefined);
	};

	return {
		useOptionalItem,
		useOptionalQuery,
		useItem: <K extends DataKey<T>>(collection: K, id: string): ItemState<T[K]> => getRequired(useOptionalItem(collection, id)),
		useQuery: <K extends DataKey<T>>(collection: K, query: ItemQuery<T[K]>): QueryState<T[K]> => getRequired(useOptionalQuery(collection, query)),
		DataProvider: CacheProvider,
	};
}
