import { StringSchema } from "../../schema/StringSchema.js";
import { DeferredSequence } from "../../sequence/DeferredSequence.js";
import { requireArray } from "../../util/array.js";
import type { Data } from "../../util/data.js";
import { isArrayEqual } from "../../util/equal.js";
import type { Identifier, Item, Items, ItemsSequence, OptionalItem, OptionalItemSequence } from "../../util/item.js";
import { getItem } from "../../util/item.js";
import { countItems } from "../../util/iterate.js";
import type { Query } from "../../util/query.js";
import { queryItems, queryWritableItems } from "../../util/query.js";
import { getRandom, getRandomKey } from "../../util/random.js";
import type { Updates } from "../../util/update.js";
import { updateData } from "../../util/update.js";
import type { Collection } from "../collection/Collection.js";
import { DBProvider } from "./DBProvider.js";

/**
 * Synchronous in-memory database provider, storing each collection in a `MemoryTable`.
 *
 * - Extremely fast (ideal as the cache behind `CacheDBProvider`!), but does not persist data after the process or browser window closes.
 * - Identity-preserving: `getItem()` etc. return the exact same object instance that was passed into `setItem()`.
 * - Supports live subscriptions, so it can back `ItemStore` / `QueryStore` reads.
 *
 * @example
 *  const provider = new MemoryDBProvider();
 *  const id = await provider.addItem(users, { name: "Dave" });
 *
 * @see https://shelving.cc/db/MemoryDBProvider
 */
export class MemoryDBProvider<I extends Identifier = Identifier, T extends Data = Data> extends DBProvider<I, T> {
	/** List of tables in `{ name: MemoryTable }` format. */
	private _tables: { [K in string]?: MemoryTable<I, T> } = {};

	/**
	 * Get (or lazily create) the `MemoryTable` backing a collection.
	 *
	 * @param collection Collection to get the table for.
	 * @returns The `MemoryTable` holding that collection's items.
	 * @example provider.getTable(users) // MemoryTable
	 * @see https://shelving.cc/db/MemoryDBProvider/getTable
	 */
	getTable<II extends I, TT extends T>(collection: Collection<string, II, TT>): MemoryTable<II, TT> {
		return ((this._tables[collection.name] as MemoryTable<II, TT>) ||= new MemoryTable<II, TT>(collection));
	}

	/**
	 * Get an item from its collection's table by id, or `undefined` if it doesn't exist.
	 *
	 * @param collection Collection the item belongs to.
	 * @param id Identifier of the item to get.
	 * @returns The item, or `undefined` if no item exists with that id.
	 * @example await provider.getItem(users, 123) // Item or undefined.
	 * @see https://shelving.cc/db/MemoryDBProvider/getItem
	 */
	override async getItem<II extends I, TT extends T>(collection: Collection<string, II, TT>, id: II): Promise<OptionalItem<II, TT>> {
		return this.getTable(collection).getItem(id);
	}

	/**
	 * Subscribe to live changes for a single item by its id.
	 *
	 * @param collection Collection the item belongs to.
	 * @param id Identifier of the item to subscribe to.
	 * @returns Async sequence yielding the item (or `undefined`) on every change.
	 * @example for await (const item of provider.getItemSequence(users, 123)) console.log(item);
	 * @see https://shelving.cc/db/MemoryDBProvider/getItemSequence
	 */
	override async *getItemSequence<II extends I, TT extends T>(
		collection: Collection<string, II, TT>,
		id: II,
	): OptionalItemSequence<II, TT> {
		yield* this.getTable(collection).getItemSequence(id);
	}

	/**
	 * Add a new item to a collection and return its generated id.
	 *
	 * @param collection Collection to add the item to.
	 * @param data Data for the new item.
	 * @returns The generated identifier for the new item.
	 * @example await provider.addItem(users, { name: "Dave" }) // 123
	 * @see https://shelving.cc/db/MemoryDBProvider/addItem
	 */
	override async addItem<II extends I, TT extends T>(collection: Collection<string, II, TT>, data: TT): Promise<II> {
		return this.getTable(collection).addItem(data);
	}

	/**
	 * Set (insert or overwrite) the data for an item by its id.
	 *
	 * @param collection Collection the item belongs to.
	 * @param id Identifier of the item to set.
	 * @param data Full data to store for the item.
	 * @example await provider.setItem(users, 123, { name: "Dave" });
	 * @see https://shelving.cc/db/MemoryDBProvider/setItem
	 */
	override async setItem<II extends I, TT extends T>(collection: Collection<string, II, TT>, id: II, data: TT): Promise<void> {
		this.getTable(collection).setItem(id, data);
	}

	/**
	 * Apply partial updates to an existing item by its id.
	 *
	 * @param collection Collection the item belongs to.
	 * @param id Identifier of the item to update.
	 * @param updates Updates to apply to the item.
	 * @example await provider.updateItem(users, 123, { name: "Dave" });
	 * @see https://shelving.cc/db/MemoryDBProvider/updateItem
	 */
	override async updateItem<II extends I, TT extends T>(
		collection: Collection<string, II, TT>,
		id: II,
		updates: Updates<Item<II, TT>>,
	): Promise<void> {
		this.getTable(collection).updateItem(id, updates);
	}

	/**
	 * Delete an item from a collection by its id.
	 *
	 * @param collection Collection the item belongs to.
	 * @param id Identifier of the item to delete.
	 * @example await provider.deleteItem(users, 123);
	 * @see https://shelving.cc/db/MemoryDBProvider/deleteItem
	 */
	override async deleteItem<II extends I, TT extends T>(collection: Collection<string, II, TT>, id: II): Promise<void> {
		this.getTable(collection).deleteItem(id);
	}

	/**
	 * Count the items in a collection matching an optional query.
	 *
	 * @param collection Collection to count items in.
	 * @param query Query to filter the counted items (counts all items when omitted).
	 * @returns The number of matching items.
	 * @example await provider.countQuery(users, { age: 40 }) // 7
	 * @see https://shelving.cc/db/MemoryDBProvider/countQuery
	 */
	override async countQuery<II extends I, TT extends T>(
		collection: Collection<string, II, TT>,
		query?: Query<Item<II, TT>>,
	): Promise<number> {
		return this.getTable(collection).countQuery(query);
	}

	/**
	 * Get the items in a collection matching an optional query.
	 *
	 * @param collection Collection to query.
	 * @param query Query to filter, sort, and limit the items (returns all items when omitted).
	 * @returns An array of matching items.
	 * @example await provider.getQuery(users, { age: 40, $order: "name" }) // Items.
	 * @see https://shelving.cc/db/MemoryDBProvider/getQuery
	 */
	override async getQuery<II extends I, TT extends T>(
		collection: Collection<string, II, TT>,
		query?: Query<Item<II, TT>>,
	): Promise<Items<II, TT>> {
		return this.getTable(collection).getQuery(query);
	}

	/**
	 * Subscribe to live changes for the result of a query.
	 *
	 * @param collection Collection to query.
	 * @param query Query to filter, sort, and limit the items.
	 * @returns Async sequence yielding the matching items on every change.
	 * @example for await (const items of provider.getQuerySequence(users, { age: 40 })) console.log(items);
	 * @see https://shelving.cc/db/MemoryDBProvider/getQuerySequence
	 */
	override async *getQuerySequence<II extends I, TT extends T>(
		collection: Collection<string, II, TT>,
		query?: Query<Item<II, TT>>,
	): ItemsSequence<II, TT> {
		return yield* this.getTable(collection).getQuerySequence(query);
	}

	/**
	 * Set (overwrite) the data for every item matching a query.
	 *
	 * @param collection Collection to write to.
	 * @param query Query selecting the items to set.
	 * @param data Full data to store for each matching item.
	 * @example await provider.setQuery(users, { age: 40 }, { active: true });
	 * @see https://shelving.cc/db/MemoryDBProvider/setQuery
	 */
	override async setQuery<II extends I, TT extends T>(
		collection: Collection<string, II, TT>,
		query: Query<Item<II, TT>>,
		data: TT,
	): Promise<void> {
		this.getTable(collection).setQuery(query, data);
	}

	/**
	 * Apply partial updates to every item matching a query.
	 *
	 * @param collection Collection to write to.
	 * @param query Query selecting the items to update.
	 * @param updates Updates to apply to each matching item.
	 * @example await provider.updateQuery(users, { age: 40 }, { active: true });
	 * @see https://shelving.cc/db/MemoryDBProvider/updateQuery
	 */
	override async updateQuery<II extends I, TT extends T>(
		collection: Collection<string, II, TT>,
		query: Query<Item<II, TT>>,
		updates: Updates<TT>,
	): Promise<void> {
		this.getTable(collection).updateQuery(query, updates);
	}

	/**
	 * Delete every item matching a query.
	 *
	 * @param collection Collection to delete from.
	 * @param query Query selecting the items to delete.
	 * @example await provider.deleteQuery(users, { active: false });
	 * @see https://shelving.cc/db/MemoryDBProvider/deleteQuery
	 */
	override async deleteQuery<II extends I, TT extends T>(
		collection: Collection<string, II, TT>,
		query: Query<Item<II, TT>>,
	): Promise<void> {
		this.getTable(collection).deleteQuery(query);
	}

	/**
	 * Set (insert or overwrite) several whole items in a collection at once.
	 *
	 * @param collection Collection to write to.
	 * @param items Items (each with its own id) to store.
	 * @example provider.setItems(users, [{ id: 123, name: "Dave" }]);
	 * @see https://shelving.cc/db/MemoryDBProvider/setItems
	 */
	setItems<II extends I, TT extends T>(collection: Collection<string, II, TT>, items: Items<II, TT>): void {
		this.getTable(collection).setItems(items);
	}
}

/**
 * In-memory table holding the items of a single collection for a `MemoryDBProvider`.
 *
 * - Keys items by id in a `Map`, preserving the exact object instance passed in.
 * - Exposes a `next` `DeferredSequence` that resolves on every change, powering the live `*Sequence` subscriptions.
 *
 * @example
 *  const table = provider.getTable(users);
 *  table.setItem(123, { name: "Dave" });
 *
 * @see https://shelving.cc/db/MemoryTable
 */
export class MemoryTable<I extends Identifier, T extends Data> {
	/** Actual data in this table. */
	protected readonly _data = new Map<I, Item<I, T>>();

	/**
	 * Deferred sequence that resolves on every change to this table.
	 *
	 * @see https://shelving.cc/db/MemoryTable/next
	 */
	public readonly next = new DeferredSequence();

	/**
	 * Collection this table stores the items of.
	 *
	 * @see https://shelving.cc/db/MemoryTable/collection
	 */
	readonly collection: Collection<string, I, T>;

	/**
	 * Create a new `MemoryTable` for a collection.
	 *
	 * @param collection Collection this table holds the items of.
	 */
	constructor(collection: Collection<string, I, T>) {
		this.collection = collection;
	}

	/**
	 * Get an item by its id, or `undefined` if it doesn't exist.
	 *
	 * @param id Identifier of the item to get.
	 * @returns The item, or `undefined` if no item exists with that id.
	 * @example table.getItem(123) // Item or undefined.
	 * @see https://shelving.cc/db/MemoryTable/getItem
	 */
	getItem(id: I): OptionalItem<I, T> {
		return this._data.get(id);
	}

	/**
	 * Subscribe to all changes for this item key.
	 * - Emits the current item immediately, including `undefined` when absent.
	 * - Wakes on every table change, but only yields when this item's value actually changed.
	 *
	 * @param id Identifier of the item to subscribe to.
	 * @returns Async sequence yielding the item (or `undefined`) on every change.
	 * @example for await (const item of table.getItemSequence(123)) console.log(item);
	 * @see https://shelving.cc/db/MemoryTable/getItemSequence
	 */
	async *getItemSequence(id: I): AsyncIterable<OptionalItem<I, T>> {
		let lastValue = this.getItem(id);
		yield lastValue;
		while (true) {
			await this.next;
			const nextValue = this.getItem(id);
			if (nextValue !== lastValue) {
				yield nextValue;
				lastValue = nextValue;
			}
		}
	}

	/**
	 * Generate a unique id for a new item in this table.
	 * - Uses a random string for `StringSchema` ids, otherwise a random number, regenerating until it doesn't collide.
	 *
	 * @returns An id that no existing item in this table uses.
	 * @example table.generateUniqueID() // 4827193 (or a random string)
	 * @see https://shelving.cc/db/MemoryTable/generateUniqueID
	 */
	generateUniqueID(): I {
		const gen = (this.collection.id instanceof StringSchema ? getRandomKey : getRandom) as () => I;
		let id = gen();
		while (this._data.has(id)) id = gen(); // Regenerate ID until unique.
		return id;
	}

	/**
	 * Add a new item with a freshly generated unique id.
	 *
	 * @param data Data for the new item.
	 * @returns The generated identifier for the new item.
	 * @example table.addItem({ name: "Dave" }) // 123
	 * @see https://shelving.cc/db/MemoryTable/addItem
	 */
	addItem(data: T): I {
		const id = this.generateUniqueID();
		this.setItem(id, data);
		return id;
	}

	/**
	 * Set (insert or overwrite) an item by its id.
	 * - Only resolves `next` when the stored instance actually changes.
	 *
	 * @param id Identifier of the item to set.
	 * @param data Full item, or data to combine with `id` into an item.
	 * @example table.setItem(123, { name: "Dave" });
	 * @see https://shelving.cc/db/MemoryTable/setItem
	 */
	setItem(id: I, data: Item<I, T> | T): void {
		const item = getItem(id, data);
		if (this._data.get(id) !== item) {
			this._data.set(id, item);
			this.next.resolve();
		}
	}

	/**
	 * Mirror an async sequence of item values into this table, passing each value through.
	 * - Sets the item when a value arrives, or deletes it when the value is `undefined`.
	 *
	 * @param id Identifier of the item the sequence applies to.
	 * @param sequence Source sequence of item values (or `undefined`) to mirror.
	 * @returns Async sequence yielding each value after it has been mirrored.
	 * @example for await (const item of table.setItemSequence(123, source)) console.log(item);
	 * @see https://shelving.cc/db/MemoryTable/setItemSequence
	 */
	async *setItemSequence(id: I, sequence: AsyncIterable<OptionalItem<I, T>>): AsyncIterable<OptionalItem<I, T>> {
		for await (const item of sequence) {
			item ? this.setItem(id, item) : this.deleteItem(id);
			yield item;
		}
	}

	/**
	 * Apply partial updates to an existing item by its id.
	 * - Does nothing if no item exists with that id.
	 *
	 * @param id Identifier of the item to update.
	 * @param updates Updates to apply to the item.
	 * @example table.updateItem(123, { name: "Dave" });
	 * @see https://shelving.cc/db/MemoryTable/updateItem
	 */
	updateItem(id: I, updates: Updates<Item<I, T>>): void {
		const oldItem = this._data.get(id);
		if (!oldItem) return;
		const nextItem = updateData(oldItem, updates);
		if (this._data.get(id) !== nextItem) {
			this._data.set(id, nextItem);
			this.next.resolve();
		}
	}

	/**
	 * Delete an item by its id.
	 * - Only resolves `next` when an item was actually removed.
	 *
	 * @param id Identifier of the item to delete.
	 * @example table.deleteItem(123);
	 * @see https://shelving.cc/db/MemoryTable/deleteItem
	 */
	deleteItem(id: I): void {
		if (this._data.has(id)) {
			this._data.delete(id);
			this.next.resolve();
		}
	}

	/**
	 * Count the items in this table matching an optional query.
	 *
	 * @param query Query to filter the counted items (counts all items when omitted).
	 * @returns The number of matching items.
	 * @example table.countQuery({ age: 40 }) // 7
	 * @see https://shelving.cc/db/MemoryTable/countQuery
	 */
	countQuery(query?: Query<Item<I, T>>): number {
		return query ? countItems(queryItems(this._data.values(), query)) : this._data.size;
	}

	/**
	 * Get the items in this table matching an optional query.
	 *
	 * @param query Query to filter, sort, and limit the items (returns all items when omitted).
	 * @returns An array of matching items.
	 * @example table.getQuery({ age: 40, $order: "name" }) // Items.
	 * @see https://shelving.cc/db/MemoryTable/getQuery
	 */
	getQuery(query?: Query<Item<I, T>>): Items<I, T> {
		return requireArray(query ? queryItems(this._data.values(), query) : this._data.values());
	}

	/**
	 * Subscribe to the live result of a query.
	 * - Emits the current query result immediately, even if empty.
	 * - Wakes on every table change, but only yields when the computed query result changed.
	 *
	 * @param query Query to filter, sort, and limit the items.
	 * @returns Async sequence yielding the matching items on every change.
	 * @example for await (const items of table.getQuerySequence({ age: 40 })) console.log(items);
	 * @see https://shelving.cc/db/MemoryTable/getQuerySequence
	 */
	async *getQuerySequence(query?: Query<Item<I, T>>): AsyncIterable<Items<I, T>> {
		let lastItems = this.getQuery(query);
		yield lastItems;
		while (true) {
			await this.next;
			const nextItems = this.getQuery(query);
			if (!isArrayEqual(lastItems, nextItems)) {
				yield nextItems;
				lastItems = nextItems;
			}
		}
	}

	/**
	 * Set (overwrite) the data for every item matching a query.
	 *
	 * @param query Query selecting the items to set.
	 * @param data Full data to store for each matching item.
	 * @example table.setQuery({ age: 40 }, { active: true });
	 * @see https://shelving.cc/db/MemoryTable/setQuery
	 */
	setQuery(query: Query<Item<I, T>>, data: T): void {
		let changed = false;
		for (const { id } of queryWritableItems(this._data.values(), query)) {
			const item = getItem(id, data);
			if (this._data.get(id) !== item) {
				this._data.set(id, item);
				changed = true;
			}
		}
		if (changed) this.next.resolve();
	}

	/**
	 * Apply partial updates to every item matching a query.
	 *
	 * @param query Query selecting the items to update.
	 * @param updates Updates to apply to each matching item.
	 * @example table.updateQuery({ age: 40 }, { active: true });
	 * @see https://shelving.cc/db/MemoryTable/updateQuery
	 */
	updateQuery(query: Query<Item<I, T>>, updates: Updates<T>): void {
		let changed = false;
		for (const { id } of queryWritableItems(this._data.values(), query)) {
			const oldItem = this._data.get(id);
			if (!oldItem) continue;
			const nextItem = updateData<Item<I, T>>(oldItem, updates);
			if (this._data.get(id) !== nextItem) {
				this._data.set(id, nextItem);
				changed = true;
			}
		}
		if (changed) this.next.resolve();
	}

	deleteQuery(query: Query<Item<I, T>>): void {
		let changed = false;
		for (const { id } of queryWritableItems(this._data.values(), query)) {
			if (this._data.has(id)) {
				this._data.delete(id);
				changed = true;
			}
		}
		if (changed) this.next.resolve();
	}

	setItems(items: Items<I, T>): void {
		let changed = false;
		for (const item of items) {
			if (this._data.get(item.id) !== item) {
				this._data.set(item.id, item);
				changed = true;
			}
		}
		if (changed) this.next.resolve();
	}

	async *setItemsSequence(sequence: AsyncIterable<Items<I, T>>): AsyncIterable<Items<I, T>> {
		for await (const items of sequence) {
			this.setItems(items);
			yield items;
		}
	}
}
