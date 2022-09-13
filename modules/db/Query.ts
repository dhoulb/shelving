import type { DataKey, Datas } from "../util/data.js";
import type { Dispatch, Handler, Stop } from "../util/function.js";
import type { Updates } from "../update/DataUpdate.js";
import type { FilterList } from "../constraint/FilterConstraint.js";
import type { SortList } from "../constraint/SortConstraint.js";
import { getFirstItem, getLastItem, getOptionalFirstItem, getOptionalLastItem } from "../util/array.js";
import { countItems, hasItems } from "../util/iterate.js";
import { runSequence } from "../util/sequence.js";
import { QueryConstraints } from "../constraint/QueryConstraints.js";
import type { ItemArray, ItemValue, ItemData } from "./Item.js";
import type { AsyncDatabase, Database } from "./Database.js";

/** Reference to a set of items in a sync or async provider. */
abstract class BaseQuery<T extends Datas = Datas, K extends DataKey<T> = DataKey<T>> extends QueryConstraints<ItemData<T[K]>> implements AsyncIterable<ItemArray<T[K]>> {
	abstract readonly db: Database<T> | AsyncDatabase<T>;
	abstract readonly collection: K;

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
	abstract firstData: ItemData<T[K]> | PromiseLike<ItemData<T[K]>>;

	/**
	 * Get the last item matched by this query or `null` if this query has no results.
	 * @throws RequiredError if there were no results for this query.
	 */
	abstract lastValue: ItemValue<T[K]> | PromiseLike<ItemValue<T[K]>>;

	/**
	 * Get the last item matched by this query.
	 * @throws RequiredError if there were no results for this query.
	 */
	abstract lastData: ItemData<T[K]> | PromiseLike<ItemData<T[K]>>;

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
	abstract update(updates: Updates<T[K]>): number | PromiseLike<number>;

	/**
	 * Delete all matching items.
	 * @return Nothing (possibly promised).
	 */
	abstract delete(): number | PromiseLike<number>;

	// Override to include the collection name.
	override toString(): string {
		return `${this.collection}?{${super.toString()}`;
	}

	/** Subscribe to this item. */
	subscribe(onNext?: Dispatch<[ItemArray<T[K]>]>, onError?: Handler): Stop {
		return runSequence(this, onNext, onError);
	}

	// Implement AsyncIterable
	[Symbol.asyncIterator](): AsyncIterator<ItemArray<T[K]>> {
		return this.db.provider.getQuerySequence(this.collection, this)[Symbol.asyncIterator]();
	}
}

/** Reference to a set of items in a provider. */
export class Query<T extends Datas = Datas, K extends DataKey<T> = DataKey<T>> extends BaseQuery<T, K> {
	readonly db: Database<T>;
	readonly collection: K;
	constructor(db: Database<T>, collection: K, filters?: FilterList<Partial<ItemData<T[K]>>>, sorts?: SortList<Partial<ItemData<T[K]>>>, limit?: number | null) {
		super(filters, sorts, limit);
		this.db = db;
		this.collection = collection;
	}
	get value(): ItemArray<T[K]> {
		return this.db.provider.getQuery(this.collection, this);
	}
	get count(): number {
		return this.value.length;
	}
	get exists(): boolean {
		return hasItems(this.max(1).value);
	}
	get firstValue(): ItemValue<T[K]> {
		return getOptionalFirstItem(this.max(1).value);
	}
	get firstData(): ItemData<T[K]> {
		return getFirstItem(this.max(1).value);
	}
	get lastValue(): ItemValue<T[K]> {
		return getOptionalLastItem(this.value);
	}
	get lastData(): ItemData<T[K]> {
		return getLastItem(this.value);
	}
	set(data: T[K]): number {
		return this.db.provider.setQuery(this.collection, this, data);
	}
	update(updates: Updates<T[K]>): number {
		return this.db.provider.updateQuery(this.collection, this, updates);
	}
	delete(): number {
		return this.db.provider.deleteQuery(this.collection, this);
	}
}

/** Reference to a set of items in a provider. */
export class AsyncQuery<T extends Datas = Datas, K extends DataKey<T> = DataKey<T>> extends BaseQuery<T, K> {
	readonly db: AsyncDatabase<T>;
	readonly collection: K;
	constructor(db: AsyncDatabase<T>, collection: K, filters?: FilterList<Partial<ItemData<T[K]>>>, sorts?: SortList<Partial<ItemData<T[K]>>>, limit?: number | null) {
		super(filters, sorts, limit);
		this.db = db;
		this.collection = collection;
	}
	get value(): Promise<ItemArray<T[K]>> {
		return this.db.provider.getQuery(this.collection, this);
	}
	get count(): Promise<number> {
		return this.value.then(countItems);
	}
	get exists(): Promise<boolean> {
		return this.max(1).value.then(hasItems);
	}
	get firstValue(): Promise<ItemValue<T[K]>> {
		return this.max(1).value.then(getOptionalFirstItem);
	}
	get firstData(): Promise<ItemData<T[K]>> {
		return this.max(1).value.then(getFirstItem);
	}
	get lastValue(): Promise<ItemValue<T[K]>> {
		return this.value.then(getOptionalLastItem);
	}
	get lastData(): Promise<ItemData<T[K]>> {
		return this.value.then(getLastItem);
	}
	set(data: T[K]): Promise<number> {
		return this.db.provider.setQuery(this.collection, this, data);
	}
	update(updates: Updates<T[K]>): PromiseLike<number> {
		return this.db.provider.updateQuery(this.collection, this, updates);
	}
	delete(): PromiseLike<number> {
		return this.db.provider.deleteQuery(this.collection, this);
	}
}
