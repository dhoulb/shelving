import { DeferredSequence } from "../sequence/DeferredSequence.js";
import { getArray } from "../util/array.js";
import type { Data, Database, DataKey } from "../util/data.js";
import { isArrayEqual } from "../util/equal.js";
import type { Identifier, Item, Items, OptionalItem } from "../util/item.js";
import { getItem } from "../util/item.js";
import { countItems } from "../util/iterate.js";
import type { ItemQuery } from "../util/query.js";
import { queryItems, queryWritableItems } from "../util/query.js";
import { getRandom, getRandomKey } from "../util/random.js";
import type { Updates } from "../util/update.js";
import { updateData } from "../util/update.js";
import { Provider } from "./Provider.js";

/**
 * Fast in-memory store for data.
 * - Extremely fast (ideal for caching!), but does not persist data after the browser window is closed.
 * - `get()` etc return the exact same instance of an object that's passed into `set()`
 */
export class MemoryProvider<I extends Identifier, T extends Database> extends Provider<I, T> {
	/** List of tables in `{ collection: Table }` format. */
	private _tables: { [K in DataKey<T>]?: MemoryTable<I, T[K]> } = {};

	/** Get a table for a collection. */
	getTable<K extends DataKey<T>>(collection: K): MemoryTable<I, T[K]> {
		// biome-ignore lint/suspicious/noAssignInExpressions: This is convenient.
		return (this._tables[collection] ||= new MemoryTable<I, T[K]>());
	}

	getItemTime<K extends DataKey<T>>(collection: K, id: I): number | undefined {
		return this.getTable(collection).getItemTime(id);
	}

	getItem<K extends DataKey<T>>(collection: K, id: I): OptionalItem<I, T[K]> {
		return this.getTable(collection).getItem(id);
	}

	getItemSequence<K extends DataKey<T>>(collection: K, id: I): AsyncIterable<OptionalItem<I, T[K]>> {
		return this.getTable(collection).getItemSequence(id);
	}

	getCachedItemSequence<K extends DataKey<T>>(collection: K, id: I): AsyncIterable<OptionalItem<I, T[K]>> {
		return this.getTable(collection).getCachedItemSequence(id);
	}

	addItem<K extends DataKey<T>>(collection: K, data: T[K]): I {
		return this.getTable(collection).addItem(data);
	}

	setItem<K extends DataKey<T>>(collection: K, id: I, data: T[K]): void {
		this.getTable(collection).setItem(id, data);
	}

	setItemSequence<K extends DataKey<T>>(
		collection: K,
		id: I,
		sequence: AsyncIterable<OptionalItem<I, T[K]>>,
	): AsyncIterable<OptionalItem<I, T[K]>> {
		return this.getTable(collection).setItemSequence(id, sequence);
	}

	updateItem<K extends DataKey<T>>(collection: K, id: I, updates: Updates<T[K]>): void {
		this.getTable(collection).updateItem(id, updates);
	}

	deleteItem<K extends DataKey<T>>(collection: K, id: I): void {
		this.getTable(collection).deleteItem(id);
	}

	getQueryTime<K extends DataKey<T>>(collection: K, query?: ItemQuery<I, T[K]>): number | undefined {
		return this.getTable(collection).getQueryTime(query);
	}

	override countQuery<K extends DataKey<T>>(collection: K, query?: ItemQuery<I, T[K]>): number {
		return this.getTable(collection).countQuery(query);
	}

	getQuery<K extends DataKey<T>>(collection: K, query?: ItemQuery<I, T[K]>): Items<I, T[K]> {
		return this.getTable(collection).getQuery(query);
	}

	getQuerySequence<K extends DataKey<T>>(collection: K, query?: ItemQuery<I, T[K]>): AsyncIterable<Items<I, T[K]>> {
		return this.getTable(collection).getQuerySequence(query);
	}

	getCachedQuerySequence<K extends DataKey<T>>(collection: K, query?: ItemQuery<I, T[K]>): AsyncIterable<Items<I, T[K]>> {
		return this.getTable(collection).getCachedQuerySequence(query);
	}

	setQuery<K extends DataKey<T>>(collection: K, query: ItemQuery<I, T[K]>, data: T[K]): void {
		this.getTable(collection).setQuery(query, data);
	}

	updateQuery<K extends DataKey<T>>(collection: K, query: ItemQuery<I, T[K]>, updates: Updates<T[K]>): void {
		this.getTable(collection).updateQuery(query, updates);
	}

	deleteQuery<K extends DataKey<T>>(collection: K, query: ItemQuery<I, T[K]>): void {
		this.getTable(collection).deleteQuery(query);
	}

	setItems<K extends DataKey<T>>(collection: K, items: Items<I, T[K]>, query?: ItemQuery<I, T[K]>): void {
		this.getTable(collection).setItems(items, query);
	}

	setItemsSequence<K extends DataKey<T>>(
		collection: K,
		sequence: AsyncIterable<Items<I, T[K]>>,
		query?: ItemQuery<I, T[K]>,
	): AsyncIterable<Items<I, T[K]>> {
		return this.getTable(collection).setItemsSequence(sequence, query);
	}
}

/** An individual table of data. */
export class MemoryTable<I extends Identifier, T extends Data> {
	/** Actual data in this table. */
	protected readonly _data = new Map<Identifier, Item<I, T>>();

	/** Times data was last updated. */
	protected readonly _times = new Map<Identifier, number>();

	/** Deferred sequence of next values. */
	public readonly next = new DeferredSequence();

	getItemTime(id: I): number | undefined {
		return this._times.get(id);
	}

	getItem(id: I): OptionalItem<I, T> {
		return this._data.get(id);
	}

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

	async *getCachedItemSequence(id: I): AsyncIterable<OptionalItem<I, T>> {
		let lastTime = this._times.get(id);
		if (typeof lastTime === "number") yield this.getItem(id);
		while (true) {
			await this.next;
			const nextTime = this._times.get(id);
			if (nextTime !== lastTime) {
				if (typeof nextTime === "number") yield this.getItem(id);
				lastTime = nextTime;
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
			this._times.set(id, Date.now());
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
		if (oldItem) this.setItem(id, updateData<Item<I, T>>(oldItem, updates));
	}

	deleteItem(id: I): void {
		if (this._data.has(id)) {
			this._data.delete(id);
			this._times.set(id, Date.now());
			this.next.resolve();
		}
	}

	getQueryTime(query?: ItemQuery<I, T>): number | undefined {
		return this._times.get(_getQueryKey(query));
	}

	countQuery(query?: ItemQuery<I, T>): number {
		return query ? countItems(queryItems(this._data.values(), query)) : this._data.size;
	}

	getQuery(query?: ItemQuery<I, T>): Items<I, T> {
		return getArray(query ? queryItems(this._data.values(), query) : this._data.values());
	}

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

	async *getCachedQuerySequence(query?: ItemQuery<I, T>): AsyncIterable<Items<I, T>> {
		const key = _getQueryKey(query);
		let lastTime = this._times.get(key);
		if (typeof lastTime === "number") yield this.getQuery(query);
		while (true) {
			await this.next;
			const nextTime = this._times.get(key);
			if (lastTime !== nextTime) {
				if (typeof nextTime === "number") yield this.getQuery(query);
				lastTime = nextTime;
			}
		}
	}

	setQuery(query: ItemQuery<I, T>, data: T): void {
		let changed = 0;
		for (const { id } of queryWritableItems<Item<I, T>>(this._data.values(), query)) {
			this.setItem(id, data);
			changed++;
		}
		if (changed) {
			const key = _getQueryKey(query);
			this._times.set(key, Date.now());
			this.next.resolve();
		}
	}

	updateQuery(query: ItemQuery<I, T>, updates: Updates<T>): void {
		let count = 0;
		for (const { id } of queryWritableItems<Item<I, T>>(this._data.values(), query)) {
			this.updateItem(id, updates);
			count++;
		}
		if (count) {
			const key = _getQueryKey(query);
			this._times.set(key, Date.now());
			this.next.resolve();
		}
	}

	deleteQuery(query: ItemQuery<I, T>): void {
		let count = 0;
		for (const { id } of queryWritableItems<Item<I, T>>(this._data.values(), query)) {
			this.deleteItem(id);
			count++;
		}
		if (count) {
			const key = _getQueryKey(query);
			this._times.set(key, Date.now());
			this.next.resolve();
		}
	}

	setItems(items: Items<I, T>, query?: ItemQuery<I, T>): void {
		for (const item of items) this.setItem(item.id, item);
		if (query) {
			const key = _getQueryKey(query);
			this._times.set(key, Date.now());
			this.next.resolve();
		}
	}

	async *setItemsSequence(sequence: AsyncIterable<Items<I, T>>, query?: ItemQuery<I, T>): AsyncIterable<Items<I, T>> {
		for await (const items of sequence) {
			this.setItems(items, query);
			yield items;
		}
	}
}

// Queries that have no limit don't care about sorting either.
const _getQueryKey = <I extends Identifier, T extends Data>(query?: ItemQuery<I, T>): string => (query ? JSON.stringify(query) : "{}");
