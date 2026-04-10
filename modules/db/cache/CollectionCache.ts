import type { Data } from "../../util/data.js";
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
export class CollectionCache<I extends Identifier, T extends Data> implements Disposable {
	private readonly _items = new Map<string, ItemStore<I, T>>();
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
		const key = String(id);
		return this._items.get(key) || setMapItem(this._items, key, new ItemStore(this.collection, id, this.provider, this.memory));
	}

	/** Get (or create) the `QueryStore` for the given query. */
	getQuery(query: Query<Item<I, T>>): QueryStore<I, T> {
		const key = this._queryKey(query);
		return this._queries.get(key) || setMapItem(this._queries, key, new QueryStore(this.collection, query, this.provider, this.memory));
	}

	/** Refresh a specific item store. */
	refreshItem(id: I): void {
		this._items.get(String(id))?.refresh();
	}

	/** Refresh every cached item store. */
	refreshItems(): void {
		for (const store of this._items.values()) store.refresh();
	}

	/** Refresh a specific query store. */
	refreshQuery(query: Query<Item<I, T>>): void {
		this._queries.get(this._queryKey(query))?.refresh();
	}

	/** Refresh every cached query store. */
	refreshQueries(): void {
		for (const store of this._queries.values()) store.refresh();
	}

	/** Refresh every cached store (items and queries). */
	refreshAll(): void {
		this.refreshItems();
		this.refreshQueries();
	}

	private _queryKey(query: Query<Item<I, T>>): string {
		return JSON.stringify(query);
	}

	// Implement Disposable.
	[Symbol.dispose](): void {
		// Note: `ItemStore`/`QueryStore` are not themselves `Disposable`, so we only drop references.
		this._items.clear();
		this._queries.clear();
	}
}
