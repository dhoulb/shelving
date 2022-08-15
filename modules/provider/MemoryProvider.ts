import type { Data, Datas, Key } from "../util/data.js";
import type { ItemArray, ItemValue, ItemData, ItemConstraints } from "../db/Item.js";
import type { Updates } from "../update/DataUpdate.js";
import type { Dispatch } from "../util/function.js";
import type { Unsubscribe } from "../observe/Observable.js";
import { QueryConstraints } from "../constraint/QueryConstraints.js";
import { getRandomKey } from "../util/random.js";
import { isArrayEqual } from "../util/equal.js";
import { RequiredError } from "../error/RequiredError.js";
import { Subject } from "../observe/Subject.js";
import { dispatchNext, PartialObserver } from "../observe/Observer.js";
import { getArray } from "../util/array.js";
import { Constraint } from "../constraint/Constraint.js";
import { transformData } from "../util/transform.js";
import type { Provider } from "./Provider.js";

/**
 * Fast in-memory store for data.
 * - Extremely fast (ideal for caching!), but does not persist data after the browser window is closed.
 * - `get()` etc return the exact same instance of an object that's passed into `set()`
 */
export class MemoryProvider<T extends Datas> implements Provider<T> {
	/** List of tables in `{ collection: Table }` format. */
	private _tables: { [K in keyof T]?: MemoryTable<T[K]> } = {};

	/** Get a table for a collection. */
	getTable<K extends Key<T>>(collection: K): MemoryTable<T[K]> {
		return this._tables[collection] || (this._tables[collection] = new MemoryTable());
	}

	getDocumentTime<K extends Key<T>>(collection: K, id: string): number | null {
		return this.getTable(collection).getItemTime(id);
	}

	getItem<K extends Key<T>>(collection: K, id: string): ItemValue<T[K]> {
		return this.getTable(collection).getItem(id);
	}

	subscribeItem<K extends Key<T>>(collection: K, id: string, observer: PartialObserver<ItemValue<T[K]>>): Unsubscribe {
		return this.getTable(collection).subscribeItem(id, observer);
	}

	addItem<K extends Key<T>>(collection: K, data: T[K]): string {
		return this.getTable(collection).addItem(data);
	}

	setItem<K extends Key<T>>(collection: K, id: string, data: T[K]): void {
		return this.getTable(collection).setItem(id, data);
	}

	updateItem<K extends Key<T>>(collection: K, id: string, updates: Updates<T[K]>): void {
		return this.getTable(collection).updateItem(id, updates);
	}

	deleteItem<K extends Key<T>>(collection: K, id: string): void {
		return this.getTable(collection).deleteItem(id);
	}

	getQueryTime<K extends Key<T>>(collection: K, constraints: ItemConstraints<T[K]>): number | null {
		return this.getTable(collection).getQueryTime(constraints);
	}

	getQuery<K extends Key<T>>(collection: K, constraints: ItemConstraints<T[K]>): ItemArray<T[K]> {
		return this.getTable(collection).getQuery(constraints);
	}

	subscribeQuery<K extends Key<T>>(collection: K, constraints: ItemConstraints<T[K]>, observer: PartialObserver<ItemArray<T[K]>>): Unsubscribe {
		return this.getTable(collection).subscribeQuery(constraints, observer);
	}

	setQuery<K extends Key<T>>(collection: K, constraints: ItemConstraints<T[K]>, data: T[K]): number {
		return this.getTable(collection).setQuery(constraints, data);
	}

	updateQuery<K extends Key<T>>(collection: K, constraints: ItemConstraints<T[K]>, updates: Updates<T[K]>): number {
		return this.getTable(collection).updateQuery(constraints, updates);
	}

	deleteQuery<K extends Key<T>>(collection: K, constraints: ItemConstraints<T[K]>): number {
		return this.getTable(collection).deleteQuery(constraints);
	}
}

/**
 * An individual table of data.
 * - Fires with an array of string IDs.
 */
export class MemoryTable<T extends Data> extends Subject<void> {
	protected _data = new Map<string, ItemData<T>>();
	protected _times = new Map<string, number>();
	protected _listeners = new Set<Dispatch>();
	protected _firing = false;

	getItemTime(id: string): number | null {
		return this._times.get(id) || null;
	}

	setItemTime(id: string): void {
		this._times.set(id, Date.now());
	}

	getItem(id: string): ItemValue<T> {
		return this._data.get(id) || null;
	}

	subscribeItem(id: string, observer: PartialObserver<ItemValue<T>>): Unsubscribe {
		// Call next() immediately with initial results.
		let last = this.getItem(id);
		dispatchNext(observer, last);

		// Call next() every time the collection changes.
		return this.subscribe(() => {
			const next = this.getItem(id);
			if (next !== last) {
				last = next;
				dispatchNext(observer, last);
			}
		});
	}

	/** Subscribe to a query in this table, but only if the query has been explicitly set (and has a time). */
	subscribeCachedItem(id: string, observer: PartialObserver<ItemValue<T>>): Unsubscribe {
		// Call next() immediately with initial results.
		let last = this.getItem(id);
		if (this._times.has(id)) dispatchNext(observer, last);

		// Call next() every time the collection changes.
		return this.subscribe(() => {
			if (this._times.has(id)) {
				const next = this.getItem(id);
				if (next !== last) {
					last = next;
					dispatchNext(observer, last);
				}
			}
		});
	}

	addItem(data: T): string {
		let id = getRandomKey();
		while (this._data.has(id)) id = getRandomKey(); // Regenerate ID until unique.
		this.setItemData({ ...data, id });
		return id;
	}

	setItemData(data: ItemData<T>): void {
		const id = data.id;
		this._data.set(id, data);
		this.setItemTime(id);
		this.next();
	}

	setItem(id: string, data: T): void {
		this.setItemData({ ...data, id });
	}

	updateItem(id: string, updates: Updates<T>): void {
		const item = this._data.get(id);
		if (!item) throw new RequiredError(`Document "${id}" does not exist`);
		this.setItemData({ ...transformData(item, updates), id });
	}

	deleteItem(id: string): void {
		this._data.delete(id);
		this._times.set(id, Date.now());
		this.next();
	}

	getQueryTime(query: ItemConstraints<T>): number | null {
		return this._times.get(_getQueryKey(query)) || null;
	}

	setQueryTime(query: ItemConstraints<T>): void {
		this._times.set(_getQueryKey(query), Date.now());
	}

	getQuery(query: ItemConstraints<T>): ItemArray<T> {
		return getArray(query.transform(this._data.values()));
	}

	subscribeQuery(query: ItemConstraints<T>, observer: PartialObserver<ItemArray<T>>): Unsubscribe {
		// Call `next()` immediately with the initial results.
		let last = this.getQuery(query);
		dispatchNext(observer, last);

		// Possibly call `next()` when the collection changes if any changes affect the subscription.
		return this.subscribe(() => {
			const next = this.getQuery(query);
			if (!isArrayEqual(last, next)) {
				last = next;
				dispatchNext(observer, last);
			}
		});
	}

	/** Subscribe to a query in this table, but only if the query has been explicitly set (and has a time). */
	subscribeCachedQuery(query: ItemConstraints<T>, observer: PartialObserver<ItemArray<T>>): Unsubscribe {
		// Call next() immediately with initial results.
		const ref = _getQueryKey(query);
		let last = this.getQuery(query);
		if (this._times.has(ref)) dispatchNext(observer, last);

		// Call next() every time the collection changes.
		return this.subscribe(() => {
			if (this._times.has(ref)) {
				const next = this.getQuery(query);
				if (next !== last) {
					last = next;
					dispatchNext(observer, last);
				}
			}
		});
	}

	setItems(items: ItemArray<T>): number {
		let count = 0;
		for (const item of items) {
			this.setItemData(item);
			count++;
		}
		return count;
	}

	setQuery(constraints: ItemConstraints<T>, data: T): number {
		const now = Date.now();
		let count = 0;
		for (const { id } of _getWriteConstraints(constraints).transform(this._data.values())) {
			this._data.set(id, { ...data, id });
			this._times.set(id, now);
			count++;
		}
		this.setQueryTime(constraints);
		this.next();
		return count;
	}

	updateQuery(constraints: ItemConstraints<T>, updates: Updates<T>): number {
		const now = Date.now();
		let count = 0;
		for (const item of _getWriteConstraints(constraints).transform(this._data.values())) {
			this.setItemData({ ...transformData(item, updates), id: item.id });
			count++;
		}
		this._times.set(_getQueryKey(constraints), now);
		this.next();
		return count;
	}

	deleteQuery(constraints: ItemConstraints<T>): number {
		let count = 0;
		for (const { id } of _getWriteConstraints(constraints).transform(this._data.values())) {
			this._data.delete(id);
			this._times.set(id, Date.now());
			count++;
		}
		this._times.set(_getQueryKey(constraints), Date.now());
		this.next();
		return count;
	}
}

// When we're writing data, if there's no limit set the results don't need to be sorted (for performance).
const _getWriteConstraints = <T extends Data>(constraints: QueryConstraints<T>): Constraint<T> => (constraints.limit ? constraints : constraints.filters);

// Queries that have no limit don't care about sorting either.
const _getQueryKey = <T extends Data>(query: ItemConstraints<T>): string => (query.limit ? `"filters":${query.filters.toString()}}` : QueryConstraints.prototype.toString.call(query));
