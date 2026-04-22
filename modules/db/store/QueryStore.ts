import { RequiredError } from "../../error/RequiredError.js";
import { FetchStore } from "../../store/FetchStore.js";
import { getFirst, getLast } from "../../util/array.js";
import { getGetter } from "../../util/class.js";
import { NONE } from "../../util/constants.js";
import type { Data } from "../../util/data.js";
import type { Identifier, Item, Items } from "../../util/item.js";
import { getQueryLimit, type Query } from "../../util/query.js";
import { runSequence } from "../../util/sequence.js";
import type { Collection } from "../collection/Collection.js";
import type { DBProvider } from "../provider/DBProvider.js";
import type { MemoryDBProvider } from "../provider/MemoryDBProvider.js";

/** Store that queries multiple items in a collection from a database provider. */
export class QueryStore<I extends Identifier, T extends Data> extends FetchStore<Items<I, T>> {
	readonly provider: DBProvider<I>;
	readonly collection: Collection<string, I, T>;
	readonly query: Query<Item<I, T>>;
	get limit(): number {
		return getQueryLimit(this.query) ?? Number.POSITIVE_INFINITY;
	}

	/** Can more items be loaded after the current result. */
	get hasMore(): boolean {
		return this._hasMore;
	}
	private _hasMore = false;

	/** Get the first item in this store or `null` if this query has no items. */
	get optionalFirst(): Item<I, T> | undefined {
		return getFirst(this.value);
	}

	/** Get the last item in this store or `null` if this query has no items. */
	get optionalLast(): Item<I, T> | undefined {
		return getLast(this.value);
	}

	/** Get the first item in this store. */
	get first(): Item<I, T> {
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
	get last(): Item<I, T> {
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
	}

	// Override to fetch the result from the database provider.
	override _fetch(): Promise<Items<I, T>> {
		return this.provider.getQuery(this.collection, this.query);
	}

	/**
	 * Load more items after the last once.
	 * - Promise that needs to be handled.
	 * @todo Make this work.
	 */
	// fetchMore(): void {
	// 	if (!this.busy.value) void this._fetchMore();
	// }
	// private async _fetchMore(): Promise<void> {
	// 	this.busy.value = true;
	// 	this.reason = undefined; // Optimistically clear the error.
	// 	try {
	// 		const last = this.last;
	// 		const query = last ? getAfterQuery(this.query, last) : this.query;
	// 		const items = await this.provider.getQuery(this.collection, query);
	// 		this.value = [...this.value, ...items];
	// 		this._hasMore = items.length >= this.limit; // If the query returned {limit} or more items, we can assume there are more items waiting to be queried.
	// 	} catch (thrown) {
	// 		this.reason = thrown;
	// 	} finally {
	// 		this.busy.value = false;
	// 	}
	// }

	// Implement Iterable.
	[Symbol.iterator](): Iterator<Item<I, T>> {
		return this.value.values();
	}

	// Implement Disposable.
	override [Symbol.dispose]() {
		// @todo cancel inflight refreshes
		super[Symbol.dispose];
	}
}
