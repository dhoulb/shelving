import type { Data } from "../../util/data.js";
import { awaitDispose } from "../../util/dispose.js";
import type { Identifier, Item, Items, ItemsSequence, OptionalItem, OptionalItemSequence } from "../../util/item.js";
import type { Query } from "../../util/query.js";
import type { Sourceable } from "../../util/source.js";
import type { Updates } from "../../util/update.js";
import type { Collection } from "../collection/Collection.js";
import { DBProvider } from "./DBProvider.js";
import { MemoryDBProvider } from "./MemoryDBProvider.js";

/**
 * Database provider that keeps a copy of asynchronous remote data in a local synchronous cache.
 *
 * - Wraps a `source` provider and mirrors every read and write into an in-memory `MemoryDBProvider`, so subsequent reads can be served synchronously and live subscriptions stay seeded.
 * - Reads fetch from `source`, then refresh the cache; writes hit `source`, then mirror the change into the cache.
 * - Discover the cache from a wrapping layer with `getSource(CacheDBProvider, provider)` to seed stores from `.memory`.
 *
 * @see https://shelving.cc/db/CacheDBProvider
 */
export class CacheDBProvider<I extends Identifier, T extends Data> extends DBProvider<I, T> implements Sourceable<DBProvider<I, T>> {
	/**
	 * The wrapped source provider that data is fetched from and written to.
	 *
	 * @see https://shelving.cc/db/CacheDBProvider/source
	 */
	readonly source: DBProvider<I, T>;

	/**
	 * The in-memory provider holding the local synchronous cache of `source` data.
	 *
	 * @see https://shelving.cc/db/CacheDBProvider/memory
	 */
	readonly memory: MemoryDBProvider<I, T>;

	/**
	 * @param cache In-memory provider to use as the cache (a fresh `MemoryDBProvider` by default).
	 */
	constructor(source: DBProvider<I, T>, cache: MemoryDBProvider<I, T> = new MemoryDBProvider<I, T>()) {
		super();
		this.source = source;
		this.memory = cache;
	}

	/** Read from `source`, then refresh the cache. */
	override async getItem<II extends I, TT extends T>(collection: Collection<string, II, TT>, id: II): Promise<OptionalItem<II, TT>> {
		const item = await this.source.getItem(collection, id);
		const table = this.memory.getTable(collection);
		item ? table.setItem(id, item) : table.deleteItem(id);
		return item;
	}

	/** Mirror each emission into the cache. */
	override getItemSequence<II extends I, TT extends T>(collection: Collection<string, II, TT>, id: II): OptionalItemSequence<II, TT> {
		return this.memory.getTable(collection).setItemSequence(id, this.source.getItemSequence(collection, id));
	}

	/** Mirror the added item into the cache. */
	override async addItem<II extends I, TT extends T>(collection: Collection<string, II, TT>, data: TT): Promise<II> {
		const id = await this.source.addItem(collection, data);
		this.memory.getTable(collection).setItem(id, data);
		return id;
	}

	/** Mirror the set item into the cache. */
	override async setItem<II extends I, TT extends T>(collection: Collection<string, II, TT>, id: II, data: TT): Promise<void> {
		await this.source.setItem(collection, id, data);
		this.memory.getTable(collection).setItem(id, data);
	}

	/** Mirror the updates into the cache. */
	override async updateItem<II extends I, TT extends T>(
		collection: Collection<string, II, TT>,
		id: II,
		updates: Updates<Item<II, TT>>,
	): Promise<void> {
		await this.source.updateItem(collection, id, updates);
		this.memory.getTable(collection).updateItem(id, updates);
	}

	/** Remove the deleted item from the cache. */
	override async deleteItem<II extends I, TT extends T>(collection: Collection<string, II, TT>, id: II): Promise<void> {
		await this.source.deleteItem(collection, id);
		this.memory.getTable(collection).deleteItem(id);
	}

	override countQuery<II extends I, TT extends T>(collection: Collection<string, II, TT>, query?: Query<Item<II, TT>>): Promise<number> {
		return this.source.countQuery(collection, query);
	}

	/** Read from `source`, then refresh the cache. */
	override async getQuery<II extends I, TT extends T>(
		collection: Collection<string, II, TT>,
		query?: Query<Item<II, TT>>,
	): Promise<Items<II, TT>> {
		const items = await this.source.getQuery(collection, query);
		this.memory.getTable(collection).setItems(items);
		return items;
	}

	/** Mirror each emission into the cache. */
	override getQuerySequence<II extends I, TT extends T>(
		collection: Collection<string, II, TT>,
		query?: Query<Item<II, TT>>,
	): ItemsSequence<II, TT> {
		return this.memory.getTable(collection).setItemsSequence(this.source.getQuerySequence(collection, query));
	}

	/** Mirror the change into the cache. */
	override async setQuery<II extends I, TT extends T>(
		collection: Collection<string, II, TT>,
		query: Query<Item<II, TT>>,
		data: TT,
	): Promise<void> {
		await this.source.setQuery(collection, query, data);
		this.memory.getTable(collection).setQuery(query, data);
	}

	/** Mirror the updates into the cache. */
	override async updateQuery<II extends I, TT extends T>(
		collection: Collection<string, II, TT>,
		query: Query<Item<II, TT>>,
		updates: Updates<TT>,
	): Promise<void> {
		await this.source.updateQuery(collection, query, updates);
		this.memory.getTable(collection).updateQuery(query, updates);
	}

	/** Remove the deleted items from the cache. */
	override async deleteQuery<II extends I, TT extends T>(
		collection: Collection<string, II, TT>,
		query: Query<Item<II, TT>>,
	): Promise<void> {
		await this.source.deleteQuery(collection, query);
		this.memory.getTable(collection).deleteQuery(query);
	}

	// Implement `AsyncDisposable`
	override async [Symbol.asyncDispose]() {
		await awaitDispose(
			this.source, // Dispose the source API provider.
			this.memory, // Dispose the source API provider.
			super[Symbol.asyncDispose](), // Chain.
		);
	}
}
