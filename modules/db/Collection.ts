import type { Datas, Key } from "../util/data.js";
import type { Nullish } from "../util/null.js";
import type { FilterList } from "../constraint/FilterConstraint.js";
import type { SortList } from "../constraint/SortConstraint.js";
import type { DeepIterable } from "../util/iterate.js";
import type { AsyncDatabase, Database } from "./Database.js";
import { ItemData, AsyncItem, Item } from "./Item.js";
import { AsyncQuery, Query } from "./Query.js";
import { AddChange, ItemChanges, WriteChange, changeAsyncProvider, changeProvider } from "./Change.js";

/** Reference to a collection in a synchronous or asynchronous provider. */
abstract class BaseCollection<T extends Datas = Datas, K extends Key<T> = Key<T>> {
	abstract readonly db: Database<T> | AsyncDatabase<T>;
	abstract readonly collection: K;

	/** Create a query on this item's collection. */
	abstract query(filters?: FilterList<Partial<ItemData<T[K]>>>, sorts?: SortList<Partial<ItemData<T[K]>>>, limit?: number | null): Query<T, K> | AsyncQuery<T, K>;

	/** Create a query on this item's collection. */
	abstract item(id: string): Item<T, K> | AsyncItem<T, K>;

	/** Add an item to this collection. */
	abstract add(data: T[K]): string | Promise<string>;

	/** Run a set of changes on this database. */
	abstract change(...changes: DeepIterable<Nullish<WriteChange<T, K>>>[]): ItemChanges<T, K> | Promise<ItemChanges<T, K>>;

	/** Get an add change for this collection. */
	getAdd(data: T[K]): AddChange<T, K> {
		return { action: "ADD", collection: this.collection, data };
	}

	// Implement toString()
	toString(): K {
		return this.collection;
	}
}

/** Reference to a collection in a synchronous provider. */
export class Collection<T extends Datas = Datas, K extends Key<T> = Key<T>> extends BaseCollection<T, K> {
	readonly db: Database<T>;
	readonly collection: K;
	constructor(db: Database<T>, collection: K) {
		super();
		this.db = db;
		this.collection = collection;
	}
	query(filters?: FilterList<Partial<ItemData<T[K]>>>, sorts?: SortList<Partial<ItemData<T[K]>>>, limit?: number | null): Query<T, K> {
		return new Query<T, K>(this.db, this.collection, filters, sorts, limit);
	}
	item(id: string): Item<T, K> {
		return new Item<T, K>(this.db, this.collection, id);
	}
	add(data: T[K]): string {
		return this.db.provider.addItem(this.collection, data);
	}
	change(...changes: DeepIterable<Nullish<WriteChange<T, K>>>[]): ItemChanges<T, K> {
		return changeProvider(this.db.provider, changes);
	}
}

/** Reference to a collection in an asynchronous provider. */
export class AsyncCollection<T extends Datas = Datas, K extends Key<T> = Key<T>> extends BaseCollection<T, K> {
	readonly db: AsyncDatabase<T>;
	readonly collection: K;
	constructor(db: AsyncDatabase<T>, collection: K) {
		super();
		this.db = db;
		this.collection = collection;
	}
	query(filters?: FilterList<Partial<ItemData<T[K]>>>, sorts?: SortList<Partial<ItemData<T[K]>>>, limit?: number | null): AsyncQuery<T, K> {
		return new AsyncQuery<T, K>(this.db, this.collection, filters, sorts, limit);
	}
	item(id: string): AsyncItem<T, K> {
		return new AsyncItem<T, K>(this.db, this.collection, id);
	}
	add(data: T[K]): Promise<string> {
		return this.db.provider.addItem(this.collection, data);
	}
	change(...changes: DeepIterable<Nullish<WriteChange<T, K>>>[]): Promise<ItemChanges<T, K>> {
		return changeAsyncProvider(this.db.provider, changes);
	}
}
