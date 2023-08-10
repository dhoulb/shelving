import type { AbstractProvider } from "../provider/Provider.js";
import type { ItemArray, ItemData, ItemQuery, ItemValue } from "../util/item.js";
import type { StopCallback } from "../util/callback.js";
import type { Data } from "../util/data.js";
import { CacheProvider } from "../provider/CacheProvider.js";
import { BooleanState } from "../state/BooleanState.js";
import { State } from "../state/State.js";
import { getOptionalFirstItem, getOptionalLastItem } from "../util/array.js";
import { call } from "../util/callback.js";
import { NONE } from "../util/constants.js";
import { getRequired } from "../util/optional.js";
import { getAfterQuery, getLimit } from "../util/query.js";
import { runSequence } from "../util/sequence.js";
import { getOptionalSource } from "../util/source.js";

/** Hold the current state of a query. */
export class QueryState<T extends Data = Data> extends State<ItemArray<T>> implements Iterable<ItemData<T>> {
	readonly provider: AbstractProvider;
	readonly collection: string;
	readonly query: ItemQuery<T>;
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
		return !!this.value.length;
	}

	/** Get the number of items matching this query. */
	get count(): number {
		return this.value.length;
	}

	constructor(provider: AbstractProvider, collection: string, query: ItemQuery<T>) {
		const memory = getOptionalSource(CacheProvider, provider)?.memory;
		const time = memory ? memory.getQueryTime(collection, query) : undefined;
		super(memory && typeof time === "number" ? memory.getQuery(collection, query) : NONE, time);
		this.provider = provider;
		this.collection = collection;
		this.query = query;
		this.limit = getLimit(query) ?? Infinity;

		// Queue a request to refresh the value if it doesn't exist.
		if (this.loading) this.refresh();
	}

	/** Refresh this state from the source provider. */
	refresh(provider: AbstractProvider = this.provider): void {
		if (!this.busy.value) void this._refresh(provider);
	}
	private async _refresh(provider: AbstractProvider): Promise<void> {
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

	/** Refresh this state if data in the cache is older than `maxAge` (in milliseconds). */
	refreshStale(maxAge: number) {
		if (this.age > maxAge) this.refresh();
	}

	/** Subscribe this state to a provider. */
	connect(provider: AbstractProvider = this.provider): StopCallback {
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
			this.value = [...this.items, ...items];
			this._hasMore = items.length >= this.limit; // If the query returned {limit} or more items, we can assume there are more items waiting to be queried.
		} catch (thrown) {
			this.reason = thrown;
		} finally {
			this.busy.value = false;
		}
	}

	// Override to subscribe to `MemoryProvider` while things are iterating over this state.
	override async *[Symbol.asyncIterator](): AsyncGenerator<ItemArray<T>, void, void> {
		this.start();
		this._iterating++;
		try {
			yield* super[Symbol.asyncIterator]();
		} finally {
			this._iterating--;
			if (this._iterating < 1) this.stop();
		}
	}
	private _iterating = 0;

	/** Start subscription to `MemoryProvider` if there is one. */
	start() {
		if (!this._stop) {
			const memory = getOptionalSource(CacheProvider, this.provider)?.memory;
			if (memory) this._stop = runSequence(this.through(memory.getCachedQuerySequence(this.collection, this.query)));
		}
	}
	/** Stop subscription to `MemoryProvider` if there is one. */
	stop() {
		if (this._stop) this._stop = void call(this._stop);
	}
	private _stop: StopCallback | undefined = undefined;

	// Implement `Disposable`
	[Symbol.dispose](): void {
		this.stop();
	}

	// Implement `Iteratable`
	[Symbol.iterator](): Iterator<ItemData<T>> {
		return this.value.values();
	}
}
