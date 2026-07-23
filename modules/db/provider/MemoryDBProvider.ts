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
 * @see https://shelving.cc/db/MemoryDBProvider
 */
export class MemoryDBProvider<I extends Identifier = Identifier, T extends Data = Data> extends DBProvider<I, T> {
	/** List of tables in `{ name: MemoryTable }` format. */
	protected _tables: { [K in string]?: MemoryTable<I, T> } = {};

	/**
	 * Get (or lazily create) the `MemoryTable` backing a collection.
	 *
	 * @param collection Collection to get the table for.
	 * @example provider.getTable(users) // MemoryTable
	 * @see https://shelving.cc/db/MemoryDBProvider/getTable
	 */
	getTable<II extends I, TT extends T>(collection: Collection<string, II, TT>): MemoryTable<II, TT> {
		return ((this._tables[collection.name] as MemoryTable<II, TT>) ||= this.createTable(collection));
	}

	/**
	 * Create a new `MemoryTable` for a collection (without registering it — use `getTable()` for that).
	 * - Override point for subclasses that back collections with a specialised table, e.g. `StorageDBProvider`.
	 *
	 * @param collection Collection to create a table for.
	 * @example provider.createTable(users) // MemoryTable
	 * @see https://shelving.cc/db/MemoryDBProvider/createTable
	 */
	createTable<II extends I, TT extends T>(collection: Collection<string, II, TT>): MemoryTable<II, TT> {
		return new MemoryTable<II, TT>(collection);
	}

	override async getItem<II extends I, TT extends T>(collection: Collection<string, II, TT>, id: II): Promise<OptionalItem<II, TT>> {
		return this.getTable(collection).getItem(id);
	}

	override async *getItemSequence<II extends I, TT extends T>(
		collection: Collection<string, II, TT>,
		id: II,
	): OptionalItemSequence<II, TT> {
		yield* this.getTable(collection).getItemSequence(id);
	}

	override async addItem<II extends I, TT extends T>(collection: Collection<string, II, TT>, data: TT): Promise<II> {
		return this.getTable(collection).addItem(data);
	}

	override async setItem<II extends I, TT extends T>(collection: Collection<string, II, TT>, id: II, data: TT): Promise<void> {
		this.getTable(collection).setItem(id, data);
	}

	override async updateItem<II extends I, TT extends T>(
		collection: Collection<string, II, TT>,
		id: II,
		updates: Updates<Item<II, TT>>,
	): Promise<void> {
		this.getTable(collection).updateItem(id, updates);
	}

	override async deleteItem<II extends I, TT extends T>(collection: Collection<string, II, TT>, id: II): Promise<void> {
		this.getTable(collection).deleteItem(id);
	}

	override async countQuery<II extends I, TT extends T>(
		collection: Collection<string, II, TT>,
		query?: Query<Item<II, TT>>,
	): Promise<number> {
		return this.getTable(collection).countQuery(query);
	}

	override async getQuery<II extends I, TT extends T>(
		collection: Collection<string, II, TT>,
		query?: Query<Item<II, TT>>,
	): Promise<Items<II, TT>> {
		return this.getTable(collection).getQuery(query);
	}

	override async *getQuerySequence<II extends I, TT extends T>(
		collection: Collection<string, II, TT>,
		query?: Query<Item<II, TT>>,
	): ItemsSequence<II, TT> {
		return yield* this.getTable(collection).getQuerySequence(query);
	}

	override async setQuery<II extends I, TT extends T>(
		collection: Collection<string, II, TT>,
		query: Query<Item<II, TT>>,
		data: TT,
	): Promise<void> {
		this.getTable(collection).setQuery(query, data);
	}

	override async updateQuery<II extends I, TT extends T>(
		collection: Collection<string, II, TT>,
		query: Query<Item<II, TT>>,
		updates: Updates<TT>,
	): Promise<void> {
		this.getTable(collection).updateQuery(query, updates);
	}

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
	 * Set an item instance in the table data, returning whether anything changed.
	 * - Override point for subclasses that mirror writes to another medium — the mirror write should complete (or throw) before calling `super._set()`.
	 */
	protected _set(id: I, item: Item<I, T>): boolean {
		if (this._data.get(id) === item) return false;
		this._data.set(id, item);
		return true;
	}

	/**
	 * Delete an item instance from the table data, returning whether anything changed.
	 * - Override point for subclasses that mirror writes to another medium — the mirror write should complete (or throw) before calling `super._delete()`.
	 */
	protected _delete(id: I): boolean {
		return this._data.delete(id);
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
		if (this._set(id, getItem(id, data))) this.next.resolve();
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
		if (this._set(id, updateData(oldItem, updates))) this.next.resolve();
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
		if (this._delete(id)) this.next.resolve();
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
		for (const { id } of queryWritableItems(this._data.values(), query)) if (this._set(id, getItem(id, data))) changed = true;
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
			if (this._set(id, updateData<Item<I, T>>(oldItem, updates))) changed = true;
		}
		if (changed) this.next.resolve();
	}

	deleteQuery(query: Query<Item<I, T>>): void {
		let changed = false;
		for (const { id } of queryWritableItems(this._data.values(), query)) if (this._delete(id)) changed = true;
		if (changed) this.next.resolve();
	}

	setItems(items: Items<I, T>): void {
		let changed = false;
		for (const item of items) if (this._set(item.id, item)) changed = true;
		if (changed) this.next.resolve();
	}

	async *setItemsSequence(sequence: AsyncIterable<Items<I, T>>): AsyncIterable<Items<I, T>> {
		for await (const items of sequence) {
			this.setItems(items);
			yield items;
		}
	}
}
