import type { ItemArray, ItemData, ItemQuery, ItemValue } from "./ItemReference.js";
import type { AsyncProvider, Provider } from "../provider/Provider.js";
import type { Stop } from "../util/activity.js";
import type { Data } from "../util/data.js";
import type { Dispatch, Handler } from "../util/function.js";
import type { Updates } from "../util/update.js";
import { countArray, getOptionalFirstItem, getOptionalLastItem, isArrayLength } from "../util/array.js";
import { getRequired } from "../util/null.js";
import { cloneObjectWith } from "../util/object.js";
import { runSequence } from "../util/sequence.js";

/** Reference to a set of items in a sync or async provider. */
abstract class AbstractQueryReference<T extends Data = Data> implements AsyncIterable<ItemArray<T>> {
	abstract readonly provider: Provider | AsyncProvider;
	readonly collection: string;
	readonly query: ItemQuery<T>;
	constructor(collection: string, query: ItemQuery<T> = {}) {
		this.collection = collection;
		this.query = query;
	}

	/** Get a copy of this query reference with additional query props. */
	with(query: ItemQuery<T>): this {
		return cloneObjectWith(this, "query", { ...this.query, query });
	}

	/**
	 * Get array of entities for this query.
	 * @return Array of entities.
	 */
	abstract items: ItemArray<T> | PromiseLike<ItemArray<T>>;

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
	abstract first: ItemValue<T> | PromiseLike<ItemValue<T>>;

	/**
	 * Get the last item matched by this query or `null` if this query has no results.
	 * @throws RequiredError if there were no results for this query.
	 */
	abstract last: ItemValue<T> | PromiseLike<ItemValue<T>>;

	/**
	 * Get the first item matched by this query.
	 * @throws RequiredError if there were no results for this query.
	 */
	abstract data: ItemData<T> | PromiseLike<ItemData<T>>;

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

	// Implement toString()
	toString(): string {
		return `${this.collection}?{${JSON.stringify(this.query)}`;
	}

	/** Subscribe to this item. */
	subscribe(onNext?: Dispatch<ItemArray<T>>, onError?: Handler): Stop {
		return runSequence(this, onNext, onError);
	}

	// Implement AsyncIterable
	[Symbol.asyncIterator](): AsyncIterator<ItemArray<T>> {
		return this.provider.getQuerySequence(this.collection, this.query)[Symbol.asyncIterator]() as AsyncIterator<ItemArray<T>>;
	}
}

/** Reference to a set of items in a provider. */
export class QueryReference<T extends Data = Data> extends AbstractQueryReference<T> {
	readonly provider: Provider;
	constructor(provider: Provider, collection: string, query?: ItemQuery<T>) {
		super(collection, query);
		this.provider = provider;
	}
	get items(): ItemArray<T> {
		return _getItemArray(this);
	}
	get count(): number {
		return this.items.length;
	}
	get exists(): boolean {
		return !!_getSingleItemArray(this).length;
	}
	get first(): ItemValue<T> {
		return getOptionalFirstItem(_getSingleItemArray(this));
	}
	get last(): ItemValue<T> {
		return getOptionalLastItem(this.items);
	}
	get data(): ItemData<T> {
		return getRequired(this.first);
	}
	set(data: T): number {
		return this.provider.setQuery(this.collection, this.query, data);
	}
	update(updates: Updates<T>): number {
		return this.provider.updateQuery(this.collection, this.query, updates);
	}
	delete(): number {
		return this.provider.deleteQuery(this.collection, this.query);
	}
}

/** Reference to a set of items in a provider. */
export class AsyncQueryReference<T extends Data = Data> extends AbstractQueryReference<T> {
	readonly provider: AsyncProvider;
	constructor(provider: AsyncProvider, collection: string, query?: ItemQuery<T>) {
		super(collection, query);
		this.provider = provider;
	}
	get items(): Promise<ItemArray<T>> {
		return _getItemArray(this);
	}
	get count(): Promise<number> {
		return this.items.then(countArray);
	}
	get exists(): Promise<boolean> {
		return _getSingleItemArray(this).then(isArrayLength);
	}
	get first(): Promise<ItemValue<T>> {
		return _getSingleItemArray(this).then(getOptionalFirstItem);
	}
	get last(): Promise<ItemValue<T>> {
		return this.items.then(getOptionalLastItem);
	}
	get data(): Promise<ItemData<T>> {
		return this.first.then(getRequired);
	}
	set(data: T): Promise<number> {
		return this.provider.setQuery(this.collection, this.query, data);
	}
	update(updates: Updates<T>): PromiseLike<number> {
		return this.provider.updateQuery(this.collection, this.query, updates);
	}
	delete(): PromiseLike<number> {
		return this.provider.deleteQuery(this.collection, this.query);
	}
}

function _getItemArray<T extends Data>({ provider, collection, query }: QueryReference<T>): ItemArray<T>;
function _getItemArray<T extends Data>({ provider, collection, query }: AsyncQueryReference<T>): Promise<ItemArray<T>>;
function _getItemArray({ provider, collection, query }: QueryReference | AsyncQueryReference): ItemArray | Promise<ItemArray> {
	return provider.getQuery(collection, query);
}

function _getSingleItemArray<T extends Data>({ provider, collection, query }: QueryReference<T>): ItemArray<T>;
function _getSingleItemArray<T extends Data>({ provider, collection, query }: AsyncQueryReference<T>): Promise<ItemArray<T>>;
function _getSingleItemArray({ provider, collection, query }: QueryReference | AsyncQueryReference): ItemArray | Promise<ItemArray> {
	return provider.getQuery(collection, { ...query, $limit: 1 });
}
