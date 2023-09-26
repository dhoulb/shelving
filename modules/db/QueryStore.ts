import type { AbstractProvider } from "./Provider.js";
import type { StopCallback } from "../util/callback.js";
import type { DataKey, Database } from "../util/data.js";
import type { Item, ItemQuery, Items, OptionalItem } from "../util/item.js";
import { BooleanStore } from "../store/BooleanStore.js";
import { LazyStore } from "../store/LazyStore.js";
import { getFirstItem, getLastItem, getOptionalFirstItem, getOptionalLastItem } from "../util/array.js";
import { NONE } from "../util/constants.js";
import { BLACKHOLE } from "../util/function.js";
import { getAfterQuery, getLimit } from "../util/query.js";
import { runSequence } from "../util/sequence.js";
import { getOptionalSource } from "../util/source.js";
import { CacheProvider } from "./CacheProvider.js";

/** Store a set of multiple items. */
export class QueryStore<T extends Database, K extends DataKey<T>> extends LazyStore<Items<T[K]>> implements Iterable<Item<T[K]>> {
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

	/** Get the first item in this store or `null` if this query has no items. */
	get optionalFirst(): OptionalItem<T[K]> {
		return getOptionalFirstItem(this.value);
	}

	/** Get the last item in this store or `null` if this query has no items. */
	get optionalLast(): OptionalItem<T[K]> {
		return getOptionalLastItem(this.value);
	}

	/** Get the first item in this store. */
	get first(): Item<T[K]> {
		return getFirstItem(this.value);
	}

	/** Get the last item in this store. */
	get last(): Item<T[K]> {
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

	constructor(provider: AbstractProvider<T>, collection: K, query: ItemQuery<T[K]>) {
		const cache = getOptionalSource<CacheProvider<T>>(CacheProvider, provider);
		const time = cache?.getCachedQueryTime(collection, query);
		const value = cache?.getCachedQuery(collection, query) || NONE; // Always use any matching items currently in the cache (this might update when we call `refresh()` below).
		super(store => (cache ? runSequence(store.through(cache.getCachedQuerySequence(collection, query))) : BLACKHOLE), value, time);
		this.provider = provider;
		this.collection = collection;
		this.query = query;
		this.limit = getLimit(query) ?? Infinity;

		// Start loading the value from the provider if it doesn't exist.
		if (time === undefined) this.refresh();
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
	[Symbol.iterator](): Iterator<Item<T[K]>> {
		return this.value.values();
	}
}
