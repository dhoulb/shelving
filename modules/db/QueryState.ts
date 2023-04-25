import type { ItemArray, ItemData, ItemValue } from "../db/Item.js";
import type { AsyncQuery, Query } from "../db/Query.js";
import type { MemoryTable } from "../provider/MemoryProvider.js";
import type { Data } from "../util/data.js";
import type { Stop } from "../util/function.js";
import { CacheProvider } from "../provider/CacheProvider.js";
import { LazyDeferredSequence } from "../sequence/LazyDeferredSequence.js";
import { BooleanState } from "../state/BooleanState.js";
import { State } from "../state/State.js";
import { getFirstItem, getLastItem, getOptionalFirstItem, getOptionalLastItem } from "../util/array.js";
import { getOptionalSource } from "../util/source.js";

/** Hold the current state of a query. */
export class QueryState<T extends Data = Data> extends State<ItemArray<T>> implements Iterable<ItemData<T>> {
	readonly ref: Query<T> | AsyncQuery<T>;
	readonly busy = new BooleanState();
	readonly limit: number;

	/** Can more items be loaded after the current result. */
	get hasMore(): boolean {
		return this._hasMore;
	}
	private _hasMore = false;

	/** Get the first document matched by this query or `null` if this query has no items. */
	get firstValue(): ItemValue<T> {
		return getOptionalFirstItem(this.value);
	}

	/** Get the first document matched by this query. */
	get firstData(): ItemData<T> {
		return getFirstItem(this.value);
	}

	/** Get the last document matched by this query or `null` if this query has no items. */
	get lastValue(): ItemValue<T> {
		return getOptionalLastItem(this.value);
	}

	/** Get the last document matched by this query. */
	get lastData(): ItemData<T> {
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

	constructor(ref: Query<T> | AsyncQuery<T>) {
		const { provider, collection, limit } = ref;
		const table = getOptionalSource(CacheProvider, provider)?.memory.getTable(collection) as MemoryTable<T>;
		const time = table ? table.getQueryTime(ref) : null;
		const isCached = typeof time === "number";
		super(table && isCached ? table.getQuery(ref) : State.NOVALUE, table ? new LazyDeferredSequence(() => this.from(table.getCachedQuerySequence(ref))) : undefined);
		this._time = time;
		this.ref = ref;
		this.limit = limit ?? Infinity;

		// Queue a request to refresh the value if it doesn't exist.
		if (this.loading) this.refresh();
	}

	/** Refresh this state from the source provider. */
	readonly refresh = (): void => {
		if (!this.busy.value) void this._refresh();
	};
	private async _refresh(): Promise<void> {
		this.busy.set(true);
		try {
			const items = await this.ref.value;
			this._hasMore = items.length >= this.limit; // If the query returned {limit} or more items, we can assume there are more items waiting to be queried.
			this.set(items);
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
	connectSource(): Stop {
		return this.from(this.ref);
	}

	/**
	 * Load more items after the last once.
	 * - Promise that needs to be handled.
	 */
	readonly loadMore = (): void => {
		if (!this.busy.value) void this._loadMore();
	};
	private async _loadMore(): Promise<void> {
		this.busy.set(true);
		try {
			const last = this.lastValue;
			const query = last ? this.ref.after(last) : this.ref;
			const items = await query.value;
			this.set([...this.value, ...items]);
			this._hasMore = items.length >= this.limit; // If the query returned {limit} or more items, we can assume there are more items waiting to be queried.
		} catch (thrown) {
			this.next.reject(thrown);
		} finally {
			this.busy.set(false);
		}
	}

	/** Iterate over the items. */
	[Symbol.iterator](): Iterator<ItemData<T>> {
		return this.value.values();
	}
}
