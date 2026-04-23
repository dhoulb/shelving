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
 */
export class CollectionCache<I extends Identifier, T extends Data> implements AsyncDisposable {
	private readonly _items = new Map<I, ItemStore<I, T>>();
	private readonly _queries = new Map<string, QueryStore<I, T>>();

	readonly collection: Collection<string, I, T>;
	readonly provider: DBProvider<I>;
	readonly memory: MemoryDBProvider<I> | undefined;

	constructor(collection: Collection<string, I, T>, provider: DBProvider<I>, memory?: MemoryDBProvider<I>) {
		this.collection = collection;
		this.provider = provider;
		this.memory = memory;
	}

	/** Get (or create) the `ItemStore` for the given id. */
	getItem(id: I): ItemStore<I, T> {
		return this._items.get(id) || setMapItem(this._items, id, new ItemStore(this.collection, id, this.provider, this.memory));
	}

	/** Get (or create) the `QueryStore` for the given query. */
	getQuery(query: Query<Item<I, T>>): QueryStore<I, T> {
		const key = this._queryKey(query);
		return this._queries.get(key) || setMapItem(this._queries, key, new QueryStore(this.collection, query, this.provider, this.memory));
	}

	/** Refresh a specific item store. */
	async refreshItem(id: I): Promise<void> {
		await this._items.get(id)?.refresh();
	}

	/** Refresh every cached item store. */
	async refreshItems(): Promise<void> {
		await awaitValues(...this._items.values().map(store => store.refresh()));
	}

	/** Refresh a specific query store. */
	async refreshQuery(query: Query<Item<I, T>>): Promise<void> {
		await this._queries.get(this._queryKey(query))?.refresh();
	}

	/** Refresh every cached query store. */
	async refreshQueries(): Promise<void> {
		await awaitValues(...this._queries.values().map(store => store.refresh()));
	}

	/** Refresh every cached store (items and queries). */
	async refreshAll(): Promise<void> {
		await awaitValues(this.refreshItems(), this.refreshQueries());
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
