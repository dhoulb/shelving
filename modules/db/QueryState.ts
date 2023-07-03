import type { ItemArray, ItemData, ItemValue } from "./ItemReference.js";
import type { AsyncQueryReference, QueryReference } from "./QueryReference.js";
import type { MemoryTable } from "../provider/MemoryProvider.js";
import type { StopCallback } from "../util/callback.js";
import type { Data } from "../util/data.js";
import { CacheProvider } from "../provider/CacheProvider.js";
import { SwitchingDeferredSequence } from "../sequence/SwitchingDeferredSequence.js";
import { BooleanState } from "../state/BooleanState.js";
import { State } from "../state/State.js";
import { getOptionalFirstItem, getOptionalLastItem } from "../util/array.js";
import { getRequired } from "../util/null.js";
import { getAfterQuery, getLimit } from "../util/query.js";
import { getOptionalSource } from "../util/source.js";

/** Hold the current state of a query. */
export class QueryState<T extends Data = Data> extends State<ItemArray<T>> implements Iterable<ItemData<T>> {
	readonly ref: QueryReference<T> | AsyncQueryReference<T>;
	readonly busy = new BooleanState();
	readonly limit: number;

	/** Can more items be loaded after the current result. */
	get hasMore(): boolean {
		return this._hasMore;
	}
	private _hasMore = false;

	/** Get the items currently stored in this query. */
	get items(): ItemArray<T> {
		return this.value;
	}

	/** Get the first document matched by this query or `null` if this query has no items. */
	get first(): ItemValue<T> {
		return getOptionalFirstItem(this.value);
	}

	/** Get the last document matched by this query or `null` if this query has no items. */
	get last(): ItemValue<T> {
		return getOptionalLastItem(this.value);
	}

	/** Get the first document matched by this query. */
	get data(): ItemData<T> {
		return getRequired(this.first);
	}

	/** Does the document have at least one result. */
	get exists(): boolean {
		return !this.loading && !!this.value.length;
	}

	/** Get the number of items matching this query. */
	get count(): number {
		return this.value.length;
	}

	constructor(ref: QueryReference<T> | AsyncQueryReference<T>) {
		const { provider, collection, query } = ref;
		const table = getOptionalSource(CacheProvider, provider)?.memory.getTable(collection) as MemoryTable<T> | undefined;
		const time = table ? table.getQueryTime(ref) : null;
		const next = table ? new SwitchingDeferredSequence<ItemArray<T>>(sequence => sequence.from(table.getCachedQuerySequence(ref))) : undefined;
		super(table && typeof time === "number" ? { value: table.getQuery(ref), time, next } : { next });
		this.ref = ref;
		this.limit = getLimit(query) ?? Infinity;

		// Queue a request to refresh the value if it doesn't exist.
		if (this.loading) this.refresh();
	}

	/** Refresh this state from the source provider. */
	readonly refresh = (): void => {
		if (!this.busy.value) void this._refresh();
	};
	private async _refresh(): Promise<void> {
		this.busy.value = true;
		this.reason = undefined; // Optimistically clear the error.
		try {
			const items = await this.ref.items;
			this._hasMore = items.length >= this.limit; // If the query returned {limit} or more items, we can assume there are more items waiting to be queried.
			this.value = items;
		} catch (thrown) {
			this.reason = thrown;
		} finally {
			this.busy.value = false;
		}
	}

	/** Refresh this state if data in the cache is older than `maxAge` (in milliseconds). */
	refreshStale(maxAge: number) {
		if (this.age > maxAge) this.refresh();
	}

	/** Subscribe this state to the source provider. */
	connectSource(): StopCallback {
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
		this.busy.value = true;
		this.reason = undefined; // Optimistically clear the error.
		try {
			const last = this.last;
			const ref = last ? this.ref.with(getAfterQuery(this.ref.query, last)) : this.ref;
			const items = await ref.items;
			this.value = [...this.items, ...items];
			this._hasMore = items.length >= this.limit; // If the query returned {limit} or more items, we can assume there are more items waiting to be queried.
		} catch (thrown) {
			this.reason = thrown;
		} finally {
			this.busy.value = false;
		}
	}

	/** Iterate over the items. */
	[Symbol.iterator](): Iterator<ItemData<T>> {
		return this.value.values();
	}
}
