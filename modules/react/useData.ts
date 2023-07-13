import type { AsyncQueryReference } from "../db/QueryReference.js";
import type { Data } from "../util/data.js";
import type { Optional } from "../util/optional.js";
import { AsyncItemReference } from "../db/ItemReference.js";
import { ItemState } from "../db/ItemState.js";
import { QueryState } from "../db/QueryState.js";
import { setMapItem } from "../util/map.js";
import { createCache } from "./createCache.js";
import { useState } from "./useState.js";

/** Create a cache. */
const { Cache, useCache } = createCache<ItemState | QueryState>();

export function useData<T extends Data>(ref: AsyncItemReference<T>): ItemState<T>;
export function useData<T extends Data>(ref: Optional<AsyncItemReference<T>>): ItemState<T> | undefined;
export function useData<T extends Data>(ref: AsyncQueryReference<T>): QueryState<T>;
export function useData<T extends Data>(ref: Optional<AsyncQueryReference<T>>): QueryState<T> | undefined;
export function useData(ref: Optional<AsyncItemReference | AsyncQueryReference>): ItemState | QueryState | undefined {
	const cache = useCache();
	const key = ref?.toString();
	const state = ref && key ? cache.get(key) || setMapItem(cache, key, ref instanceof AsyncItemReference ? new ItemState(ref) : new QueryState(ref)) : undefined;
	return useState(state);
}

/** Wrap components with `<DataProvider>` to allow the use of `useData()`. */
export const DataProvider = Cache;
