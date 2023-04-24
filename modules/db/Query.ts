import type { Data } from "../util/data.js";
import type { Dispatch, Handler, Stop } from "../util/function.js";
import type { Updates } from "../update/DataUpdate.js";
import type { Provider, AsyncProvider } from "../provider/Provider.js";
import { getFirstItem, getLastItem, getOptionalFirstItem, getOptionalLastItem, isArrayLength, countArray } from "../util/array.js";
import { runSequence } from "../util/sequence.js";
import { Statement } from "../constraint/Statement.js";
import type { PossibleFilters } from "../constraint/Filters.js";
import type { PossibleSorts } from "../constraint/Sorts.js";
import type { ItemArray, ItemValue, ItemData } from "./Item.js";

/** Reference to a set of items in a sync or async provider. */
abstract class BaseQuery<T extends Data = Data> extends Statement<ItemData<T>> implements AsyncIterable<ItemArray<T>> {
	abstract readonly provider: Provider | AsyncProvider;
	abstract readonly collection: string;

	/**
	 * Get array of entities for this query.
	 * @return Array of entities.
	 */
	abstract value: ItemArray<T> | PromiseLike<ItemArray<T>>;

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
	abstract firstValue: ItemValue<T> | PromiseLike<ItemValue<T>>;

	/**
	 * Get the first item matched by this query.
	 * @throws RequiredError if there were no results for this query.
	 */
	abstract firstData: ItemData<T> | PromiseLike<ItemData<T>>;

	/**
	 * Get the last item matched by this query or `null` if this query has no results.
	 * @throws RequiredError if there were no results for this query.
	 */
	abstract lastValue: ItemValue<T> | PromiseLike<ItemValue<T>>;

	/**
	 * Get the last item matched by this query.
	 * @throws RequiredError if there were no results for this query.
	 */
	abstract lastData: ItemData<T> | PromiseLike<ItemData<T>>;

	/**
	 * Set all matching items to the same exact value.
	 *
	 * @param data Complete data to set the item to.
	 * @return Nothing (possibly promised).
	 */
	abstract set(data: T): number | PromiseLike<number>;

	/**
	 * Update all matching items with the same partial value.
	 *
	 * @param updates `Update` instance or set of updates to apply to every matching item.
	 * @return Nothing (possibly promised).
	 */
	abstract update(updates: Updates<T>): number | PromiseLike<number>;

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
	subscribe(onNext?: Dispatch<[ItemArray<T>]>, onError?: Handler): Stop {
		return runSequence(this, onNext, onError);
	}

	// Implement AsyncIterable
	[Symbol.asyncIterator](): AsyncIterator<ItemArray<T>> {
		return this.provider.getQuerySequence(this.collection, this)[Symbol.asyncIterator]() as AsyncIterator<ItemArray<T>>;
	}
}

/** Reference to a set of items in a provider. */
export class Query<T extends Data = Data> extends BaseQuery<T> {
	readonly provider: Provider;
	readonly collection: string;
	constructor(provider: Provider, collection: string, filters?: PossibleFilters<ItemData<T>>, sorts?: PossibleSorts<ItemData<T>>, limit?: number | null) {
		super(filters, sorts, limit);
		this.provider = provider;
		this.collection = collection;
	}
	get value(): ItemArray<T> {
		return this.provider.getQuery(this.collection, this) as ItemArray<T>;
	}
	get count(): number {
		return this.value.length;
	}
	get exists(): boolean {
		return !!this.max(1).value.length;
	}
	get firstValue(): ItemValue<T> {
		return getOptionalFirstItem(this.max(1).value);
	}
	get firstData(): ItemData<T> {
		return getFirstItem(this.max(1).value);
	}
	get lastValue(): ItemValue<T> {
		return getOptionalLastItem(this.value);
	}
	get lastData(): ItemData<T> {
		return getLastItem(this.value);
	}
	set(data: T): number {
		return this.provider.setQuery(this.collection, this, data);
	}
	update(updates: Updates<T>): number {
		return this.provider.updateQuery(this.collection, this, updates);
	}
	delete(): number {
		return this.provider.deleteQuery(this.collection, this);
	}
}

/** Reference to a set of items in a provider. */
export class AsyncQuery<T extends Data = Data> extends BaseQuery<T> {
	readonly provider: AsyncProvider;
	readonly collection: string;
	constructor(provider: AsyncProvider, collection: string, filters?: PossibleFilters<ItemData<T>>, sorts?: PossibleSorts<ItemData<T>>, limit?: number | null) {
		super(filters, sorts, limit);
		this.provider = provider;
		this.collection = collection;
	}
	get value(): Promise<ItemArray<T>> {
		return this.provider.getQuery(this.collection, this) as Promise<ItemArray<T>>;
	}
	get count(): Promise<number> {
		return this.value.then(countArray);
	}
	get exists(): Promise<boolean> {
		return this.max(1).value.then(isArrayLength);
	}
	get firstValue(): Promise<ItemValue<T>> {
		return this.max(1).value.then(getOptionalFirstItem);
	}
	get firstData(): Promise<ItemData<T>> {
		return this.max(1).value.then(getFirstItem);
	}
	get lastValue(): Promise<ItemValue<T>> {
		return this.value.then(getOptionalLastItem);
	}
	get lastData(): Promise<ItemData<T>> {
		return this.value.then(getLastItem);
	}
	set(data: T): Promise<number> {
		return this.provider.setQuery(this.collection, this, data);
	}
	update(updates: Updates<T>): PromiseLike<number> {
		return this.provider.updateQuery(this.collection, this, updates);
	}
	delete(): PromiseLike<number> {
		return this.provider.deleteQuery(this.collection, this);
	}
}
