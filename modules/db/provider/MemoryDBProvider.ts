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
	getTable<T extends Data>(collection: string): MemoryTable<I, T> {
		// biome-ignore lint/suspicious/noAssignInExpressions: This is convenient.
		return (this._tables[collection] ||= new MemoryTable<I, T>());
	}

	getItemTime<T extends Data>(collection: Collection<string, I, T>, id: I): number | undefined {
		return this.getTable<T>(collection.name).getItemTime(id);
	}

	async getItem<T extends Data>(collection: Collection<string, I, T>, id: I): Promise<OptionalItem<I, T>> {
		return this.getTable<T>(collection.name).getItem(id);
	}

	async *getItemSequence<T extends Data>(collection: Collection<string, I, T>, id: I): AsyncIterable<OptionalItem<I, T>> {
		yield* this.getTable<T>(collection.name).getItemSequence(id);
	}

	getCachedItemSequence<T extends Data>(collection: Collection<string, I, T>, id: I): AsyncIterable<OptionalItem<I, T>> {
		return this.getTable<T>(collection.name).getCachedItemSequence(id);
	}

	async addItem<T extends Data>(collection: Collection<string, I, T>, data: T): Promise<I> {
		return this.getTable<T>(collection.name).addItem(data);
	}

	async setItem<T extends Data>(collection: Collection<string, I, T>, id: I, data: T): Promise<void> {
		this.getTable<T>(collection.name).setItem(id, data);
	}

	setItemSequence<T extends Data>(
		collection: Collection<string, I, T>,
		id: I,
		sequence: AsyncIterable<OptionalItem<I, T>>,
	): AsyncIterable<OptionalItem<I, T>> {
		return this.getTable<T>(collection.name).setItemSequence(id, sequence);
	}

	async updateItem<T extends Data>(collection: Collection<string, I, T>, id: I, updates: Updates<T>): Promise<void> {
		this.getTable<T>(collection.name).updateItem(id, updates);
	}

	async deleteItem<T extends Data>(collection: Collection<string, I, T>, id: I): Promise<void> {
		this.getTable<T>(collection.name).deleteItem(id);
	}

	getQueryTime<T extends Data>(collection: Collection<string, I, T>, query?: ItemQuery<I, T>): number | undefined {
		return this.getTable<T>(collection.name).getQueryTime(query);
	}

	override async countQuery<T extends Data>(collection: Collection<string, I, T>, query?: ItemQuery<I, T>): Promise<number> {
		return this.getTable<T>(collection.name).countQuery(query);
	}

	async getQuery<T extends Data>(collection: Collection<string, I, T>, query?: ItemQuery<I, T>): Promise<Items<I, T>> {
		return this.getTable<T>(collection.name).getQuery(query);
	}

	async *getQuerySequence<T extends Data>(collection: Collection<string, I, T>, query?: ItemQuery<I, T>): AsyncIterable<Items<I, T>> {
		yield* this.getTable<T>(collection.name).getQuerySequence(query);
	}

	getCachedQuerySequence<T extends Data>(collection: Collection<string, I, T>, query?: ItemQuery<I, T>): AsyncIterable<Items<I, T>> {
		return this.getTable<T>(collection.name).getCachedQuerySequence(query);
	}

	async setQuery<T extends Data>(collection: Collection<string, I, T>, query: ItemQuery<I, T>, data: T): Promise<void> {
		this.getTable<T>(collection.name).setQuery(query, data);
	}

	async updateQuery<T extends Data>(collection: Collection<string, I, T>, query: ItemQuery<I, T>, updates: Updates<T>): Promise<void> {
		this.getTable<T>(collection.name).updateQuery(query, updates);
	}

	async deleteQuery<T extends Data>(collection: Collection<string, I, T>, query: ItemQuery<I, T>): Promise<void> {
		this.getTable<T>(collection.name).deleteQuery(query);
	}

	setItems<T extends Data>(collection: Collection<string, I, T>, items: Items<I, T>, query?: ItemQuery<I, T>): void {
		this.getTable<T>(collection.name).setItems(items, query);
	}

	setItemsSequence<T extends Data>(
		collection: Collection<string, I, T>,
		sequence: AsyncIterable<Items<I, T>>,
		query?: ItemQuery<I, T>,
	): AsyncIterable<Items<I, T>> {
		return this.getTable<T>(collection.name).setItemsSequence(sequence, query);
	}
}

/** An individual table of data. */
export class MemoryTable<I extends Identifier, T extends Data> {
	/** Actual data in this table. */
	protected readonly _data = new Map<Identifier, Item<I, T>>();

	/** Times data was last updated. */
	protected readonly _times = new Map<Identifier, number>();

	/** Times query results were last updated. */
	protected readonly _queryTimes = new Map<string, number>();

	/** Deferred sequence of next values. */
	public readonly next = new DeferredSequence();

	getItemTime(id: I): number | undefined {
		return this._times.get(id);
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

	/**
	 * Subscribe only after this item has been explicitly cached.
	 * - Emits nothing until this item has a cached timestamp.
	 * - Afterwards, only wakes/yields when this item's cache time changes.
	 */
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
		this._setItem(id, data);
	}

	protected _setItem(id: I, data: Item<I, T> | T, touchQueries = true): void {
		const item = getItem(id, data);
		if (this._data.get(id) !== item) {
			this._data.set(id, item);
			this._times.set(id, Date.now());
			if (touchQueries) this._touchQueries();
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
		this._updateItem(id, updates);
	}

	private _updateItem(id: I, updates: Updates<T>, touchQueries = true): void {
		const oldItem = this._data.get(id);
		if (oldItem) this._setItem(id, updateData<Item<I, T>>(oldItem, updates), touchQueries);
	}

	deleteItem(id: I): void {
		this._deleteItem(id);
	}

	protected _deleteItem(id: I, touchQueries = true): void {
		if (this._data.has(id)) {
			this._data.delete(id);
			this._times.set(id, Date.now());
			if (touchQueries) this._touchQueries();
			this.next.resolve();
		}
	}

	getQueryTime(query?: ItemQuery<I, T>): number | undefined {
		return this._queryTimes.get(_getQueryKey(query));
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

	/**
	 * Subscribe only after this query has been explicitly cached.
	 * - Emits nothing until this query has a cached query timestamp.
	 * - Afterwards, only wakes/yields when that cached query time changes.
	 */
	async *getCachedQuerySequence(query?: ItemQuery<I, T>): AsyncIterable<Items<I, T>> {
		const key = _getQueryKey(query);
		let lastTime = this._queryTimes.get(key);
		if (typeof lastTime === "number") yield this.getQuery(query);
		while (true) {
			await this.next;
			const nextTime = this._queryTimes.get(key);
			if (lastTime !== nextTime) {
				if (typeof nextTime === "number") yield this.getQuery(query);
				lastTime = nextTime;
			}
		}
	}

	setQuery(query: ItemQuery<I, T>, data: T): void {
		let changed = 0;
		for (const { id } of queryWritableItems<Item<I, T>>(this._data.values(), query)) {
			this._setItem(id, data, false);
			changed++;
		}
		if (changed) {
			const key = _getQueryKey(query);
			this._queryTimes.set(key, Date.now());
			this.next.resolve();
		}
	}

	updateQuery(query: ItemQuery<I, T>, updates: Updates<T>): void {
		let count = 0;
		for (const { id } of queryWritableItems<Item<I, T>>(this._data.values(), query)) {
			this._updateItem(id, updates, false);
			count++;
		}
		if (count) {
			const key = _getQueryKey(query);
			this._queryTimes.set(key, Date.now());
			this.next.resolve();
		}
	}

	deleteQuery(query: ItemQuery<I, T>): void {
		let count = 0;
		for (const { id } of queryWritableItems<Item<I, T>>(this._data.values(), query)) {
			this._deleteItem(id, false);
			count++;
		}
		if (count) {
			const key = _getQueryKey(query);
			this._queryTimes.set(key, Date.now());
			this.next.resolve();
		}
	}

	setItems(items: Items<I, T>, query?: ItemQuery<I, T>): void {
		for (const item of items) this._setItem(item.id, item, !query);
		if (query) {
			const key = _getQueryKey(query);
			this._queryTimes.set(key, Date.now());
			this.next.resolve();
		}
	}

	async *setItemsSequence(sequence: AsyncIterable<Items<I, T>>, query?: ItemQuery<I, T>): AsyncIterable<Items<I, T>> {
		for await (const items of sequence) {
			this.setItems(items, query);
			yield items;
		}
	}

	protected _touchQueries(): void {
		if (!this._queryTimes.size) return;
		const time = Date.now();
		for (const key of this._queryTimes.keys()) this._queryTimes.set(key, time);
	}
}

// Queries that have no limit don't care about sorting either.
const _getQueryKey = <I extends Identifier, T extends Data>(query?: ItemQuery<I, T>): string => (query ? JSON.stringify(query) : "{}");
