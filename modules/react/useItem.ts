import type { Unsubscribe } from "../observe/Observable.js";
import { Key, Datas, getData } from "../util/data.js";
import { getOptionalSource } from "../util/source.js";
import { setMapItem } from "../util/map.js";
import { ItemValue, ItemData, AsyncItem, Item } from "../db/Item.js";
import { CacheProvider } from "../provider/CacheProvider.js";
import { State } from "../state/State.js";
import { BooleanState } from "../state/BooleanState.js";
import { ConditionError } from "../error/ConditionError.js";
import { useSubscribe } from "./useSubscribe.js";
import { useCache } from "./useCache.js";

/** Hold the current state of a item. */
export class ItemState<T extends Datas, K extends Key<T>> extends State<ItemValue<T[K]>> {
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
		const table = getOptionalSource<CacheProvider<T>>(CacheProvider, ref.db.provider)?.memory.getTable(ref.collection);
		const time = table ? table.getItemTime(ref.id) : null;
		const isCached = typeof time === "number";
		super(table && isCached ? table.getItem(ref.id) : State.NOVALUE);
		this._time = time;
		this.ref = ref;

		// Queue a request to refresh the value if it doesn't exist.
		if (this.loading) this.refresh();
	}

	/** Refresh this state from the source provider. */
	readonly refresh = (): void => {
		if (this.closed) throw new ConditionError("State is closed");
		if (!this.busy.value) void this._refresh();
	};
	async _refresh(): Promise<void> {
		this.busy.next(true);
		try {
			const result = await this.ref.value;
			this.next(result);
		} catch (thrown) {
			this.error(thrown);
		} finally {
			this.busy.next(false);
		}
	}

	/** Refresh this state if data in the cache is older than `maxAge` (in milliseconds). */
	refreshStale(maxAge: number) {
		if (this.age > maxAge) this.refresh();
	}

	/** Subscribe this state to the source provider. */
	connectSource(): Unsubscribe {
		return this.connect(() => this.ref.subscribe({}));
	}

	/** Subscribe this state to any `CacheProvider` that exists in the provider chain. */
	connectCache(): Unsubscribe | void {
		const table = getOptionalSource(CacheProvider, this.ref.db.provider)?.memory.getTable(this.ref.collection);
		table && this.connect(() => table.subscribeCachedItem(this.ref.id, this));
	}

	// Override to subscribe to the cache when an observer is added.
	protected override _addFirstObserver(): void {
		this.connectCache();
	}

	// Override to unsubscribe from the cache when an observer is removed.
	protected override _removeLastObserver(): void {
		// Disconnect all sources.
		this.disconnect();
	}
}

/**
 * Use an item in a React component.
 * - Uses the default cache, so will error if not used inside `<Cache>`
 */
export function useItem<T extends Datas, K extends Key<T>>(ref: Item<T, K> | AsyncItem<T, K>): ItemState<T, K>;
export function useItem<T extends Datas, K extends Key<T>>(ref?: Item<T, K> | AsyncItem<T, K>): ItemState<T, K> | undefined;
export function useItem<T extends Datas, K extends Key<T>>(ref?: Item<T, K> | AsyncItem<T, K>): ItemState<T, K> | undefined {
	const cache = useCache();
	const key = ref?.toString();
	const state = ref && key ? cache.get(key) || setMapItem(cache, key, new ItemState(ref)) : undefined;
	useSubscribe(state);
	return state;
}
