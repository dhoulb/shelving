import type { Unsubscribe } from "../observe/Observable.js";
import type { Key, Datas } from "../util/data.js";
import type { ItemArray, ItemValue, ItemData } from "../db/Item.js";
import { setMapItem } from "../util/map.js";
import { getFirstItem, getLastItem, getOptionalFirstItem, getOptionalLastItem } from "../util/array.js";
import { AsyncQuery, Query } from "../db/Query.js";
import { CacheProvider } from "../provider/CacheProvider.js";
import { getOptionalSourceProvider } from "../provider/ThroughProvider.js";
import { State } from "../state/State.js";
import { ConditionError } from "../error/ConditionError.js";
import { BooleanState } from "../state/BooleanState.js";
import { useSubscribe } from "./useSubscribe.js";
import { useCache } from "./useCache.js";

/** Hold the current state of a query. */
export class QueryState<T extends Datas, K extends Key<T>> extends State<ItemArray<T[K]>> {
	readonly ref: Query<T, K> | AsyncQuery<T, K>;
	readonly busy = new BooleanState();
	readonly limit: number;

	/** Can more items be loaded after the current result. */
	get hasMore(): boolean {
		return this._hasMore;
	}
	private _hasMore = false;

	/** Get the first document matched by this query or `null` if this query has no items. */
	get firstValue(): ItemValue<T[K]> {
		return getOptionalFirstItem(this.value);
	}

	/** Get the first document matched by this query. */
	get firstData(): ItemData<T[K]> {
		return getFirstItem(this.value);
	}

	/** Get the last document matched by this query or `null` if this query has no items. */
	get lastValue(): ItemValue<T[K]> {
		return getOptionalLastItem(this.value);
	}

	/** Get the last document matched by this query. */
	get lastData(): ItemData<T[K]> {
		return getLastItem(this.value);
	}

	/** Does the document have at least one result. */
	get exists(): boolean {
		return !!this.value.length;
	}

	/** Get the number of items matching this query. */
	get count(): number {
		return this.value.length;
	}

	constructor(ref: Query<T, K> | AsyncQuery<T, K>) {
		const table = getOptionalSourceProvider(ref.db.provider, CacheProvider)?.memory.getTable(ref.collection);
		const time = table ? table.getQueryTime(ref) : null;
		const isCached = typeof time === "number";
		super(table && isCached ? table.getQuery(ref) : State.NOVALUE);
		this._time = time;
		this.ref = ref;
		this.limit = ref.limit ?? Infinity;

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
			this._hasMore = result.length < this.limit;
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
		const table = getOptionalSourceProvider(this.ref.db.provider, CacheProvider)?.memory.getTable(this.ref.collection);
		return table && this.connect(() => table.subscribeCachedQuery(this.ref, this));
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

	/**
	 * Load more items after the last once.
	 * - Promise that needs to be handled.
	 */
	readonly loadMore = (): void => {
		if (this.closed) throw new ConditionError("State is closed");
		if (!this.busy.value) void this._loadMore();
	};
	async _loadMore(): Promise<void> {
		this.busy.next(true);
		try {
			const items = await this.ref.after(this.lastData).value;
			this.next([...this.value, ...items]);
			this._hasMore = items.length < this.limit;
		} catch (thrown) {
			this.error(thrown);
		} finally {
			this.busy.next(false);
		}
	}
}

/**
 * Use a query in a React component.
 * - Uses the default cache, so will error if not used inside `<Cache>`
 */
export function useQuery<T extends Datas, K extends Key<T>>(ref: Query<T, K> | AsyncQuery<T, K>): QueryState<T, K>;
export function useQuery<T extends Datas, K extends Key<T>>(ref?: Query<T, K> | AsyncQuery<T, K>): QueryState<T, K> | undefined;
export function useQuery<T extends Datas, K extends Key<T>>(ref?: Query<T, K> | AsyncQuery<T, K>): QueryState<T, K> | undefined {
	const cache = useCache();
	const key = ref?.toString();
	const state = ref && key ? cache.get(key) || setMapItem(cache, key, new QueryState(ref)) : undefined;
	useSubscribe(state);
	return state;
}
