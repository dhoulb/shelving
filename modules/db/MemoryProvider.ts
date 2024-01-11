import type { Data, DataKey, Database } from "../util/data.js";
import type { Item, ItemQuery, Items, OptionalItem } from "../util/item.js";
import type { Updates } from "../util/update.js";
import { DeferredSequence } from "../sequence/DeferredSequence.js";
import { getArray } from "../util/array.js";
import { isArrayEqual } from "../util/equal.js";
import { getItem } from "../util/item.js";
import { countItems } from "../util/iterate.js";
import { queryItems, queryWritableItems } from "../util/query.js";
import { getRandomKey } from "../util/random.js";
import { updateData } from "../util/update.js";
import { Provider } from "./Provider.js";

/**
 * Fast in-memory store for data.
 * - Extremely fast (ideal for caching!), but does not persist data after the browser window is closed.
 * - `get()` etc return the exact same instance of an object that's passed into `set()`
 */
export class MemoryProvider<T extends Database> extends Provider<T> {
	/** List of tables in `{ collection: Table }` format. */
	private _tables: { [K in DataKey<T>]?: MemoryTable<T[K]> } = {};

	/** Get a table for a collection. */
	getTable<K extends DataKey<T>>(collection: K): MemoryTable<T[K]> {
		return (this._tables[collection] ||= new MemoryTable<T[K]>());
	}

	getItemTime<K extends DataKey<T>>(collection: K, id: string): number | undefined {
		return this.getTable(collection).getItemTime(id);
	}

	getItem<K extends DataKey<T>>(collection: K, id: string): OptionalItem<T[K]> {
		return this.getTable(collection).getItem(id);
	}

	getItemSequence<K extends DataKey<T>>(collection: K, id: string): AsyncIterable<OptionalItem<T[K]>> {
		return this.getTable(collection).getItemSequence(id);
	}

	getCachedItemSequence<K extends DataKey<T>>(collection: K, id: string): AsyncIterable<OptionalItem<T[K]>> {
		return this.getTable(collection).getCachedItemSequence(id);
	}

	addItem<K extends DataKey<T>>(collection: K, data: T[K]): string {
		return this.getTable(collection).addItem(data);
	}

	setItem<K extends DataKey<T>>(collection: K, id: string, data: T[K]): void {
		return this.getTable(collection).setItem(id, data);
	}

	setItemSequence<K extends DataKey<T>>(collection: K, id: string, sequence: AsyncIterable<OptionalItem<T[K]>>): AsyncIterable<OptionalItem<T[K]>> {
		return this.getTable(collection).setItemSequence(id, sequence);
	}

	updateItem<K extends DataKey<T>>(collection: K, id: string, updates: Updates<T[K]>): void {
		return this.getTable(collection).updateItem(id, updates);
	}

	deleteItem<K extends DataKey<T>>(collection: K, id: string): void {
		return this.getTable(collection).deleteItem(id);
	}

	getQueryTime<K extends DataKey<T>>(collection: K, query?: ItemQuery<T[K]>): number | undefined {
		return this.getTable(collection).getQueryTime(query);
	}

	override countQuery<K extends DataKey<T>>(collection: K, query?: ItemQuery<T[K]>): number {
		return this.getTable(collection).countQuery(query);
	}

	getQuery<K extends DataKey<T>>(collection: K, query?: ItemQuery<T[K]>): Items<T[K]> {
		return this.getTable(collection).getQuery(query);
	}

	getQuerySequence<K extends DataKey<T>>(collection: K, query?: ItemQuery<T[K]>): AsyncIterable<Items<T[K]>> {
		return this.getTable(collection).getQuerySequence(query);
	}

	getCachedQuerySequence<K extends DataKey<T>>(collection: K, query?: ItemQuery<T[K]>): AsyncIterable<Items<T[K]>> {
		return this.getTable(collection).getCachedQuerySequence(query);
	}

	setQuery<K extends DataKey<T>>(collection: K, query: ItemQuery<T[K]>, data: T[K]): void {
		return this.getTable(collection).setQuery(query, data);
	}

	updateQuery<K extends DataKey<T>>(collection: K, query: ItemQuery<T[K]>, updates: Updates<T[K]>): void {
		return this.getTable(collection).updateQuery(query, updates);
	}

	deleteQuery<K extends DataKey<T>>(collection: K, query: ItemQuery<T[K]>): void {
		return this.getTable(collection).deleteQuery(query);
	}

	setItems<K extends DataKey<T>>(collection: K, items: Items<T[K]>, query?: ItemQuery<T[K]>): void {
		return this.getTable(collection).setItems(items, query);
	}

	setItemsSequence<K extends DataKey<T>>(collection: K, sequence: AsyncIterable<Items<T[K]>>, query?: ItemQuery<T[K]>): AsyncIterable<Items<T[K]>> {
		return this.getTable(collection).setItemsSequence(sequence, query);
	}
}

/** An individual table of data. */
export class MemoryTable<T extends Data> {
	/** Actual data in this table. */
	protected readonly _data = new Map<string, Item<T>>();

	/** Times data was last updated. */
	protected readonly _times = new Map<string, number>();

	/** Deferred sequence of next values. */
	readonly _changed = new DeferredSequence();

	getItemTime(id: string): number | undefined {
		return this._times.get(id);
	}

	getItem(id: string): OptionalItem<T> {
		return this._data.get(id);
	}

	async *getItemSequence(id: string): AsyncIterable<OptionalItem<T>> {
		let lastValue = this.getItem(id);
		yield lastValue;
		while (true) {
			await this._changed;
			const nextValue = this.getItem(id);
			if (nextValue !== lastValue) {
				yield nextValue;
				lastValue = nextValue;
			}
		}
	}

	async *getCachedItemSequence(id: string): AsyncIterable<OptionalItem<T>> {
		let lastTime = this._times.get(id);
		if (typeof lastTime === "number") yield this.getItem(id);
		while (true) {
			await this._changed;
			const nextTime = this._times.get(id);
			if (nextTime !== lastTime) {
				if (typeof nextTime === "number") yield this.getItem(id);
				lastTime = nextTime;
			}
		}
	}

	addItem(data: T): string {
		let id = getRandomKey();
		while (this._data.has(id)) id = getRandomKey(); // Regenerate ID until unique.
		this.setItem(id, data);
		return id;
	}

	setItem(id: string, data: Item<T> | T): void {
		const item = getItem(id, data);
		if (this._data.get(id) !== item) {
			this._data.set(id, item);
			this._times.set(id, Date.now());
			this._changed.resolve();
		}
	}

	async *setItemSequence(id: string, sequence: AsyncIterable<OptionalItem<T>>): AsyncIterable<OptionalItem<T>> {
		for await (const item of sequence) {
			item ? this.setItem(id, item) : this.deleteItem(id);
			yield item;
		}
	}

	updateItem(id: string, updates: Updates<T>): void {
		const oldItem = this._data.get(id);
		if (oldItem) return this.setItem(id, updateData<Item<T>>(oldItem, updates));
	}

	deleteItem(id: string): void {
		if (this._data.has(id)) {
			this._data.delete(id);
			this._times.set(id, Date.now());
			this._changed.resolve();
		}
	}

	getQueryTime(query?: ItemQuery<T>): number | undefined {
		return this._times.get(_getQueryKey(query));
	}

	countQuery(query?: ItemQuery<T>): number {
		return query ? countItems(queryItems(this._data.values(), query)) : this._data.size;
	}

	getQuery(query?: ItemQuery<T>): Items<T> {
		return getArray(query ? queryItems(this._data.values(), query) : this._data.values());
	}

	async *getQuerySequence(query?: ItemQuery<T>): AsyncIterable<Items<T>> {
		let lastItems = this.getQuery(query);
		yield lastItems;
		while (true) {
			await this._changed;
			const nextItems = this.getQuery(query);
			if (!isArrayEqual(lastItems, nextItems)) {
				yield nextItems;
				lastItems = nextItems;
			}
		}
	}

	async *getCachedQuerySequence(query?: ItemQuery<T>): AsyncIterable<Items<T>> {
		const key = _getQueryKey(query);
		let lastTime = this._times.get(key);
		if (typeof lastTime === "number") yield this.getQuery(query);
		while (true) {
			await this._changed;
			const nextTime = this._times.get(key);
			if (lastTime !== nextTime) {
				if (typeof nextTime === "number") yield this.getQuery(query);
				lastTime = nextTime;
			}
		}
	}

	setQuery(query: ItemQuery<T>, data: T): void {
		let changed = 0;
		for (const { id } of queryWritableItems<Item<T>>(this._data.values(), query)) {
			this.setItem(id, data);
			changed++;
		}
		if (changed) {
			const key = _getQueryKey(query);
			this._times.set(key, Date.now());
			this._changed.resolve();
		}
	}

	updateQuery(query: ItemQuery<T>, updates: Updates<T>): void {
		let count = 0;
		for (const { id } of queryWritableItems<Item<T>>(this._data.values(), query)) {
			this.updateItem(id, updates);
			count++;
		}
		if (count) {
			const key = _getQueryKey(query);
			this._times.set(key, Date.now());
			this._changed.resolve();
		}
	}

	deleteQuery(query: ItemQuery<T>): void {
		let count = 0;
		for (const { id } of queryWritableItems<Item<T>>(this._data.values(), query)) {
			this.deleteItem(id);
			count++;
		}
		if (count) {
			const key = _getQueryKey(query);
			this._times.set(key, Date.now());
			this._changed.resolve();
		}
	}

	setItems(items: Items<T>, query?: ItemQuery<T>): void {
		for (const item of items) this.setItem(item.id, item);
		if (query) {
			const key = _getQueryKey(query);
			this._times.set(key, Date.now());
			this._changed.resolve();
		}
	}

	async *setItemsSequence(sequence: AsyncIterable<Items<T>>, query?: ItemQuery<T>): AsyncIterable<Items<T>> {
		for await (const items of sequence) {
			this.setItems(items, query);
			yield items;
		}
	}
}

// Queries that have no limit don't care about sorting either.
const _getQueryKey = <T extends Data>(query?: ItemQuery<T>): string => (query ? JSON.stringify(query) : "{}");
