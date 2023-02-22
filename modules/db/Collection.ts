import type { Datas, DataKey } from "../util/data.js";
import type { Nullish } from "../util/null.js";
import type { FilterList } from "../constraint/FilterConstraint.js";
import type { SortList } from "../constraint/SortConstraint.js";
import type { DeepIterable } from "../util/iterate.js";
import type { Updates } from "../update/DataUpdate.js";
import type { AsyncDatabase, Database } from "./Database.js";
import { ItemData, AsyncItem, Item, ItemValue } from "./Item.js";
import { AsyncQuery, Query } from "./Query.js";
import { AddChange, ItemChanges, WriteChange, changeAsyncProvider, changeProvider, UpdateChange, DeleteChange, SetChange } from "./Change.js";

/** Reference to a collection in a synchronous or asynchronous provider. */
abstract class BaseCollection<T extends Datas = Datas, K extends DataKey<T> = DataKey<T>> {
	abstract readonly db: Database<T> | AsyncDatabase<T>;
	abstract readonly collection: K;

	/** Create a query on this item's collection. */
	abstract query(filters?: FilterList<Partial<ItemData<T[K]>>>, sorts?: SortList<Partial<ItemData<T[K]>>>, limit?: number | null): Query<T, K> | AsyncQuery<T, K>;

	/** Create a query on this item's collection. */
	abstract item(id: string): Item<T, K> | AsyncItem<T, K>;

	/** Run a set of changes on this database. */
	abstract change(...changes: DeepIterable<Nullish<WriteChange<T, K>>>[]): ItemChanges<T, K> | Promise<ItemChanges<T, K>>;

	/** Get an item from this collection. */
	abstract get(id: string): ItemValue<T[K]> | Promise<ItemValue<T[K]>>;

	/** Add an item to this collection. */
	abstract add(data: T[K]): string | Promise<string>;

	/** Set a document in this collection. */
	abstract set(id: string, data: T[K]): void | Promise<void>;

	/** Update a document in this collection. */
	abstract update(id: string, updates: Updates<T[K]>): void | Promise<void>;

	/** Delete a document in this collection. */
	abstract delete(id: string): void | Promise<void>;

	/** Get an add change for this collection. */
	getAdd(data: T[K]): AddChange<T, K> {
		return this.db.getAdd(this.collection, data);
	}

	/** Get a set change for this collection. */
	getSet(id: string, data: T[K]): SetChange<T, K> {
		return this.db.getSet(this.collection, id, data);
	}

	/** Get an update change for this collection. */
	getUpdate(id: string, updates: Updates<T[K]>): UpdateChange<T, K> {
		return this.db.getUpdate(this.collection, id, updates);
	}

	/** Get a delete change for this collection. */
	getDelete(id: string): DeleteChange<T, K> {
		return this.db.getDelete(this.collection, id);
	}

	// Implement toString()
	toString(): K {
		return this.collection;
	}
}

/** Reference to a collection in a synchronous provider. */
export class Collection<T extends Datas = Datas, K extends DataKey<T> = DataKey<T>> extends BaseCollection<T, K> {
	readonly db: Database<T>;
	readonly collection: K;
	constructor(db: Database<T>, collection: K) {
		super();
		this.db = db;
		this.collection = collection;
	}
	query(filters?: FilterList<ItemData<T[K]>>, sorts?: SortList<ItemData<T[K]>>, limit?: number | null): Query<T, K> {
		return new Query<T, K>(this.db, this.collection, filters, sorts, limit);
	}
	item(id: string): Item<T, K> {
		return new Item<T, K>(this.db, this.collection, id);
	}
	change(...changes: DeepIterable<Nullish<WriteChange<T, K>>>[]): ItemChanges<T, K> {
		return changeProvider(this.db.provider, changes);
	}
	get(id: string): ItemValue<T[K]> {
		return this.db.get(this.collection, id);
	}
	add(data: T[K]): string {
		return this.db.add(this.collection, data);
	}
	set(id: string, data: T[K]): void {
		return this.db.set(this.collection, id, data);
	}
	update(id: string, updates: Updates<T[K]>): void {
		return this.db.update(this.collection, id, updates);
	}
	delete(id: string): void {
		return this.db.delete(this.collection, id);
	}
}

/** Reference to a collection in an asynchronous provider. */
export class AsyncCollection<T extends Datas = Datas, K extends DataKey<T> = DataKey<T>> extends BaseCollection<T, K> {
	readonly db: AsyncDatabase<T>;
	readonly collection: K;
	constructor(db: AsyncDatabase<T>, collection: K) {
		super();
		this.db = db;
		this.collection = collection;
	}
	query(filters?: FilterList<ItemData<T[K]>>, sorts?: SortList<ItemData<T[K]>>, limit?: number | null): AsyncQuery<T, K> {
		return new AsyncQuery<T, K>(this.db, this.collection, filters, sorts, limit);
	}
	item(id: string): AsyncItem<T, K> {
		return new AsyncItem<T, K>(this.db, this.collection, id);
	}
	change(...changes: DeepIterable<Nullish<WriteChange<T, K>>>[]): Promise<ItemChanges<T, K>> {
		return changeAsyncProvider(this.db.provider, changes);
	}
	get(id: string): Promise<ItemValue<T[K]>> {
		return this.db.get(this.collection, id);
	}
	add(data: T[K]): Promise<string> {
		return this.db.add(this.collection, data);
	}
	set(id: string, data: T[K]): Promise<void> {
		return this.db.set(this.collection, id, data);
	}
	update(id: string, updates: Updates<T[K]>): Promise<void> {
		return this.db.update(this.collection, id, updates);
	}
	delete(id: string): Promise<void> {
		return this.db.delete(this.collection, id);
	}
}
