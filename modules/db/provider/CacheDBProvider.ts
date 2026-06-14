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
 * @example
 *  const provider = new CacheDBProvider(new FirestoreProvider());
 *  await provider.getItem(users, 123); // Fetches from source, then caches in memory.
 *
 * @see https://dhoulb.github.io/shelving/db/provider/CacheDBProvider/CacheDBProvider
 */
export class CacheDBProvider<I extends Identifier, T extends Data> extends DBProvider<I, T> implements Sourceable<DBProvider<I, T>> {
	/**
	 * The wrapped source provider that data is fetched from and written to.
	 *
	 * @see https://dhoulb.github.io/shelving/db/provider/CacheDBProvider/CacheDBProvider/source
	 */
	readonly source: DBProvider<I, T>;

	/**
	 * The in-memory provider holding the local synchronous cache of `source` data.
	 *
	 * @see https://dhoulb.github.io/shelving/db/provider/CacheDBProvider/CacheDBProvider/memory
	 */
	readonly memory: MemoryDBProvider<I, T>;

	/**
	 * Create a new `CacheDBProvider` wrapping a source provider.
	 *
	 * @param source The provider to fetch from and write to.
	 * @param cache In-memory provider to use as the cache (a fresh `MemoryDBProvider` by default).
	 */
	constructor(source: DBProvider<I, T>, cache: MemoryDBProvider<I, T> = new MemoryDBProvider<I, T>()) {
		super();
		this.source = source;
		this.memory = cache;
	}

	/**
	 * Get an item from `source` by its id, refreshing the cache, or `undefined` if it doesn't exist.
	 *
	 * @param collection Collection the item belongs to.
	 * @param id Identifier of the item to get.
	 * @returns The item, or `undefined` if no item exists with that id.
	 * @example await provider.getItem(users, 123) // Item or undefined.
	 * @see https://dhoulb.github.io/shelving/db/provider/CacheDBProvider/CacheDBProvider/getItem
	 */
	override async getItem<II extends I, TT extends T>(collection: Collection<string, II, TT>, id: II): Promise<OptionalItem<II, TT>> {
		const item = await this.source.getItem(collection, id);
		const table = this.memory.getTable(collection);
		item ? table.setItem(id, item) : table.deleteItem(id);
		return item;
	}

	/**
	 * Subscribe to live changes for a single item, mirroring each emission into the cache.
	 *
	 * @param collection Collection the item belongs to.
	 * @param id Identifier of the item to subscribe to.
	 * @returns Async sequence yielding the item (or `undefined`) on every change.
	 * @example for await (const item of provider.getItemSequence(users, 123)) console.log(item);
	 * @see https://dhoulb.github.io/shelving/db/provider/CacheDBProvider/CacheDBProvider/getItemSequence
	 */
	override getItemSequence<II extends I, TT extends T>(collection: Collection<string, II, TT>, id: II): OptionalItemSequence<II, TT> {
		return this.memory.getTable(collection).setItemSequence(id, this.source.getItemSequence(collection, id));
	}

	/**
	 * Add a new item to `source` and mirror it into the cache.
	 *
	 * @param collection Collection to add the item to.
	 * @param data Data for the new item.
	 * @returns The generated identifier for the new item.
	 * @example await provider.addItem(users, { name: "Dave" }) // 123
	 * @see https://dhoulb.github.io/shelving/db/provider/CacheDBProvider/CacheDBProvider/addItem
	 */
	override async addItem<II extends I, TT extends T>(collection: Collection<string, II, TT>, data: TT): Promise<II> {
		const id = await this.source.addItem(collection, data);
		this.memory.getTable(collection).setItem(id, data);
		return id;
	}

	/**
	 * Set (insert or overwrite) an item in `source` and mirror it into the cache.
	 *
	 * @param collection Collection the item belongs to.
	 * @param id Identifier of the item to set.
	 * @param data Full data to store for the item.
	 * @example await provider.setItem(users, 123, { name: "Dave" });
	 * @see https://dhoulb.github.io/shelving/db/provider/CacheDBProvider/CacheDBProvider/setItem
	 */
	override async setItem<II extends I, TT extends T>(collection: Collection<string, II, TT>, id: II, data: TT): Promise<void> {
		await this.source.setItem(collection, id, data);
		this.memory.getTable(collection).setItem(id, data);
	}

	/**
	 * Apply partial updates to an item in `source` and mirror them into the cache.
	 *
	 * @param collection Collection the item belongs to.
	 * @param id Identifier of the item to update.
	 * @param updates Updates to apply to the item.
	 * @example await provider.updateItem(users, 123, { name: "Dave" });
	 * @see https://dhoulb.github.io/shelving/db/provider/CacheDBProvider/CacheDBProvider/updateItem
	 */
	override async updateItem<II extends I, TT extends T>(
		collection: Collection<string, II, TT>,
		id: II,
		updates: Updates<Item<II, TT>>,
	): Promise<void> {
		await this.source.updateItem(collection, id, updates);
		this.memory.getTable(collection).updateItem(id, updates);
	}

	/**
	 * Delete an item from `source` and remove it from the cache.
	 *
	 * @param collection Collection the item belongs to.
	 * @param id Identifier of the item to delete.
	 * @example await provider.deleteItem(users, 123);
	 * @see https://dhoulb.github.io/shelving/db/provider/CacheDBProvider/CacheDBProvider/deleteItem
	 */
	override async deleteItem<II extends I, TT extends T>(collection: Collection<string, II, TT>, id: II): Promise<void> {
		await this.source.deleteItem(collection, id);
		this.memory.getTable(collection).deleteItem(id);
	}

	/**
	 * Count the items in `source` matching an optional query (not cached).
	 *
	 * @param collection Collection to count items in.
	 * @param query Query to filter the counted items (counts all items when omitted).
	 * @returns The number of matching items.
	 * @example await provider.countQuery(users, { age: 40 }) // 7
	 * @see https://dhoulb.github.io/shelving/db/provider/CacheDBProvider/CacheDBProvider/countQuery
	 */
	override countQuery<II extends I, TT extends T>(collection: Collection<string, II, TT>, query?: Query<Item<II, TT>>): Promise<number> {
		return this.source.countQuery(collection, query);
	}

	/**
	 * Get the items in `source` matching an optional query, refreshing the cache.
	 *
	 * @param collection Collection to query.
	 * @param query Query to filter, sort, and limit the items (returns all items when omitted).
	 * @returns An array of matching items.
	 * @example await provider.getQuery(users, { age: 40, $order: "name" }) // Items.
	 * @see https://dhoulb.github.io/shelving/db/provider/CacheDBProvider/CacheDBProvider/getQuery
	 */
	override async getQuery<II extends I, TT extends T>(
		collection: Collection<string, II, TT>,
		query?: Query<Item<II, TT>>,
	): Promise<Items<II, TT>> {
		const items = await this.source.getQuery(collection, query);
		this.memory.getTable(collection).setItems(items);
		return items;
	}

	/**
	 * Subscribe to live changes for a query, mirroring each emission into the cache.
	 *
	 * @param collection Collection to query.
	 * @param query Query to filter, sort, and limit the items.
	 * @returns Async sequence yielding the matching items on every change.
	 * @example for await (const items of provider.getQuerySequence(users, { age: 40 })) console.log(items);
	 * @see https://dhoulb.github.io/shelving/db/provider/CacheDBProvider/CacheDBProvider/getQuerySequence
	 */
	override getQuerySequence<II extends I, TT extends T>(
		collection: Collection<string, II, TT>,
		query?: Query<Item<II, TT>>,
	): ItemsSequence<II, TT> {
		return this.memory.getTable(collection).setItemsSequence(this.source.getQuerySequence(collection, query));
	}

	/**
	 * Set (overwrite) every item in `source` matching a query and mirror the change into the cache.
	 *
	 * @param collection Collection to write to.
	 * @param query Query selecting the items to set.
	 * @param data Full data to store for each matching item.
	 * @example await provider.setQuery(users, { age: 40 }, { active: true });
	 * @see https://dhoulb.github.io/shelving/db/provider/CacheDBProvider/CacheDBProvider/setQuery
	 */
	override async setQuery<II extends I, TT extends T>(
		collection: Collection<string, II, TT>,
		query: Query<Item<II, TT>>,
		data: TT,
	): Promise<void> {
		await this.source.setQuery(collection, query, data);
		this.memory.getTable(collection).setQuery(query, data);
	}

	/**
	 * Apply partial updates to every item in `source` matching a query and mirror them into the cache.
	 *
	 * @param collection Collection to write to.
	 * @param query Query selecting the items to update.
	 * @param updates Updates to apply to each matching item.
	 * @example await provider.updateQuery(users, { age: 40 }, { active: true });
	 * @see https://dhoulb.github.io/shelving/db/provider/CacheDBProvider/CacheDBProvider/updateQuery
	 */
	override async updateQuery<II extends I, TT extends T>(
		collection: Collection<string, II, TT>,
		query: Query<Item<II, TT>>,
		updates: Updates<TT>,
	): Promise<void> {
		await this.source.updateQuery(collection, query, updates);
		this.memory.getTable(collection).updateQuery(query, updates);
	}

	/**
	 * Delete every item in `source` matching a query and remove them from the cache.
	 *
	 * @param collection Collection to delete from.
	 * @param query Query selecting the items to delete.
	 * @example await provider.deleteQuery(users, { active: false });
	 * @see https://dhoulb.github.io/shelving/db/provider/CacheDBProvider/CacheDBProvider/deleteQuery
	 */
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
