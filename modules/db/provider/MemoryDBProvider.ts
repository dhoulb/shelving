import { DeferredSequence } from "../../sequence/DeferredSequence.js";
import { requireArray } from "../../util/array.js";
import type { Data } from "../../util/data.js";
import { isArrayEqual } from "../../util/equal.js";
import type { Identifier, Item, Items, OptionalItem } from "../../util/item.js";
import { getItem } from "../../util/item.js";
import { countItems } from "../../util/iterate.js";
import type { ItemQuery } from "../../util/query.js";
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
export class MemoryDBProvider<I extends Identifier = Identifier> extends DBProvider<I> {
	/** List of tables in `{ collection: Table }` format. */
	// biome-ignore lint/suspicious/noExplicitAny: Internal storage erases T; getTable<T> restores it per-call.
	private _tables: { [K in string]?: MemoryTable<I, any> } = {};

	/** Get a table for a collection. */
	getTable<T extends Data>({ name }: Collection<string, I, T>): MemoryTable<I, T> {
		return (this._tables[name] ||= new MemoryTable<I, T>());
	}

	async getItem<T extends Data>(collection: Collection<string, I, T>, id: I): Promise<OptionalItem<I, T>> {
		return this.getTable(collection).getItem(id);
	}

	async *getItemSequence<T extends Data>(collection: Collection<string, I, T>, id: I): AsyncIterable<OptionalItem<I, T>> {
		yield* this.getTable(collection).getItemSequence(id);
	}

	async addItem<T extends Data>(collection: Collection<string, I, T>, data: T): Promise<I> {
		return this.getTable(collection).addItem(data);
	}

	async setItem<T extends Data>(collection: Collection<string, I, T>, id: I, data: T): Promise<void> {
		this.getTable(collection).setItem(id, data);
	}

	async updateItem<T extends Data>(collection: Collection<string, I, T>, id: I, updates: Updates<T>): Promise<void> {
		this.getTable(collection).updateItem(id, updates);
	}

	async deleteItem<T extends Data>(collection: Collection<string, I, T>, id: I): Promise<void> {
		this.getTable(collection).deleteItem(id);
	}

	override async countQuery<T extends Data>(collection: Collection<string, I, T>, query?: ItemQuery<I, T>): Promise<number> {
		return this.getTable(collection).countQuery(query);
	}

	async getQuery<T extends Data>(collection: Collection<string, I, T>, query?: ItemQuery<I, T>): Promise<Items<I, T>> {
		return this.getTable(collection).getQuery(query);
	}

	async *getQuerySequence<T extends Data>(collection: Collection<string, I, T>, query?: ItemQuery<I, T>): AsyncIterable<Items<I, T>> {
		yield* this.getTable(collection).getQuerySequence(query);
	}

	async setQuery<T extends Data>(collection: Collection<string, I, T>, query: ItemQuery<I, T>, data: T): Promise<void> {
		this.getTable(collection).setQuery(query, data);
	}

	async updateQuery<T extends Data>(collection: Collection<string, I, T>, query: ItemQuery<I, T>, updates: Updates<T>): Promise<void> {
		this.getTable(collection).updateQuery(query, updates);
	}

	async deleteQuery<T extends Data>(collection: Collection<string, I, T>, query: ItemQuery<I, T>): Promise<void> {
		this.getTable(collection).deleteQuery(query);
	}

	setItems<T extends Data>(collection: Collection<string, I, T>, items: Items<I, T>): void {
		this.getTable(collection).setItems(items);
	}
}

/** An individual table of data. */
export class MemoryTable<I extends Identifier, T extends Data> {
	/** Actual data in this table. */
	protected readonly _data = new Map<Identifier, Item<I, T>>();

	/** Deferred sequence of next values. */
	public readonly next = new DeferredSequence();

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

	/** Function to generate a random ID for this table. */
	generateUniqueID(): I;
	generateUniqueID(): Identifier {
		const gen = typeof this._data.keys().next().value === "number" ? getRandom : getRandomKey;
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

	updateItem(id: I, updates: Updates<T>): void {
		const oldItem = this._data.get(id);
		if (!oldItem) return;
		const nextItem = updateData<Item<I, T>>(oldItem, updates);
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

	countQuery(query?: ItemQuery<I, T>): number {
		return query ? countItems(queryItems(this._data.values(), query)) : this._data.size;
	}

	getQuery(query?: ItemQuery<I, T>): Items<I, T> {
		return requireArray(query ? queryItems(this._data.values(), query) : this._data.values());
	}

	/**
	 * Subscribe to the live result of a query.
	 * - Emits the current query result immediately, even if empty.
	 * - Wakes on every table change, but only yields when the computed query result changed.
	 */
	async *getQuerySequence(query?: ItemQuery<I, T>): AsyncIterable<Items<I, T>> {
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

	setQuery(query: ItemQuery<I, T>, data: T): void {
		let changed = false;
		for (const { id } of queryWritableItems<Item<I, T>>(this._data.values(), query)) {
			const item = getItem(id, data);
			if (this._data.get(id) !== item) {
				this._data.set(id, item);
				changed = true;
			}
		}
		if (changed) this.next.resolve();
	}

	updateQuery(query: ItemQuery<I, T>, updates: Updates<T>): void {
		let changed = false;
		for (const { id } of queryWritableItems<Item<I, T>>(this._data.values(), query)) {
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

	deleteQuery(query: ItemQuery<I, T>): void {
		let changed = false;
		for (const { id } of queryWritableItems<Item<I, T>>(this._data.values(), query)) {
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
