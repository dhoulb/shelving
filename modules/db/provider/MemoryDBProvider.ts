import { StringSchema } from "../../schema/StringSchema.js";
import { DeferredSequence } from "../../sequence/DeferredSequence.js";
import { requireArray } from "../../util/array.js";
import type { Data } from "../../util/data.js";
import { isArrayEqual } from "../../util/equal.js";
import type { Identifier, Item, Items, OptionalItem } from "../../util/item.js";
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
 * Fast in-memory store for data.
 * - Extremely fast (ideal for caching!), but does not persist data after the browser window is closed.
 * - `get()` etc return the exact same instance of an object that's passed into `set()`
 */
export class MemoryDBProvider<I extends Identifier = Identifier, T extends Data = Data> extends DBProvider<I, T> {
	/** List of tables in `{ name: MemoryTable }` format. */
	private _tables: { [K in string]?: MemoryTable<I, T> } = {};

	/** Get a table for a collection. */
	getTable<II extends I, TT extends T>(collection: Collection<string, II, TT>): MemoryTable<II, TT> {
		return ((this._tables[collection.name] as MemoryTable<II, TT>) ||= new MemoryTable<II, TT>(collection));
	}

	async getItem<II extends I, TT extends T>(collection: Collection<string, II, TT>, id: II): Promise<OptionalItem<II, TT>> {
		return this.getTable(collection).getItem(id);
	}

	async *getItemSequence<II extends I, TT extends T>(collection: Collection<string, II, TT>, id: II): AsyncIterable<OptionalItem<II, TT>> {
		yield* this.getTable(collection).getItemSequence(id);
	}

	async addItem<II extends I, TT extends T>(collection: Collection<string, II, TT>, data: TT): Promise<II> {
		return this.getTable(collection).addItem(data);
	}

	async setItem<II extends I, TT extends T>(collection: Collection<string, II, TT>, id: II, data: TT): Promise<void> {
		this.getTable(collection).setItem(id, data);
	}

	async updateItem<II extends I, TT extends T>(
		collection: Collection<string, II, TT>,
		id: II,
		updates: Updates<Item<II, TT>>,
	): Promise<void> {
		this.getTable(collection).updateItem(id, updates);
	}

	async deleteItem<II extends I, TT extends T>(collection: Collection<string, II, TT>, id: II): Promise<void> {
		this.getTable(collection).deleteItem(id);
	}

	override async countQuery<II extends I, TT extends T>(
		collection: Collection<string, II, TT>,
		query?: Query<Item<II, TT>>,
	): Promise<number> {
		return this.getTable(collection).countQuery(query);
	}

	async getQuery<II extends I, TT extends T>(collection: Collection<string, II, TT>, query?: Query<Item<II, TT>>): Promise<Items<II, TT>> {
		return this.getTable(collection).getQuery(query);
	}

	async *getQuerySequence<II extends I, TT extends T>(
		collection: Collection<string, II, TT>,
		query?: Query<Item<II, TT>>,
	): AsyncIterable<Items<II, TT>> {
		yield* this.getTable(collection).getQuerySequence(query);
	}

	async setQuery<II extends I, TT extends T>(collection: Collection<string, II, TT>, query: Query<Item<II, TT>>, data: TT): Promise<void> {
		this.getTable(collection).setQuery(query, data);
	}

	async updateQuery<II extends I, TT extends T>(
		collection: Collection<string, II, TT>,
		query: Query<Item<II, TT>>,
		updates: Updates<TT>,
	): Promise<void> {
		this.getTable(collection).updateQuery(query, updates);
	}

	async deleteQuery<II extends I, TT extends T>(collection: Collection<string, II, TT>, query: Query<Item<II, TT>>): Promise<void> {
		this.getTable(collection).deleteQuery(query);
	}

	setItems<II extends I, TT extends T>(collection: Collection<string, II, TT>, items: Items<II, TT>): void {
		this.getTable(collection).setItems(items);
	}
}

/** An individual table of data. */
export class MemoryTable<I extends Identifier, T extends Data> {
	/** Actual data in this table. */
	protected readonly _data = new Map<I, Item<I, T>>();

	/** Deferred sequence of next values. */
	public readonly next = new DeferredSequence();

	readonly collection: Collection<string, I, T>;

	constructor(collection: Collection<string, I, T>) {
		this.collection = collection;
	}

	getItem(id: I): OptionalItem<I, T> {
		return this._data.get(id);
	}

	/**
	 * Subscribe to all changes for this item key.
	 * - Emits the current item immediately, including `undefined` when absent.
	 * - Wakes on every table change, but only yields when this item's value actually changed.
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

	/** Generate a unique ID for a new item in this table. */
	generateUniqueID(): I {
		const gen = (this.collection.id instanceof StringSchema ? getRandomKey : getRandom) as () => I;
		let id = gen();
		while (this._data.has(id)) id = gen(); // Regenerate ID until unique.
		return id;
	}

	addItem(data: T): I {
		const id = this.generateUniqueID();
		this.setItem(id, data);
		return id;
	}

	setItem(id: I, data: Item<I, T> | T): void {
		const item = getItem(id, data);
		if (this._data.get(id) !== item) {
			this._data.set(id, item);
			this.next.resolve();
		}
	}

	async *setItemSequence(id: I, sequence: AsyncIterable<OptionalItem<I, T>>): AsyncIterable<OptionalItem<I, T>> {
		for await (const item of sequence) {
			item ? this.setItem(id, item) : this.deleteItem(id);
			yield item;
		}
	}

	updateItem(id: I, updates: Updates<Item<I, T>>): void {
		const oldItem = this._data.get(id);
		if (!oldItem) return;
		const nextItem = updateData(oldItem, updates);
		if (this._data.get(id) !== nextItem) {
			this._data.set(id, nextItem);
			this.next.resolve();
		}
	}

	deleteItem(id: I): void {
		if (this._data.has(id)) {
			this._data.delete(id);
			this.next.resolve();
		}
	}

	countQuery(query?: Query<Item<I, T>>): number {
		return query ? countItems(queryItems(this._data.values(), query)) : this._data.size;
	}

	getQuery(query?: Query<Item<I, T>>): Items<I, T> {
		return requireArray(query ? queryItems(this._data.values(), query) : this._data.values());
	}

	/**
	 * Subscribe to the live result of a query.
	 * - Emits the current query result immediately, even if empty.
	 * - Wakes on every table change, but only yields when the computed query result changed.
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
