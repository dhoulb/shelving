import type { Provider } from "./Provider.js";
import type { ItemArray, ItemData, ItemQuery, ItemValue } from "../db/ItemReference.js";
import type { Data } from "../util/data.js";
import type { Updates } from "../util/update.js";
import { RequiredError } from "../error/RequiredError.js";
import { DeferredSequence } from "../sequence/DeferredSequence.js";
import { getArray } from "../util/array.js";
import { isArrayEqual } from "../util/equal.js";
import { queryItems, queryWritableItems } from "../util/query.js";
import { getRandomKey } from "../util/random.js";
import { updateData } from "../util/update.js";

/**
 * Fast in-memory store for data.
 * - Extremely fast (ideal for caching!), but does not persist data after the browser window is closed.
 * - `get()` etc return the exact same instance of an object that's passed into `set()`
 */
export class MemoryProvider implements Provider {
	/** List of tables in `{ collection: Table }` format. */
	private _tables: { [collection: string]: MemoryTable<Data> } = {};

	/** Get a table for a collection. */
	getTable(collection: string): MemoryTable {
		return this._tables[collection] || (this._tables[collection] = new MemoryTable());
	}

	getDocumentTime(collection: string, id: string): number | null {
		return this.getTable(collection).getItemTime(id);
	}

	getItem(collection: string, id: string): ItemValue {
		return this.getTable(collection).getItem(id);
	}

	getItemSequence(collection: string, id: string): AsyncIterable<ItemValue> {
		return this.getTable(collection).getItemSequence(id);
	}

	addItem(collection: string, data: Data): string {
		return this.getTable(collection).addItem(data);
	}

	setItem(collection: string, id: string, data: Data): void {
		return this.getTable(collection).setItem(id, data);
	}

	updateItem(collection: string, id: string, updates: Updates): void {
		return this.getTable(collection).updateItem(id, updates);
	}

	deleteItem(collection: string, id: string): void {
		return this.getTable(collection).deleteItem(id);
	}

	getQueryTime(collection: string, query: ItemQuery): number | null {
		return this.getTable(collection).getQueryTime(query);
	}

	getQuery(collection: string, query: ItemQuery): ItemArray {
		return this.getTable(collection).getQuery(query);
	}

	getQuerySequence(collection: string, query: ItemQuery): AsyncIterable<ItemArray> {
		return this.getTable(collection).getQuerySequence(query);
	}

	setQuery(collection: string, query: ItemQuery, data: Data): number {
		return this.getTable(collection).setQuery(query, data);
	}

	updateQuery(collection: string, query: ItemQuery, updates: Updates): number {
		return this.getTable(collection).updateQuery(query, updates);
	}

	deleteQuery(collection: string, query: ItemQuery): number {
		return this.getTable(collection).deleteQuery(query);
	}
}

/** An individual table of data. */
export class MemoryTable<T extends Data = Data> {
	/** Actual data in this table. */
	protected readonly _data = new Map<string, ItemData<T>>();

	/** Times data was last updated. */
	protected readonly _times = new Map<string, number>();

	/** Deferred sequence of next values. */
	readonly _changed = new DeferredSequence();

	getItemTime(id: string): number | null {
		return this._times.get(id) || null;
	}

	getItem(id: string): ItemValue<T> {
		return this._data.get(id) || null;
	}

	async *getItemSequence(id: string): AsyncIterable<ItemValue<T>> {
		let last = this.getItem(id);
		yield last;
		while (true) {
			await this._changed;
			const next = this.getItem(id);
			if (next !== last) yield (last = next);
		}
	}

	/** Subscribe to a query in this table, but only if the query has been explicitly set (i.e. has a time). */
	async *getCachedItemSequence(id: string): AsyncIterable<ItemValue<T>> {
		let last: ItemValue<T> | undefined = undefined;
		if (this._times.has(id)) {
			last = this.getItem(id);
			yield last;
		}
		while (true) {
			await this._changed;
			if (this._times.has(id)) {
				const next = this.getItem(id);
				if (next !== last) yield (last = next);
			}
		}
	}

	addItem(data: T): string {
		let id = getRandomKey();
		while (this._data.has(id)) id = getRandomKey(); // Regenerate ID until unique.
		this._data.set(id, { ...data, id });
		this._times.set(id, Date.now());
		this._changed.resolve();
		return id;
	}

	private _setItemData(item: ItemData<T>, now: number = Date.now()): void {
		const id = item.id;
		this._data.set(id, item);
		this._times.set(id, now);
	}

	setItem(id: string, item: ItemData<T> | T): void {
		this._setItemData(item.id === id ? (item as ItemData<T>) : { ...item, id });
		this._changed.resolve();
	}

	setItemValue(id: string, value: ItemData<T> | T | null): void {
		return value === null ? this.deleteItem(id) : this.setItem(id, value);
	}

	async *setItemValueSequence(id: string, sequence: AsyncIterable<ItemValue<T>>): AsyncIterable<ItemValue> {
		for await (const value of sequence) {
			this.setItemValue(id, value);
			yield value;
		}
	}

	updateItem(id: string, updates: Updates<T>): void {
		const oldItem = this._data.get(id);
		if (!oldItem) throw new RequiredError(`Document "${id}" does not exist`);
		const newItem = updateData<ItemData<T>>(oldItem, updates);
		if (oldItem !== newItem) {
			this._data.set(id, newItem);
			this._times.set(id, Date.now());
			this._changed.resolve();
		}
	}

	deleteItem(id: string): void {
		if (this._data.has(id)) {
			this._data.delete(id);
			this._times.set(id, Date.now());
			this._changed.resolve();
		}
	}

	getQueryTime(query: ItemQuery<T>): number | null {
		return this._times.get(_getQueryKey(query)) || null;
	}

	getQuery(query: ItemQuery<T>): ItemArray<T> {
		return getArray(queryItems(this._data.values(), query));
	}

	async *getQuerySequence(query: ItemQuery<T>): AsyncIterable<ItemArray<T>> {
		let last = this.getQuery(query);
		yield last;
		while (true) {
			await this._changed;
			const next = this.getQuery(query);
			if (!isArrayEqual(last, next)) yield (last = next);
		}
	}

	/** Subscribe to a query in this table, but only if the query has been explicitly set (i.e. has a time). */
	async *getCachedQuerySequence(query: ItemQuery<T>): AsyncIterable<ItemArray<T>> {
		const key = _getQueryKey(query);
		let last: ItemArray<T> | undefined = undefined;
		if (this._times.has(key)) {
			last = this.getQuery(query);
			yield last;
		}
		while (true) {
			await this._changed;
			if (this._times.has(key)) {
				const next = this.getQuery(query);
				if (!last || !isArrayEqual(last, next)) yield (last = next);
			}
		}
	}

	private _setItems(items: ItemArray<T>, now: number = Date.now()): void {
		for (const item of items) this._setItemData(item, now);
	}

	setItems(items: ItemArray<T>): void {
		this._setItems(items);
		if (items.length) this._changed.resolve();
	}

	async *setItemsSequence(sequence: AsyncIterable<ItemArray<T>>): AsyncIterable<ItemArray<T>> {
		for await (const items of sequence) {
			this.setItems(items);
			yield items;
		}
	}

	setQueryItems(query: ItemQuery<T>, items: ItemArray<T>): void {
		const key = _getQueryKey(query);
		const now = Date.now();
		this._times.set(key, now);
		this._setItems(items, now);
		this._changed.resolve();
	}

	async *setQueryItemsSequence(query: ItemQuery<T>, sequence: AsyncIterable<ItemArray<T>>): AsyncIterable<ItemArray<T>> {
		const key = _getQueryKey(query);
		for await (const items of sequence) {
			const now = Date.now();
			this._times.set(key, now);
			this._setItems(items, now);
			this._changed.resolve();
			yield items;
		}
	}

	setQuery(query: ItemQuery<T>, data: T): number {
		const now = Date.now();
		let count = 0;
		for (const { id } of queryWritableItems<ItemData<T>>(this._data.values(), query)) {
			this._data.set(id, { ...data, id });
			this._times.set(id, now);
			count++;
		}
		if (count) {
			const key = _getQueryKey(query);
			this._times.set(key, now);
			this._changed.resolve();
		}
		return count;
	}

	updateQuery(query: ItemQuery<T>, updates: Updates<T>): number {
		const now = Date.now();
		let count = 0;
		for (const oldItem of queryWritableItems<ItemData<T>>(this._data.values(), query)) {
			const newItem = updateData<ItemData<T>>(oldItem, updates);
			if (oldItem !== newItem) {
				const id = oldItem.id;
				this._data.set(id, newItem);
				this._times.set(id, now);
				count++;
			}
		}
		if (count) {
			const key = _getQueryKey(query);
			this._times.set(key, now);
			this._changed.resolve();
		}
		return count;
	}

	deleteQuery(query: ItemQuery<T>): number {
		const now = Date.now();
		let count = 0;
		for (const { id } of queryWritableItems<ItemData<T>>(this._data.values(), query)) {
			this._data.delete(id);
			this._times.set(id, now);
			count++;
		}
		if (count) {
			const key = _getQueryKey(query);
			this._times.set(key, now);
			this._changed.resolve();
		}
		return count;
	}
}

// Queries that have no limit don't care about sorting either.
const _getQueryKey = <T extends Data>(query: ItemQuery<T>): string => JSON.stringify(query);
