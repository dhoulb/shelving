import { RequiredError } from "../../error/RequiredError.js";
import { ArrayStore } from "../../store/ArrayStore.js";
import { BooleanStore } from "../../store/BooleanStore.js";
import { getGetter } from "../../util/class.js";
import { NONE } from "../../util/constants.js";
import type { Data } from "../../util/data.js";
import type { Identifier, Item } from "../../util/item.js";
import { getAfterQuery, getQueryLimit, type Query } from "../../util/query.js";
import { runSequence } from "../../util/sequence.js";
import type { StopCallback } from "../../util/start.js";
import type { Collection } from "../collection/Collection.js";
import type { DBProvider } from "../provider/DBProvider.js";
import type { MemoryDBProvider } from "../provider/MemoryDBProvider.js";

/** Store a set of multiple items. */
export class QueryStore<I extends Identifier, T extends Data> extends ArrayStore<Item<I, T>> {
	readonly provider: DBProvider<I>;
	readonly collection: Collection<string, I, T>;
	readonly query: Query<Item<I, T>>;

	readonly busy = new BooleanStore();
	readonly limit: number;

	/** Can more items be loaded after the current result. */
	get hasMore(): boolean {
		return this._hasMore;
	}
	private _hasMore = false;

	/** Get the first item in this store. */
	override get first(): Item<I, T> {
		const first = this.optionalFirst;
		if (!first)
			throw new RequiredError(`First item does not exist in collection "${this.collection.name}"`, {
				store: this,
				provider: this.provider,
				collection: this.collection.name,
				query: this.query,
				caller: getGetter(this, "first"),
			});
		return first;
	}

	/** Get the last item in this store. */
	override get last(): Item<I, T> {
		const last = this.optionalLast;
		if (!last)
			throw new RequiredError(`Last item does not exist in collection "${this.collection.name}"`, {
				store: this,
				provider: this.provider,
				collection: this.collection.name,
				query: this.query,
				caller: getGetter(this, "first"),
			});
		return last;
	}

	constructor(collection: Collection<string, I, T>, query: Query<Item<I, T>>, provider: DBProvider<I>, memory?: MemoryDBProvider<I>) {
		const items = memory?.getTable(collection).getQuery(query);
		super(items ?? NONE); // Use the current memory snapshot if available.
		if (memory) this.starter = store => runSequence(store.through(memory.getQuerySequence(collection, query)));
		this.provider = provider;
		this.collection = collection;
		this.query = query;
		this.limit = getQueryLimit(query) ?? Number.POSITIVE_INFINITY;

		// Always refresh from source, even if memory supplied an initial value.
		this.refresh();
	}

	/** Refresh this store from the source provider. */
	refresh(provider: DBProvider<I> = this.provider): void {
		if (!this.busy.value) void this._refresh(provider);
	}
	private async _refresh(provider: DBProvider<I>): Promise<void> {
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
	connect(provider: DBProvider<I> = this.provider): StopCallback {
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
	override [Symbol.iterator](): Iterator<Item<I, T>> {
		return this.value.values();
	}
}
