import type { ImmutableArray } from "../util/array.js";
import type { Stop, Handler, Dispatch } from "../util/function.js";
import type { QueryConstraints } from "../constraint/QueryConstraints.js";
import { Data, Datas, getData, DataKey } from "../util/data.js";
import { DataUpdate, Updates } from "../update/DataUpdate.js";
import { runSequence } from "../util/sequence.js";
import { FilterConstraint, FilterKey, FilterProps } from "../constraint/FilterConstraint.js";
import { FilterConstraints } from "../constraint/FilterConstraints.js";
import type { DeleteChange, SetChange, UpdateChange } from "./Change.js";
import type { AsyncQuery, Query } from "./Query.js";
import type { AsyncDatabase, Database } from "./Database.js";

/** Item data with a string ID that uniquely identifies it. */
export type ItemData<T extends Data = Data> = T & { id: string };

/** Entity or `null` to indicate the item doesn't exist. */
export type ItemValue<T extends Data = Data> = ItemData<T> | null;

/** An array of item data. */
export type ItemArray<T extends Data = Data> = ImmutableArray<ItemData<T>>;

/** A set of query constraints for item data. */
export type ItemConstraints<T extends Data = Data> = QueryConstraints<ItemData<T>>;

/** Reference to an item in a synchronous or asynchronous database. */
abstract class BaseItem<T extends Datas = Datas, K extends DataKey<T> = DataKey<T>> implements AsyncIterable<ItemValue<T[K]>> {
	abstract readonly db: Database<T> | AsyncDatabase<T>;
	abstract readonly collection: K;
	abstract readonly id: string;

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

	/** Set the complete data of this item. */
	abstract set(data: T[K]): void | PromiseLike<void>;

	/** Update this item. */
	abstract update(updates: DataUpdate<T[K]> | Updates<T[K]>): void | PromiseLike<void>;

	/** Delete this item. */
	abstract delete(): void | PromiseLike<void>;

	/** Get a set change for this item. */
	getSet(data: T[K]): SetChange<T, K> {
		return this.db.getSet(this.collection, this.id, data);
	}

	/** Get an update change for this item. */
	getUpdate(updates: Updates<T[K]>): UpdateChange<T, K> {
		return this.db.getUpdate(this.collection, this.id, updates);
	}

	/** Get a delete change for this item. */
	getDelete(): DeleteChange<T, K> {
		return this.db.getDelete(this.collection, this.id);
	}

	// Implement toString()
	toString(): `${K}/${string}` {
		return `${this.collection}/${this.id}`;
	}

	/** Subscribe to this item. */
	subscribe(onNext?: Dispatch<[ItemValue<T[K]>]>, onError?: Handler): Stop {
		return runSequence(this, onNext, onError);
	}

	// Implement AsyncIterable
	[Symbol.asyncIterator](): AsyncIterator<ItemValue<T[K]>> {
		return this.db.provider.getItemSequence(this.collection, this.id)[Symbol.asyncIterator]();
	}
}

/** Reference to an item in a synchronous database. */
export class Item<T extends Datas = Datas, K extends DataKey<T> = DataKey<T>> extends BaseItem<T, K> {
	readonly db: Database<T>;
	readonly collection: K;
	readonly id: string;
	constructor(db: Database<T>, collection: K, id: string) {
		super();
		this.db = db;
		this.collection = collection;
		this.id = id;
	}
	get optional(): Query<T, K> {
		return this.db.query(this.collection, getItemFilterConstraints(this.id), undefined, 1);
	}
	get exists(): boolean {
		return !!this.db.get(this.collection, this.id);
	}
	get value(): ItemValue<T[K]> {
		return this.db.get(this.collection, this.id);
	}
	get data(): ItemData<T[K]> {
		return getData(this.value);
	}
	set(data: T[K]): void {
		return this.db.set(this.collection, this.id, data);
	}
	update(updates: Updates<T[K]>): void {
		return this.db.update(this.collection, this.id, updates);
	}
	delete(): void {
		return this.db.delete(this.collection, this.id);
	}
}

/** Reference to an item in an asynchronous database. */
export class AsyncItem<T extends Datas = Datas, K extends DataKey<T> = DataKey<T>> extends BaseItem<T, K> {
	readonly db: AsyncDatabase<T>;
	readonly collection: K;
	readonly id: string;
	constructor(db: AsyncDatabase<T>, collection: K, id: string) {
		super();
		this.db = db;
		this.collection = collection;
		this.id = id;
	}
	get optional(): AsyncQuery<T, K> {
		return this.db.query(this.collection, { id: this.id } as FilterProps<ItemData<T[K]>>, undefined, 1);
	}
	get exists(): Promise<boolean> {
		return this.db.get(this.collection, this.id).then(Boolean);
	}
	get value(): Promise<ItemValue<T[K]>> {
		return this.db.get(this.collection, this.id);
	}
	get data(): Promise<ItemData<T[K]>> {
		return this.value.then(getData);
	}
	set(data: T[K]): Promise<void> {
		return this.db.set(this.collection, this.id, data);
	}
	update(updates: Updates<T[K]>): Promise<void> {
		return this.db.update(this.collection, this.id, updates);
	}
	delete(): Promise<void> {
		return this.db.delete(this.collection, this.id);
	}
}

/** Get the ID from item data. */
export const getID = <T extends Data>({ id }: ItemData<T>): string => id;

/** Get the IDs of an iterable set item data. */
export function* getIDs<T extends Data>(entities: Iterable<ItemData<T>>): Iterable<string> {
	for (const { id } of entities) yield id;
}

/** Get a `FilterConstraints` instance that targets a single item by its ID. */
export function getItemFilterConstraints<T extends Data>(id: string): FilterConstraints<ItemData<T>> {
	return new FilterConstraints<ItemData<T>>(new FilterConstraint<ItemData<T>>("id" as FilterKey<ItemData<T>>, id));
}
