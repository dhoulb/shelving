import type { Datas, DataKey } from "../util/data.js";
import type { AsyncQuery, Query } from "../db/Query.js";
import { QueryState } from "../db/QueryState.js";
import { setMapItem } from "../util/map.js";
import { useState } from "./useState.js";
import { useCache } from "./useCache.js";

/**
 * Use a query in a React component.
 * - Uses the default cache, so will error if not used inside `<Cache>`
 */
export function useQuery<T extends Datas, K extends DataKey<T>>(ref: Query<T, K> | AsyncQuery<T, K>): QueryState<T, K>;
export function useQuery<T extends Datas, K extends DataKey<T>>(ref?: Query<T, K> | AsyncQuery<T, K>): QueryState<T, K> | undefined;
export function useQuery<T extends Datas, K extends DataKey<T>>(ref?: Query<T, K> | AsyncQuery<T, K>): QueryState<T, K> | undefined {
	const cache = useCache<QueryState<T, K>>();
	const key = ref?.toString();
	return useState(ref && key ? cache.get(key) || setMapItem(cache, key, new QueryState(ref)) : undefined);
}
