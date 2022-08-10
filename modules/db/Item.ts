import { Data, Datas, getData, Key } from "../util/data.js";
import type { Dispatch } from "../util/function.js";
import type { PartialObserver } from "../observe/Observer.js";
import type { ImmutableArray } from "../util/array.js";
import type { Observable, Unsubscribe } from "../observe/Observable.js";
import type { FilterProps } from "../constraint/FilterConstraint.js";
import { DataUpdate, PropUpdates } from "../update/DataUpdate.js";
import type { QueryConstraints } from "../constraint/QueryConstraints.js";
import type { AsyncDatabase, Database } from "./Database.js";
import type { AsyncQuery, Query } from "./Query.js";

/** Item data with a string ID that uniquely identifies it. */
export type ItemData<T extends Data = Data> = T & { id: string };

/** Entity or `null` to indicate the item doesn't exist. */
export type ItemValue<T extends Data = Data> = ItemData<T> | null;

/** An array of item data. */
export type ItemArray<T extends Data = Data> = ImmutableArray<ItemData<T>>;

/** A set of query constraints for item data. */
export type ItemConstraints<T extends Data = Data> = QueryConstraints<ItemData<T>>;

/** Reference to an item in a synchronous or asynchronous provider. */
interface ItemInterface<T extends Datas = Datas, K extends Key<T> = Key<T>> extends Observable<ItemValue<T[K]>> {
	readonly collection: K;
	readonly id: string;

	/** Get an 'optional' reference to this item (uses a `ModelQuery` with an `id` filter). */
	optional: Query<T, K> | AsyncQuery<T, K>;

	/**
	 * Does this item exist?
	 * @return `true` if an item exists or `false` otherwise (possibly promised).
	 */
	exists: boolean | PromiseLike<boolean>;

	/**
	 * Get the optional data of this item.
	 * @return Document's data, or `null` if the item doesn't exist (possibly promised).
	 */
	value: ItemValue<T[K]> | PromiseLike<ItemValue<T[K]>>;

	/**
	 * Get the data of this item.
	 * - Useful for destructuring, e.g. `{ name, title } = await itemThatMustExist.asyncData`
	 *
	 * @return Document's data (possibly promised).
	 * @throws RequiredError if the item does not exist.
	 */
	data: ItemData<T[K]> | PromiseLike<ItemData<T[K]>>;

	/**
	 * Subscribe to the result of this item (indefinitely).
	 * - `next()` is called once with the initial result, and again any time the result changes.
	 *
	 * @param next Observer with `next`, `error`, or `complete` methods or a `next()` dispatcher.
	 * @return Function that ends the subscription.
	 */
	subscribe(next: PartialObserver<ItemValue<T[K]>> | Dispatch<[ItemValue<T[K]>]>): Unsubscribe;

	/** Set the complete data of this item. */
	set(data: T[K]): void | PromiseLike<void>;

	/** Update this item. */
	update(updates: DataUpdate<T[K]> | PropUpdates<T[K]>): void | PromiseLike<void>;

	/** Delete this item. */
	delete(): void | PromiseLike<void>;

	// Implement toString()
	toString(): `${K}/${string}`;
}

/** Reference to an item in a synchronous provider. */
export class Item<T extends Datas = Datas, K extends Key<T> = Key<T>> implements ItemInterface<T, K> {
	readonly db: Database<T>;
	readonly collection: K;
	readonly id: string;
	constructor(db: Database<T>, collection: K, id: string) {
		this.db = db;
		this.collection = collection;
		this.id = id;
	}
	get optional(): Query<T, K> {
		return this.db.query(this.collection, { filter: { id: this.id } as FilterProps<ItemData<T[K]>>, limit: 1 });
	}
	get exists(): boolean {
		return !!this.db.provider.getItem(this.collection, this.id);
	}
	get value(): ItemValue<T[K]> {
		return this.db.provider.getItem(this.collection, this.id);
	}
	get data(): ItemData<T[K]> {
		return getData(this.value);
	}
	subscribe(next: PartialObserver<ItemValue<T[K]>> | Dispatch<[ItemValue<T[K]>]>): Unsubscribe {
		return this.db.provider.subscribeItem(this.collection, this.id, typeof next === "function" ? { next } : next);
	}
	set(data: T[K]): void {
		return this.db.provider.setItem(this.collection, this.id, data);
	}
	update(updates: DataUpdate<T[K]> | PropUpdates<T[K]>): void {
		return this.db.provider.updateItem(this.collection, this.id, updates instanceof DataUpdate ? updates : new DataUpdate(updates));
	}
	delete(): void {
		return this.db.provider.deleteItem(this.collection, this.id);
	}
	toString(): `${K}/${string}` {
		return `${this.collection}/${this.id}`;
	}
}

/** Reference to an item in an asynchronous provider. */
export class AsyncItem<T extends Datas = Datas, K extends Key<T> = Key<T>> implements ItemInterface<T, K> {
	readonly db: AsyncDatabase<T>;
	readonly collection: K;
	readonly id: string;
	constructor(provider: AsyncDatabase<T>, collection: K, id: string) {
		this.db = provider;
		this.collection = collection;
		this.id = id;
	}
	get optional(): AsyncQuery<T, K> {
		return this.db.query(this.collection, { filter: { id: this.id } as FilterProps<ItemData<T[K]>>, limit: 1 });
	}
	get exists(): Promise<boolean> {
		return this.db.provider.getItem(this.collection, this.id).then(Boolean);
	}
	get value(): Promise<ItemValue<T[K]>> {
		return this.db.provider.getItem(this.collection, this.id);
	}
	get data(): Promise<ItemData<T[K]>> {
		return this.value.then(getData);
	}
	subscribe(next: PartialObserver<ItemValue<T[K]>> | Dispatch<[ItemValue<T[K]>]>): Unsubscribe {
		return this.db.provider.subscribeItem(this.collection, this.id, typeof next === "function" ? { next } : next);
	}
	set(data: T[K]): Promise<void> {
		return this.db.provider.setItem(this.collection, this.id, data);
	}
	update(updates: DataUpdate<T[K]> | PropUpdates<T[K]>): Promise<void> {
		return this.db.provider.updateItem(this.collection, this.id, updates instanceof DataUpdate ? updates : new DataUpdate(updates));
	}
	delete(): Promise<void> {
		return this.db.provider.deleteItem(this.collection, this.id);
	}
	toString(): `${K}/${string}` {
		return `${this.collection}/${this.id}`;
	}
}

/** Get the ID from item data. */
export const getID = <T extends Data>({ id }: ItemData<T>): string => id;

/** Get the IDs of an iterable set item data. */
export function* getIDs<T extends Data>(entities: Iterable<ItemData<T>>): Iterable<string> {
	for (const { id } of entities) yield id;
}
