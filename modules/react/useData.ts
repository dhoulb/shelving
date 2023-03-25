import type { ImmutableArray } from "../util/array.js";
import { DataKey, Datas } from "../util/data.js";
import { setMapItem } from "../util/map.js";
import { mapArray } from "../util/transform.js";
import { AsyncItem } from "../db/Item.js";
import { ItemState } from "../db/ItemState.js";
import { AsyncQuery } from "../db/Query.js";
import { QueryState } from "../db/QueryState.js";
import { useState } from "./useState.js";
import { useCache } from "./useCache.js";

type Reference<T extends Datas, K extends DataKey<T>> = AsyncItem<T, K> | AsyncQuery<T, K>;
type ReferenceState<T extends Datas, K extends DataKey<T>> = ItemState<T, K> | QueryState<T, K>;
type ReferenceReferenceState<T extends Reference<Datas, string>> = T extends AsyncItem<infer D, infer K> ? ItemState<D, K> : T extends AsyncQuery<infer D, infer K> ? QueryState<D, K> : never;

/** Use one or more data items or queries. */
export function useData<T extends Reference<Datas, string>>(ref: T): ReferenceReferenceState<T>;
export function useData<T extends Reference<Datas, string>>(ref: T | undefined): ReferenceReferenceState<T> | undefined;
export function useData<T extends ImmutableArray<Reference<Datas, string>>>(...refs: T): { [K in keyof T]: ReferenceReferenceState<T[K]> };
export function useData<T extends Datas, K extends DataKey<T>>(...refs: ImmutableArray<Reference<T, K>>): ImmutableArray<ReferenceState<T, K> | undefined> | ReferenceState<T, K> | undefined {
	const cache = useCache<ReferenceState<T, K>>();
	const states = mapArray(refs, _getReferenceState, cache);
	return useState(...states);
}

/** Get the corresponding `ItemState` or `QueryState` instance from the cache for a given `Item` or `Query`. */
function _getReferenceState<T extends Datas, K extends DataKey<T>>(ref: Reference<T, K>, cache: Map<string, ReferenceState<T, K>>): ReferenceState<T, K> | undefined {
	const key = ref?.toString();
	return ref && key ? cache.get(key) || setMapItem(cache, key, ref instanceof AsyncItem ? new ItemState(ref) : new QueryState(ref)) : undefined;
}
