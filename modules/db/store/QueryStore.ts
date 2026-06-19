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

/**
 * Store that runs a query against a collection from a database provider and tracks its matching items.
 *
 * - Holds an `Items` value (the array of matching items) and is iterable over those items.
 * - Seeds from a `MemoryDBProvider` snapshot when available, and subscribes to realtime updates.
 *
 * @example
 *  const store = new QueryStore(collection, query, provider);
 *  for (const item of store) console.log(item);
 * @see https://dhoulb.github.io/shelving/db/store/QueryStore/QueryStore
 */
export class QueryStore<I extends Identifier, T extends Data> extends FetchStore<Items<I, T>> implements Iterable<Item<I, T>> {
	/**
	 * The database provider this store fetches its items from.
	 * @see https://dhoulb.github.io/shelving/db/store/QueryStore/QueryStore/provider
	 */
	readonly provider: DBProvider<I>;
	/**
	 * The collection the query runs against.
	 * @see https://dhoulb.github.io/shelving/db/store/QueryStore/QueryStore/collection
	 */
	readonly collection: Collection<string, I, T>;
	/**
	 * The query that selects the items tracked by this store.
	 * @see https://dhoulb.github.io/shelving/db/store/QueryStore/QueryStore/query
	 */
	readonly query: Query<Item<I, T>>;
	/**
	 * The maximum number of items the query can return, or `Infinity` if unlimited.
	 * @see https://dhoulb.github.io/shelving/db/store/QueryStore/QueryStore/limit
	 */
	get limit(): number {
		return getQueryLimit(this.query) ?? Number.POSITIVE_INFINITY;
	}

	/**
	 * Whether more items can be loaded after the current result.
	 * @see https://dhoulb.github.io/shelving/db/store/QueryStore/QueryStore/hasMore
	 */
	get hasMore(): boolean {
		return this._hasMore;
	}
	private _hasMore = false;

	/**
	 * The first item in this store, or `undefined` if the query has no items.
	 * @see https://dhoulb.github.io/shelving/db/store/QueryStore/QueryStore/optionalFirst
	 */
	get optionalFirst(): Item<I, T> | undefined {
		return getFirst(this.value);
	}

	/**
	 * The last item in this store, or `undefined` if the query has no items.
	 * @see https://dhoulb.github.io/shelving/db/store/QueryStore/QueryStore/optionalLast
	 */
	get optionalLast(): Item<I, T> | undefined {
		return getLast(this.value);
	}

	/**
	 * The first item in this store.
	 *
	 * @returns The first matching item including its ID.
	 * @throws {RequiredError} If the query has no items.
	 * @example store.first // Item<I, T>
	 * @see https://dhoulb.github.io/shelving/db/store/QueryStore/QueryStore/first
	 */
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

	/**
	 * The last item in this store.
	 *
	 * @returns The last matching item including its ID.
	 * @throws {RequiredError} If the query has no items.
	 * @example store.last // Item<I, T>
	 * @see https://dhoulb.github.io/shelving/db/store/QueryStore/QueryStore/last
	 */
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

	/**
	 * Create a store that tracks the items matching a query.
	 *
	 * @param collection The collection the query runs against.
	 * @param query The query that selects the items to track.
	 * @param provider The database provider to fetch the items from.
	 * @param memory Optional memory provider used to seed the initial value and drive realtime updates.
	 * @example new QueryStore(collection, query, provider)
	 */
	constructor(collection: Collection<string, I, T>, query: Query<Item<I, T>>, provider: DBProvider<I>, memory?: MemoryDBProvider<I>) {
		const items = memory?.getTable(collection).getQuery(query);
		super(items ?? NONE); // Use the current memory snapshot if available.
		if (memory) this.starter = store => runSequence(store.through(memory.getQuerySequence(collection, query)));
		this.provider = provider;
		this.collection = collection;
		this.query = query;
	}

	// Override to fetch the result from the database provider.
	override _fetch(_signal: AbortSignal): Promise<Items<I, T>> {
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

	// Implement `Iterable`
	[Symbol.iterator](): Iterator<Item<I, T>> {
		return this.value.values();
	}
}
