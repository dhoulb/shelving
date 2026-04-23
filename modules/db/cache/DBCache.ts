import type { Data } from "../../util/data.js";
import { awaitDispose } from "../../util/dispose.js";
import type { Identifier, Item } from "../../util/item.js";
import { setMapItem } from "../../util/map.js";
import type { Query } from "../../util/query.js";
import { getSource } from "../../util/source.js";
import type { Collection } from "../collection/Collection.js";
import { CacheDBProvider } from "../provider/CacheDBProvider.js";
import type { DBProvider } from "../provider/DBProvider.js";
import type { MemoryDBProvider } from "../provider/MemoryDBProvider.js";
import type { ItemStore } from "../store/ItemStore.js";
import type { QueryStore } from "../store/QueryStore.js";
import { CollectionCache } from "./CollectionCache.js";

/**
 * Cache of `CollectionCache` objects for multiple collections.
 * - Use `get(collection)` to retrieve or create the `CollectionCache` for a given collection,
 *   then `getItem(id)` / `getQuery(query)` on that to get a specific store.
 */
export class DBCache<I extends Identifier = Identifier, T extends Data = Data> implements AsyncDisposable {
	private readonly _collections = new Map<Collection<string, I, T>, CollectionCache<I, T>>();

	readonly provider: DBProvider<I, T>;
	readonly memory: MemoryDBProvider<I, T> | undefined;

	constructor(provider: DBProvider<I, T>) {
		this.provider = provider;
		// If the provider chain contains a `CacheDBProvider`, reuse its memory so we can seed stores synchronously.
		this.memory = getSource<CacheDBProvider<I, T>>(CacheDBProvider, provider)?.memory;
	}

	private _get<II extends I, TT extends T>(collection: Collection<string, II, TT>): CollectionCache<II, TT> | undefined;
	private _get(collection: Collection<string, I, T>): CollectionCache<I, T> | undefined {
		return this._collections.get(collection);
	}

	/** Get (or create) the `CollectionCache` for the given collection. */
	get<II extends I, TT extends T>(collection: Collection<string, II, TT>): CollectionCache<II, TT>;
	get(collection: Collection<string, I, T>): CollectionCache<I, T> {
		return this._get(collection) || setMapItem(this._collections, collection, new CollectionCache(collection, this.provider, this.memory));
	}

	/** Get (or create) an `ItemStore` for a collection/id in one hop. */
	getItem<II extends I, TT extends T>(collection: Collection<string, II, TT>, id: II): ItemStore<II, TT> {
		return this.get(collection).getItem(id);
	}

	/** Get (or create) a `QueryStore` for a collection/query in one hop. */
	getQuery<II extends I, TT extends T>(collection: Collection<string, II, TT>, query: Query<Item<II, TT>>): QueryStore<II, TT> {
		return this.get(collection).getQuery(query);
	}

	/** Refresh a specific item store for a collection. */
	async refreshItem<II extends I, TT extends T>(collection: Collection<string, II, TT>, id: II): Promise<void> {
		await this._get(collection)?.refreshItem(id);
	}

	/** Refresh every cached item store for a collection. */
	async refreshItems<II extends I, TT extends T>(collection: Collection<string, II, TT>): Promise<void> {
		await this._get(collection)?.refreshItems();
	}

	/** Refresh a specific query store for a collection. */
	async refreshQuery<II extends I, TT extends T>(collection: Collection<string, II, TT>, query: Query<Item<II, TT>>): Promise<void> {
		await this._get(collection)?.refreshQuery(query);
	}

	/** Refresh every cached query store for a collection. */
	async refreshQueries<II extends I, TT extends T>(collection: Collection<string, II, TT>): Promise<void> {
		await this._get(collection)?.refreshQueries();
	}

	/** Refresh every cached store (items and queries) for a collection. */
	async refreshAll<II extends I, TT extends T>(collection: Collection<string, II, TT>): Promise<void> {
		await this._get(collection)?.refreshAll();
	}

	// Implement `AsyncDisposable`
	async [Symbol.asyncDispose](): Promise<void> {
		return awaitDispose(
			...this._collections.values(), // Dispose all collections.
			() => this._collections.clear(), // Clear the collections.
		);
	}
}
