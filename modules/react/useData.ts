import type { ImmutableArray } from "../util/array.js";
import type { DataKey, Datas } from "../util/data.js";
import { setMapItem } from "../util/map.js";
import { mapArray } from "../util/transform.js";
import { AsyncItem } from "../db/Item.js";
import { ItemState } from "../db/ItemState.js";
import { AsyncQuery } from "../db/Query.js";
import { QueryState } from "../db/QueryState.js";
import { useState } from "./useState.js";
import { createCache } from "./createCache.js";

/** Create a cache. */
const { Cache, useCache } = createCache<AnyRefState>();

type AnyRef = AsyncItem<any, any> | AsyncQuery<any, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
type AnyRefState = ItemState<any, any> | QueryState<any, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
type Ref<T extends Datas, K extends DataKey<T>> = AsyncItem<T, K> | AsyncQuery<T, K>;
type RefState<T extends Datas, K extends DataKey<T>> = ItemState<T, K> | QueryState<T, K>;

type RefToState<T> = T extends undefined ? undefined : T extends AsyncItem<infer D, infer K> ? ItemState<D, K> : T extends AsyncQuery<infer D, infer K> ? QueryState<D, K> : never;

/** Use one or more data items or queries. */
export function useData<T extends AnyRef | undefined>(ref: T): RefToState<T>;
export function useData<T extends ImmutableArray<AnyRef | undefined>>(...refs: T): { [K in keyof T]: RefToState<T[K]> };
export function useData<T extends Datas, K extends DataKey<T>>(...refs: ImmutableArray<Ref<T, K> | undefined>): ImmutableArray<RefState<T, K> | undefined> | RefState<T, K> | undefined {
	const cache: Map<string, RefState<T, K>> = useCache();
	const states = mapArray(refs, _getRefState, cache);
	return useState(...states);
}

/** Get the corresponding `ItemState` or `QueryState` instance from the cache for a given `Item` or `Query`. */
function _getRefState<T extends Datas, K extends DataKey<T>>(ref: Ref<T, K> | undefined, cache: Map<string, RefState<T, K>>): RefState<T, K> | undefined {
	const key = ref?.toString();
	return ref && key ? cache.get(key) || setMapItem(cache, key, ref instanceof AsyncItem ? new ItemState(ref) : new QueryState(ref)) : undefined;
}

/** Wrap components with `<DataCache>` to allow the use of `useData()`. */
export const DataCache = Cache;
