import type { Dispatch } from "../util/function.js";
import type { Key, Datas } from "../util/data.js";
import type { PartialObserver } from "../observe/Observer.js";
import type { Observable, Unsubscribe } from "../observe/Observable.js";
import { getFirstItem, getLastItem } from "../util/array.js";
import { QueryConstraints, QueryProps } from "../constraint/QueryConstraints.js";
import { countItems, hasItems } from "../util/iterate.js";
import { DataUpdate, PropUpdates } from "../update/DataUpdate.js";
import { RequiredError } from "../error/RequiredError.js";
import type { ItemArray, ItemValue, ItemData } from "./Item.js";
import type { AsyncDatabase, Database } from "./Database.js";

/** Reference to a set of items in a sync or async provider. */
abstract class AbstractQuery<T extends Datas = Datas, K extends Key<T> = Key<T>> extends QueryConstraints<ItemData<T[K]>> implements Observable<ItemArray<T[K]>> {
	readonly collection: K;
	constructor(collection: K, props?: QueryProps<ItemData<T[K]>>) {
		super(props);
		this.collection = collection;
	}

	/**
	 * Get array of entities for this query.
	 * @return Array of entities.
	 */
	abstract value: ItemArray<T[K]> | PromiseLike<ItemArray<T[K]>>;

	/**
	 * Count the number of results of this set of items.
	 * @return Number of items matching the query (possibly promised).
	 */
	abstract count: number | PromiseLike<number>;

	/**
	 * Does at least one item exist for this query?
	 * @return `true` if a item exists or `false` otherwise (possibly promised).
	 */
	abstract exists: boolean | PromiseLike<boolean>;

	/**
	 * Get the first item matched by this query or `null` if this query has no results.
	 * @throws RequiredError if there were no results for this query.
	 */
	abstract firstValue: ItemValue<T[K]> | PromiseLike<ItemValue<T[K]>>;

	/**
	 * Get the first item matched by this query.
	 * @throws RequiredError if there were no results for this query.
	 */
	abstract lastData: ItemData<T[K]> | PromiseLike<ItemData<T[K]>>;

	/**
	 * Subscribe to all matching items.
	 * - `next()` is called once with the initial results, and again any time the results change.
	 *
	 * @param next Observer with `next`, `error`, or `complete` methods or a `next()` dispatcher.
	 * @return Function that ends the subscription.
	 */
	abstract subscribe(next: PartialObserver<ItemArray<T[K]>> | Dispatch<[ItemArray<T[K]>]>): Unsubscribe;

	/**
	 * Set all matching items to the same exact value.
	 *
	 * @param data Complete data to set the item to.
	 * @return Nothing (possibly promised).
	 */
	abstract set(data: T[K]): number | PromiseLike<number>;

	/**
	 * Update all matching items with the same partial value.
	 *
	 * @param updates `Update` instance or set of updates to apply to every matching item.
	 * @return Nothing (possibly promised).
	 */
	abstract update(updates: DataUpdate<T[K]> | PropUpdates<T[K]>): number | PromiseLike<number>;

	/**
	 * Delete all matching items.
	 * @return Nothing (possibly promised).
	 */
	abstract delete(): number | PromiseLike<number>;

	// Override to include the collection name.
	override toString(): string {
		return `${this.collection}?${super.toString()}`;
	}
}

/** Reference to a set of items in a provider. */
export class Query<T extends Datas = Datas, K extends Key<T> = Key<T>> extends AbstractQuery<T, K> {
	readonly db: Database<T>;
	constructor(db: Database<T>, collection: K, props?: QueryProps<ItemData<T[K]>>) {
		super(collection, props);
		this.db = db;
	}
	get value(): ItemArray<T[K]> {
		return this.db.provider.getQuery(this.collection, this);
	}
	get count(): number {
		return this.value.length;
	}
	get exists(): boolean {
		return hasItems(this.db.provider.getQuery(this.collection, this.max(1)));
	}
	get firstValue(): ItemValue<T[K]> {
		return getQueryFirstItem(this.db.provider.getQuery(this.collection, this.max(1)));
	}
	get lastData(): ItemData<T[K]> {
		return getQueryFirstData(this.db.provider.getQuery(this.collection, this.max(1)), this);
	}
	subscribe(next: PartialObserver<ItemArray<T[K]>> | Dispatch<[ItemArray<T[K]>]>): Unsubscribe {
		return this.db.provider.subscribeQuery(this.collection, this, typeof next === "function" ? { next } : next);
	}
	set(data: T[K]): number {
		return this.db.provider.setQuery(this.collection, this, data);
	}
	update(updates: DataUpdate<T[K]> | PropUpdates<T[K]>): number {
		return this.db.provider.updateQuery(this.collection, this, updates instanceof DataUpdate ? updates : new DataUpdate(updates));
	}
	delete(): number {
		return this.db.provider.deleteQuery(this.collection, this);
	}
}

/** Reference to a set of items in a provider. */
export class AsyncQuery<T extends Datas = Datas, K extends Key<T> = Key<T>> extends AbstractQuery<T, K> {
	readonly db: AsyncDatabase<T>;
	constructor(db: AsyncDatabase<T>, collection: K, props?: QueryProps<ItemData<T[K]>>) {
		super(collection, props);
		this.db = db;
	}
	get value(): Promise<ItemArray<T[K]>> {
		return this.db.provider.getQuery(this.collection, this);
	}
	get count(): Promise<number> {
		return this.value.then(countItems);
	}
	get exists(): Promise<boolean> {
		return this.db.provider.getQuery(this.collection, this.max(1)).then(hasItems);
	}
	get firstValue(): Promise<ItemValue<T[K]>> {
		return this.db.provider.getQuery(this.collection, this.max(1)).then(getQueryFirstItem);
	}
	get lastData(): Promise<ItemData<T[K]>> {
		return this.db.provider.getQuery(this.collection, this.max(1)).then(v => getQueryFirstData(v, this));
	}
	subscribe(next: PartialObserver<ItemArray<T[K]>> | Dispatch<[ItemArray<T[K]>]>): Unsubscribe {
		return this.db.provider.subscribeQuery(this.collection, this, typeof next === "function" ? { next } : next);
	}
	set(data: T[K]): Promise<number> {
		return this.db.provider.setQuery(this.collection, this, data);
	}
	update(updates: DataUpdate<T[K]> | PropUpdates<T[K]>): PromiseLike<number> {
		return this.db.provider.updateQuery(this.collection, this, updates instanceof DataUpdate ? updates : new DataUpdate(updates));
	}
	delete(): PromiseLike<number> {
		return this.db.provider.deleteQuery(this.collection, this);
	}
}

/** Get the optional data for a item from a set of queried entities. */
export function getQueryFirstItem<T extends Datas, K extends Key<T>>(entities: ItemArray<T[K]>): ItemValue<T[K]> {
	return getFirstItem(entities) || null;
}

/** Get the data for a item from a set of queried entities. */
export function getQueryFirstData<T extends Datas, K extends Key<T>>(entities: ItemArray<T[K]>, ref: AbstractQuery<T, K>): ItemData<T[K]> {
	const entity = getQueryFirstItem(entities);
	if (entity) return entity;
	throw new RequiredError(`Query "${ref}" has no items`);
}

/** Get the optional data for a item from a set of queried entities. */
export function getQueryLastItem<T extends Datas, K extends Key<T>>(entities: ItemArray<T[K]>): ItemValue<T[K]> {
	return getLastItem(entities) || null;
}

/** Get the data for a item from a set of queried entities. */
export function getQueryLastData<T extends Datas, K extends Key<T>>(entities: ItemArray<T[K]>, ref: AbstractQuery<T, K>): ItemData<T[K]> {
	const entity = getQueryLastItem(entities);
	if (entity) return entity;
	throw new RequiredError(`Query "${ref}" has no items`);
}
