import { RequiredError } from "../error/RequiredError.js";
import { ArrayStore } from "../store/ArrayStore.js";
import { BooleanStore } from "../store/BooleanStore.js";
import { getGetter } from "../util/class.js";
import { NONE } from "../util/constants.js";
import type { DataKey, Database } from "../util/data.js";
import type { Item, ItemQuery } from "../util/item.js";
import { getAfterQuery, getLimit } from "../util/query.js";
import { runSequence } from "../util/sequence.js";
import type { StopCallback } from "../util/start.js";
import type { MemoryProvider } from "./MemoryProvider.js";
import type { AbstractProvider } from "./Provider.js";

/** Store a set of multiple items. */
export class QueryStore<T extends Database, K extends DataKey<T>> extends ArrayStore<Item<T[K]>> {
	readonly provider: AbstractProvider<T>;
	readonly collection: K;
	readonly query: ItemQuery<T[K]>;
	readonly busy = new BooleanStore();
	readonly limit: number;

	/** Can more items be loaded after the current result. */
	get hasMore(): boolean {
		return this._hasMore;
	}
	private _hasMore = false;

	/** Get the first item in this store. */
	override get first(): Item<T[K]> {
		const first = this.optionalFirst;
		if (!first)
			throw new RequiredError(`First item does not exist in collection "${this.collection}"`, {
				store: this,
				provider: this.provider,
				collection: this.collection,
				query: this.query,
				caller: getGetter(this, "first"),
			});
		return first;
	}

	/** Get the last item in this store. */
	override get last(): Item<T[K]> {
		const last = this.optionalLast;
		if (!last)
			throw new RequiredError(`Last item does not exist in collection "${this.collection}"`, {
				store: this,
				provider: this.provider,
				collection: this.collection,
				query: this.query,
				caller: getGetter(this, "first"),
			});
		return last;
	}

	constructor(collection: K, query: ItemQuery<T[K]>, provider: AbstractProvider<T>, memory?: MemoryProvider<T>) {
		const time = memory?.getQueryTime(collection, query);
		const items = memory?.getQuery(collection, query) || [];
		super(typeof time === "number" || items.length ? items : NONE, time); // Use the value if it was definitely cached or is not empty.
		if (memory) this.starter = store => runSequence(store.through(memory.getCachedQuerySequence(collection, query)));
		this.provider = provider;
		this.collection = collection;
		this.query = query;
		this.limit = getLimit(query) ?? Number.POSITIVE_INFINITY;

		// Start loading the value from the provider if it is not definitely cached.
		if (typeof time !== "number") this.refresh();
	}

	/** Refresh this store from the source provider. */
	refresh(provider: AbstractProvider<T> = this.provider): void {
		if (!this.busy.value) void this._refresh(provider);
	}
	private async _refresh(provider: AbstractProvider<T>): Promise<void> {
		this.busy.value = true;
		this.reason = undefined; // Optimistically clear the error.
		try {
			const items = await provider.getQuery(this.collection, this.query);
			this._hasMore = items.length >= this.limit; // If the query returned {limit} or more items, we can assume there are more items waiting to be queried.
			this.value = items;
		} catch (thrown) {
			this.reason = thrown;
		} finally {
			this.busy.value = false;
		}
	}

	/** Refresh this store if data in the cache is older than `maxAge` (in milliseconds). */
	refreshStale(maxAge: number) {
		if (this.age > maxAge) this.refresh();
	}

	/** Subscribe this store to a provider. */
	connect(provider: AbstractProvider<T> = this.provider): StopCallback {
		return runSequence(this.through(provider.getQuerySequence(this.collection, this.query)));
	}

	/**
	 * Load more items after the last once.
	 * - Promise that needs to be handled.
	 */
	loadMore(): void {
		if (!this.busy.value) void this._loadMore();
	}
	private async _loadMore(): Promise<void> {
		this.busy.value = true;
		this.reason = undefined; // Optimistically clear the error.
		try {
			const last = this.last;
			const query = last ? getAfterQuery(this.query, last) : this.query;
			const items = await this.provider.getQuery(this.collection, query);
			this.value = [...this.value, ...items];
			this._hasMore = items.length >= this.limit; // If the query returned {limit} or more items, we can assume there are more items waiting to be queried.
		} catch (thrown) {
			this.reason = thrown;
		} finally {
			this.busy.value = false;
		}
	}

	// Implement `Iteratable`
	override [Symbol.iterator](): Iterator<Item<T[K]>> {
		return this.value.values();
	}
}
