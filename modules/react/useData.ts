import type { AsyncQueryReference } from "../db/QueryReference.js";
import type { ImmutableArray } from "../util/array.js";
import type { Nullish } from "../util/null.js";
import { AsyncItemReference } from "../db/ItemReference.js";
import { ItemState } from "../db/ItemState.js";
import { QueryState } from "../db/QueryState.js";
import { setMapItem } from "../util/map.js";
import { mapArray } from "../util/transform.js";
import { createCache } from "./createCache.js";
import { useState } from "./useState.js";

// Types.
type NullishReferenceState<T> = T extends undefined | null ? undefined : T extends AsyncItemReference<infer X> ? ItemState<X> : T extends AsyncQueryReference<infer X> ? QueryState<X> : never;

/** Create a cache. */
const { Cache, useCache } = createCache<ItemState | QueryState>();

/** Use one or more data items or queries. */
export function useData<T extends Nullish<AsyncItemReference | AsyncQueryReference>>(ref: T): NullishReferenceState<T>;
export function useData<T extends ImmutableArray<Nullish<AsyncItemReference | AsyncQueryReference>>>(...refs: T): { [K in keyof T]: NullishReferenceState<T[K]> };
export function useData(...refs: ImmutableArray<Nullish<AsyncItemReference | AsyncQueryReference>>): ImmutableArray<Nullish<ItemState | QueryState>> | Nullish<ItemState | QueryState> {
	const cache = useCache();
	const states = mapArray(refs, _getRefState, cache);
	return useState(...states);
}

/** Get the corresponding `ItemState` or `QueryState` instance from the cache for a given `Item` or `Query`. */
function _getRefState(ref: Nullish<AsyncItemReference | AsyncQueryReference>, cache: Map<string, ItemState | QueryState>): Nullish<ItemState | QueryState> {
	const key = ref?.toString();
	return ref && key ? cache.get(key) || setMapItem(cache, key, ref instanceof AsyncItemReference ? new ItemState(ref) : new QueryState(ref)) : undefined;
}

/** Wrap components with `<DataProvider>` to allow the use of `useData()`. */
export const DataProvider = Cache;
