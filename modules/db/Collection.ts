import type { QueryProps } from "../constraint/QueryConstraints.js";
import type { Datas, Key } from "../util/data.js";
import type { ItemData, AsyncItem, Item } from "./Item.js";
import type { AsyncDatabase, Database } from "./Database.js";
import type { AsyncQuery, Query } from "./Query.js";

/** Reference to a collection in a synchronous or asynchronous provider. */
export abstract class AbstractCollection<T extends Datas = Datas, K extends Key<T> = Key<T>> {
	abstract readonly db: Database<T> | AsyncDatabase<T>;
	abstract readonly collection: K;

	/** Create a query on this item's collection. */
	abstract query(query?: QueryProps<ItemData<T[K]>>): Query<T, K> | AsyncQuery<T, K>;

	/** Create a query on this item's collection. */
	abstract item(id: string): Item<T, K> | AsyncItem<T, K>;

	/** Add an item to this collection. */
	abstract add(data: T[K]): string | Promise<string>;

	// Implement toString()
	toString(): string {
		return this.collection;
	}
}

/** Reference to a collection in a synchronous provider. */
export class Collection<T extends Datas = Datas, K extends Key<T> = Key<T>> extends AbstractCollection<T, K> {
	readonly db: Database<T>;
	readonly collection: K;
	constructor(db: Database<T>, collection: K) {
		super();
		this.db = db;
		this.collection = collection;
	}
	query(query?: QueryProps<ItemData<T[K]>>): Query<T, K> {
		return this.db.query(this.collection, query);
	}
	item(id: string): Item<T, K> {
		return this.db.item(this.collection, id);
	}
	add(data: T[K]): string {
		return this.db.provider.addItem(this.collection, data);
	}
}

/** Reference to a collection in an asynchronous provider. */
export class AsyncCollection<T extends Datas = Datas, K extends Key<T> = Key<T>> extends AbstractCollection<T, K> {
	readonly db: AsyncDatabase<T>;
	readonly collection: K;
	constructor(db: AsyncDatabase<T>, collection: K) {
		super();
		this.db = db;
		this.collection = collection;
	}
	query(query?: QueryProps<ItemData<T[K]>>): AsyncQuery<T, K> {
		return this.db.query(this.collection, query);
	}
	item(id: string): AsyncItem<T, K> {
		return this.db.item(this.collection, id);
	}
	add(data: T[K]): Promise<string> {
		return this.db.provider.addItem(this.collection, data);
	}
}
