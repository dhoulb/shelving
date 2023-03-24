import type { AsyncItem, Item } from "../db/Item.js";
import { ItemState } from "../db/ItemState.js";
import { Datas, DataKey } from "../util/data.js";
import { setMapItem } from "../util/map.js";
import { useState } from "./useState.js";
import { useCache } from "./useCache.js";

/**
 * Use an item in a React component.
 * - Uses the default cache, so will error if not used inside `<Cache>`
 */
export function useItem<T extends Datas, K extends DataKey<T>>(ref: Item<T, K> | AsyncItem<T, K>): ItemState<T, K>;
export function useItem<T extends Datas, K extends DataKey<T>>(ref?: Item<T, K> | AsyncItem<T, K>): ItemState<T, K> | undefined;
export function useItem<T extends Datas, K extends DataKey<T>>(ref?: Item<T, K> | AsyncItem<T, K>): ItemState<T, K> | undefined {
	const cache = useCache<ItemState<T, K>>();
	const key = ref?.toString();
	const state = ref && key ? cache.get(key) || setMapItem(cache, key, new ItemState(ref)) : undefined;
	return useState(state);
}
