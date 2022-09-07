import type { ItemValue, ItemData, AsyncItem, Item } from "../db/Item.js";
import type { Dispatch } from "../util/function.js";
import { Datas, getData, Key } from "../util/data.js";
import { getOptionalSource } from "../util/source.js";
import { setMapItem } from "../util/map.js";
import { CacheProvider } from "../provider/CacheProvider.js";
import { State } from "../state/State.js";
import { BooleanState } from "../state/BooleanState.js";
import { LazyDeferredSequence } from "../sequence/LazyDeferredSequence.js";
import { useState } from "./useState.js";
import { useCache } from "./useCache.js";

/** Hold the current state of a item. */
export class ItemState<T extends Datas, K extends Key<T> = Key<T>> extends State<ItemValue<T[K]>> {
	readonly ref: Item<T, K> | AsyncItem<T, K>;
	readonly busy = new BooleanState();

	/** Get the data of the item (throws `RequiredError` if item doesn't exist). */
	get data(): ItemData<T[K]> {
		return getData(this.value);
	}

	/** Does the item exist (i.e. its value isn't `null`)? */
	get exists(): boolean {
		return !!this.value;
	}

	constructor(ref: Item<T, K> | AsyncItem<T, K>) {
		const { db, collection, id } = ref;
		const table = getOptionalSource<CacheProvider<T>>(CacheProvider, db.provider)?.memory.getTable(collection);
		const time = table ? table.getItemTime(id) : null;
		const isCached = typeof time === "number";
		super(table && isCached ? table.getItem(id) : State.NOVALUE, table ? new LazyDeferredSequence(() => this.connect(table.getCachedItemSequence(id))) : undefined);
		this._time = time;
		this.ref = ref;

		// Queue a request to refresh the value if it doesn't exist.
		if (this.loading) this.refresh();
	}

	/** Refresh this state from the source provider. */
	readonly refresh = (): void => {
		if (!this.busy.value) void this._refresh();
	};
	async _refresh(): Promise<void> {
		this.busy.set(true);
		try {
			this.set(await this.ref.value);
		} catch (thrown) {
			this.next.reject(thrown);
		} finally {
			this.busy.set(false);
		}
	}

	/** Refresh this state if data in the cache is older than `maxAge` (in milliseconds). */
	refreshStale(maxAge: number) {
		if (this.age > maxAge) this.refresh();
	}

	/** Subscribe this state to the source provider. */
	connectSource(): Dispatch {
		return this.connect(this.ref);
	}
}

/**
 * Use an item in a React component.
 * - Uses the default cache, so will error if not used inside `<Cache>`
 */
export function useItem<T extends Datas, K extends Key<T>>(ref: Item<T, K> | AsyncItem<T, K>): ItemState<T, K>;
export function useItem<T extends Datas, K extends Key<T>>(ref?: Item<T, K> | AsyncItem<T, K>): ItemState<T, K> | undefined;
export function useItem<T extends Datas, K extends Key<T>>(ref?: Item<T, K> | AsyncItem<T, K>): ItemState<T, K> | undefined {
	const cache = useCache<ItemState<T, K>>();
	const key = ref?.toString();
	const state = ref && key ? cache.get(key) || setMapItem(cache, key, new ItemState(ref)) : undefined;
	return useState(state);
}
