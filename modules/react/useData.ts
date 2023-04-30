import type { AsyncQueryReference } from "../db/QueryReference.js";
import type { ImmutableArray } from "../util/array.js";
import { AsyncItemReference } from "../db/ItemReference.js";
import { ItemState } from "../db/ItemState.js";
import { QueryState } from "../db/QueryState.js";
import { setMapItem } from "../util/map.js";
import { mapArray } from "../util/transform.js";
import { createCache } from "./createCache.js";
import { useState } from "./useState.js";

// Types.
type RefToState<T> = T extends undefined ? undefined : T extends AsyncItemReference<infer X> ? ItemState<X> : T extends AsyncQueryReference<infer X> ? QueryState<X> : never;

/** Create a cache. */
const { Cache, useCache } = createCache<ItemState | QueryState>();

/** Use one or more data items or queries. */
export function useData<T extends AsyncItemReference | AsyncQueryReference | undefined>(ref: T): RefToState<T>;
export function useData<T extends ImmutableArray<AsyncItemReference | AsyncQueryReference | undefined>>(...refs: T): { [K in keyof T]: RefToState<T[K]> };
export function useData(...refs: ImmutableArray<AsyncItemReference | AsyncQueryReference | undefined>): ImmutableArray<ItemState | QueryState | undefined> | ItemState | QueryState | undefined {
	const cache = useCache();
	const states = mapArray(refs, _getRefState, cache);
	return useState(...states);
}

/** Get the corresponding `ItemState` or `QueryState` instance from the cache for a given `Item` or `Query`. */
function _getRefState(ref: AsyncItemReference | AsyncQueryReference | undefined, cache: Map<string, ItemState | QueryState>): ItemState | QueryState | undefined {
	const key = ref?.toString();
	return ref && key ? cache.get(key) || setMapItem(cache, key, ref instanceof AsyncItemReference ? new ItemState(ref) : new QueryState(ref)) : undefined;
}

/** Wrap components with `<DataCache>` to allow the use of `useData()`. */
export const DataCache = Cache;
