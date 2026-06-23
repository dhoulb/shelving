import { awaitValues } from "../../util/async.js";
import type { Data } from "../../util/data.js";
import { awaitDispose } from "../../util/dispose.js";
import type { Identifier, Item } from "../../util/item.js";
import { setMapItem } from "../../util/map.js";
import type { Query } from "../../util/query.js";
import type { Collection } from "../collection/Collection.js";
import type { DBProvider } from "../provider/DBProvider.js";
import type { MemoryDBProvider } from "../provider/MemoryDBProvider.js";
import { ItemStore } from "../store/ItemStore.js";
import { QueryStore } from "../store/QueryStore.js";

/**
 * Cache of `ItemStore` and `QueryStore` objects for a single collection.
 * - Use `getItem(id)` to retrieve or create the `ItemStore` for a given id.
 * - Use `getQuery(query)` to retrieve or create the `QueryStore` for a given query.
 *
 * @example
 *  const cache = new CollectionCache(collection, provider);
 *  const store = cache.getItem("abc");
 * @see https://shelving.cc/db/CollectionCache
 */
export class CollectionCache<I extends Identifier, T extends Data> implements AsyncDisposable {
	private readonly _items = new Map<I, ItemStore<I, T>>();
	private readonly _queries = new Map<string, QueryStore<I, T>>();

	/**
	 * The collection these cached stores belong to.
	 * @see https://shelving.cc/db/CollectionCache/collection
	 */
	readonly collection: Collection<string, I, T>;
	/**
	 * The database provider the cached stores fetch from.
	 * @see https://shelving.cc/db/CollectionCache/provider
	 */
	readonly provider: DBProvider<I>;
	/**
	 * Optional memory provider used to seed stores and drive realtime updates.
	 * @see https://shelving.cc/db/CollectionCache/memory
	 */
	readonly memory: MemoryDBProvider<I> | undefined;

	/**
	 * Create a cache of stores for a single collection.
	 *
	 * @param collection The collection to cache stores for.
	 * @param provider The database provider the stores fetch from.
	 * @param memory Optional memory provider used to seed stores and drive realtime updates.
	 * @example new CollectionCache(collection, provider)
	 */
	constructor(collection: Collection<string, I, T>, provider: DBProvider<I>, memory?: MemoryDBProvider<I>) {
		this.collection = collection;
		this.provider = provider;
		this.memory = memory;
	}

	/**
	 * Get (or create) the `ItemStore` for the given id.
	 *
	 * @param id The ID of the item to get a store for.
	 * @returns The cached (or newly created) `ItemStore` for the id.
	 * @example cache.getItem("abc")
	 * @see https://shelving.cc/db/CollectionCache/getItem
	 */
	getItem(id: I): ItemStore<I, T> {
		return this._items.get(id) || setMapItem(this._items, id, new ItemStore(this.collection, id, this.provider, this.memory));
	}

	/**
	 * Get (or create) the `QueryStore` for the given query.
	 *
	 * @param query The query to get a store for.
	 * @returns The cached (or newly created) `QueryStore` for the query.
	 * @example cache.getQuery(query)
	 * @see https://shelving.cc/db/CollectionCache/getQuery
	 */
	getQuery(query: Query<Item<I, T>>): QueryStore<I, T> {
		const key = this._queryKey(query);
		return this._queries.get(key) || setMapItem(this._queries, key, new QueryStore(this.collection, query, this.provider, this.memory));
	}

	/**
	 * Refresh a specific item store.
	 *
	 * @param id The ID of the item store to refresh.
	 * @param maxAge Maximum age in milliseconds of cached data that may be reused instead of refetching.
	 * @returns Promise that resolves once the refresh has completed.
	 * @example await cache.refreshItem("abc")
	 * @see https://shelving.cc/db/CollectionCache/refreshItem
	 */
	async refreshItem(id: I, maxAge?: number): Promise<void> {
		await this._items.get(id)?.refresh(maxAge);
	}

	/**
	 * Refresh every cached item store.
	 *
	 * @param maxAge Maximum age in milliseconds of cached data that may be reused instead of refetching.
	 * @returns Promise that resolves once every item store has refreshed.
	 * @example await cache.refreshItems()
	 * @see https://shelving.cc/db/CollectionCache/refreshItems
	 */
	async refreshItems(maxAge?: number): Promise<void> {
		await awaitValues(...this._items.values().map(store => store.refresh(maxAge)));
	}

	/**
	 * Refresh a specific query store.
	 *
	 * @param query The query whose store should be refreshed.
	 * @param maxAge Maximum age in milliseconds of cached data that may be reused instead of refetching.
	 * @returns Promise that resolves once the refresh has completed.
	 * @example await cache.refreshQuery(query)
	 * @see https://shelving.cc/db/CollectionCache/refreshQuery
	 */
	async refreshQuery(query: Query<Item<I, T>>, maxAge?: number): Promise<void> {
		await this._queries.get(this._queryKey(query))?.refresh(maxAge);
	}

	/**
	 * Refresh every cached query store.
	 *
	 * @param maxAge Maximum age in milliseconds of cached data that may be reused instead of refetching.
	 * @returns Promise that resolves once every query store has refreshed.
	 * @example await cache.refreshQueries()
	 * @see https://shelving.cc/db/CollectionCache/refreshQueries
	 */
	async refreshQueries(maxAge?: number): Promise<void> {
		await awaitValues(...this._queries.values().map(store => store.refresh(maxAge)));
	}

	/**
	 * Refresh every cached store (items and queries).
	 *
	 * @param maxAge Maximum age in milliseconds of cached data that may be reused instead of refetching.
	 * @returns Promise that resolves once every store has refreshed.
	 * @example await cache.refreshAll()
	 * @see https://shelving.cc/db/CollectionCache/refreshAll
	 */
	async refreshAll(maxAge?: number): Promise<void> {
		await awaitValues(this.refreshItems(maxAge), this.refreshQueries(maxAge));
	}

	private _queryKey(query: Query<Item<I, T>>): string {
		return JSON.stringify(query);
	}

	// Implement `AsyncDisposable`
	[Symbol.asyncDispose](): Promise<void> {
		return awaitDispose(
			...this._items.values(), // Dispose all items.
			...this._queries.values(), // Dispose all queries.
			() => this._items.clear(), // Clear the items.
			() => this._queries.clear(), // Clear the queries.
		);
	}
}
