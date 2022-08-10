import type { Data, Datas, Key } from "../util/data.js";
import type { Dispatch } from "../util/function.js";
import type { PartialObserver } from "../observe/Observer.js";
import type { ImmutableArray } from "../util/array.js";
import type { Observable, Unsubscribe } from "../observe/Observable.js";
import type { FilterProps } from "../constraint/FilterConstraint.js";
import { DataUpdate, PropUpdates } from "../update/DataUpdate.js";
import { RequiredError } from "../error/RequiredError.js";
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
abstract class AbstractItem<T extends Datas = Datas, K extends Key<T> = Key<T>> implements Observable<ItemValue<T[K]>> {
	readonly collection: K;
	readonly id: string;
	constructor(collection: K, id: string) {
		this.collection = collection;
		this.id = id;
	}

	/** Get an 'optional' reference to this item (uses a `ModelQuery` with an `id` filter). */
	abstract optional: Query<T, K> | AsyncQuery<T, K>;

	/**
	 * Does this item exist?
	 * @return `true` if an item exists or `false` otherwise (possibly promised).
	 */
	abstract exists: boolean | PromiseLike<boolean>;

	/**
	 * Get the optional data of this item.
	 * @return Document's data, or `null` if the item doesn't exist (possibly promised).
	 */
	abstract value: ItemValue<T[K]> | PromiseLike<ItemValue<T[K]>>;

	/**
	 * Get the data of this item.
	 * - Useful for destructuring, e.g. `{ name, title } = await itemThatMustExist.asyncData`
	 *
	 * @return Document's data (possibly promised).
	 * @throws RequiredError if the item does not exist.
	 */
	abstract data: ItemData<T[K]> | PromiseLike<ItemData<T[K]>>;

	/**
	 * Subscribe to the result of this item (indefinitely).
	 * - `next()` is called once with the initial result, and again any time the result changes.
	 *
	 * @param next Observer with `next`, `error`, or `complete` methods or a `next()` dispatcher.
	 * @return Function that ends the subscription.
	 */
	abstract subscribe(next: PartialObserver<ItemValue<T[K]>> | Dispatch<[ItemValue<T[K]>]>): Unsubscribe;

	/** Set the complete data of this item. */
	abstract set(data: T[K]): void | PromiseLike<void>;

	/** Update this item. */
	abstract update(updates: DataUpdate<T[K]> | PropUpdates<T[K]>): void | PromiseLike<void>;

	/** Delete this item. */
	abstract delete(): void | PromiseLike<void>;

	// Implement toString()
	toString(): string {
		return `${this.collection}/${this.id}`;
	}
}

/** Reference to an item in a synchronous provider. */
export class Item<T extends Datas = Datas, K extends Key<T> = Key<T>> extends AbstractItem<T, K> {
	readonly db: Database<T>;
	constructor(db: Database<T>, collection: K, id: string) {
		super(collection, id);
		this.db = db;
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
		return getItemData(this, this.value);
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
}

/** Reference to an item in an asynchronous provider. */
export class AsyncItem<T extends Datas = Datas, K extends Key<T> = Key<T>> extends AbstractItem<T, K> {
	readonly db: AsyncDatabase<T>;
	constructor(provider: AsyncDatabase<T>, collection: K, id: string) {
		super(collection, id);
		this.db = provider;
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
		return getAsyncItemData(this, this.value);
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
}

/** Get the data for an item from a value for that item. */
export function getItemData<T extends Datas, K extends Key<T>>(ref: AbstractItem<T, K>, value: ItemValue<T[K]>): ItemData<T[K]> {
	if (value) return value;
	throw new RequiredError(`Item "${ref}" does not exist`);
}

/** Get the data for an item from a promised value for that item. */
export async function getAsyncItemData<T extends Datas, K extends Key<T>>(ref: AbstractItem<T, K>, asyncValue: Promise<ItemValue<T[K]>>): Promise<ItemData<T[K]>> {
	return getItemData(ref, await asyncValue);
}

/** Get the ID from item data. */
export const getID = <T extends Data>({ id }: ItemData<T>): string => id;

/** Get the IDs of an iterable set item data. */
export function* getIDs<T extends Data>(entities: Iterable<ItemData<T>>): Iterable<string> {
	for (const { id } of entities) yield id;
}
