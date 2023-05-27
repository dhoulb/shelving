import type { Provider } from "./Provider.js";
import type { ItemArray, ItemData, ItemQuery, ItemValue } from "../db/ItemReference.js";
import type { Data } from "../util/data.js";
import type { Updates } from "../util/update.js";
import { getItemData } from "../db/ItemReference.js";
import { RequiredError } from "../error/RequiredError.js";
import { DeferredSequence } from "../sequence/DeferredSequence.js";
import { getArray } from "../util/array.js";
import { isArrayEqual } from "../util/equal.js";
import { filterSequence } from "../util/match.js";
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

	getItemTime(collection: string, id: string): number | undefined {
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

	setItem(collection: string, id: string, data: Data): boolean {
		return this.getTable(collection).setItem(id, data);
	}

	updateItem(collection: string, id: string, updates: Updates): boolean {
		return this.getTable(collection).updateItem(id, updates);
	}

	deleteItem(collection: string, id: string): boolean {
		return this.getTable(collection).deleteItem(id);
	}

	getQueryTime(collection: string, query: ItemQuery): number | undefined {
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

	getItemTime(id: string): number | undefined {
		return this._times.get(id);
	}

	getItem(id: string): ItemValue<T> {
		return this._data.get(id);
	}

	async *getItemSequence(id: string): AsyncIterable<ItemValue<T>> {
		let last = this._times.get(id);
		yield this.getItem(id);
		while (true) {
			await this._changed;
			const next = this._times.get(id);
			if (next !== last) {
				last = next;
				yield this.getItem(id);
			}
		}
	}

	/** Subscribe to a query in this table, but only if the query has been explicitly set (i.e. has a time). */
	getCachedItemSequence(id: string): AsyncIterable<ItemValue<T>> {
		return filterSequence(this.getItemSequence(id), () => this._times.has(id));
	}

	addItem(data: T): string {
		let id = getRandomKey();
		while (this._data.has(id)) id = getRandomKey(); // Regenerate ID until unique.
		this.setItemData(getItemData(id, data));
		return id;
	}

	setItemData(item: ItemData<T>): boolean {
		const id = item.id;
		if (this._data.get(id) !== item) {
			this._data.set(id, item);
			this._times.set(id, Date.now());
			this._changed.resolve();
			return true;
		}
		return false;
	}

	setItem(id: string, data: ItemData<T> | T): boolean {
		return this.setItemData(getItemData(id, data));
	}

	setItemValue(id: string, value: ItemData<T> | T | undefined): boolean {
		return value ? this.setItem(id, value) : this.deleteItem(id);
	}

	async *setItemValueSequence(id: string, sequence: AsyncIterable<ItemValue<T>>): AsyncIterable<ItemValue> {
		for await (const value of sequence) {
			this.setItemValue(id, value);
			yield value;
		}
	}

	updateItem(id: string, updates: Updates<T>): boolean {
		const oldItem = this._data.get(id);
		if (!oldItem) throw new RequiredError(`Document "${id}" does not exist`);
		return this.setItemData(updateData<ItemData<T>>(oldItem, updates));
	}

	deleteItem(id: string): boolean {
		if (this._data.has(id)) {
			this._data.delete(id);
			this._times.set(id, Date.now());
			this._changed.resolve();
			return true;
		}
		return false;
	}

	getQueryTime(query: ItemQuery<T>): number | undefined {
		return this._times.get(_getQueryKey(query)) || undefined;
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
	getCachedQuerySequence(query: ItemQuery<T>): AsyncIterable<ItemArray<T>> {
		const key = _getQueryKey(query);
		return filterSequence(this.getQuerySequence(query), () => this._times.has(key));
	}

	setItemArray(items: ItemArray<T>): number {
		let count = 0;
		for (const item of items) if (this.setItemData(item)) count++;
		return count;
	}

	async *setItemArraySequence(sequence: AsyncIterable<ItemArray<T>>): AsyncIterable<ItemArray<T>> {
		for await (const items of sequence) {
			this.setItemArray(items);
			yield items;
		}
	}

	setQueryArray(query: ItemQuery<T>, items: ItemArray<T>): void {
		const key = _getQueryKey(query);
		this._times.set(key, Date.now());
		this.setItemArray(items);
		this._changed.resolve();
	}

	async *setQueryArraySequence(query: ItemQuery<T>, sequence: AsyncIterable<ItemArray<T>>): AsyncIterable<ItemArray<T>> {
		const key = _getQueryKey(query);
		for await (const items of sequence) {
			this._times.set(key, Date.now());
			this.setItemArray(items);
			this._changed.resolve();
			yield items;
		}
	}

	setQuery(query: ItemQuery<T>, data: T): number {
		let count = 0;
		for (const { id } of queryWritableItems<ItemData<T>>(this._data.values(), query)) if (this.setItem(id, data)) count++;
		if (count) {
			const key = _getQueryKey(query);
			this._times.set(key, Date.now());
			this._changed.resolve();
		}
		return count;
	}

	updateQuery(query: ItemQuery<T>, updates: Updates<T>): number {
		let count = 0;
		for (const { id } of queryWritableItems<ItemData<T>>(this._data.values(), query)) if (this.updateItem(id, updates)) count++;
		if (count) {
			const key = _getQueryKey(query);
			this._times.set(key, Date.now());
			this._changed.resolve();
		}
		return count;
	}

	deleteQuery(query: ItemQuery<T>): number {
		let count = 0;
		for (const { id } of queryWritableItems<ItemData<T>>(this._data.values(), query)) if (this.deleteItem(id)) count++;
		if (count) {
			const key = _getQueryKey(query);
			this._times.set(key, Date.now());
			this._changed.resolve();
		}
		return count;
	}
}

// Queries that have no limit don't care about sorting either.
const _getQueryKey = <T extends Data>(query: ItemQuery<T>): string => JSON.stringify(query);
