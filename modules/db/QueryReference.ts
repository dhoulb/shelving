import type { DeleteQueryChange, SetQueryChange, UpdateQueryChange } from "../change/Change.js";
import type { AbstractProvider, AsyncProvider, Provider } from "../provider/Provider.js";
import type { ErrorCallback, StopCallback, ValueCallback } from "../util/callback.js";
import type { Data } from "../util/data.js";
import type { ItemArray, ItemData, ItemQuery, ItemValue } from "../util/item.js";
import type { Updates } from "../util/update.js";
import { countArray, getFirstItem, getOptionalFirstItem, getOptionalLastItem, isArrayLength } from "../util/array.js";
import { cloneObjectWith } from "../util/object.js";
import { runSequence } from "../util/sequence.js";

/** Reference to a set of items in a sync or async provider. */
export abstract class AbstractQueryReference<T extends Data = Data> implements AsyncIterable<ItemArray<T>> {
	abstract readonly provider: AbstractProvider;
	readonly collection: string;
	readonly query: ItemQuery<T>;
	constructor(collection: string, query: ItemQuery<T> = {}) {
		this.collection = collection;
		this.query = query;
	}

	/** Get a copy of this query reference with additional query props. */
	with(query: ItemQuery<T>): this {
		return cloneObjectWith(this, "query", { ...this.query, ...query });
	}

	/**
	 * Get array of entities for this query.
	 * @return Array of entities.
	 */
	abstract items: ItemArray<T> | PromiseLike<ItemArray<T>>;

	/**
	 * Does at least one item exist for this query?
	 * @return `true` if a item exists or `false` otherwise (possibly promised).
	 */
	abstract exists: boolean | PromiseLike<boolean>;

	/**
	 * Count the number of results of this set of items.
	 * @return Number of items matching the query (possibly promised).
	 */
	abstract count: number | PromiseLike<number>;

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
	subscribe(onNext?: ValueCallback<ItemArray<T>>, onError?: ErrorCallback): StopCallback {
		return runSequence(this, onNext, onError);
	}

	/** Get a set change for this query. */
	getSet(data: T): SetQueryChange<T> {
		return { action: "set", collection: this.collection, query: this.query, data };
	}

	/** Get an update change for this query. */
	getUpdate(updates: Updates<T>): UpdateQueryChange<T> {
		return { action: "update", collection: this.collection, query: this.query, updates };
	}

	/** Get a delete change for this query. */
	getDelete(): DeleteQueryChange<T> {
		return { action: "delete", collection: this.collection, query: this.query };
	}

	// Implement AsyncIterable
	[Symbol.asyncIterator](): AsyncIterator<ItemArray<T>> {
		return this.provider.getQuerySequence<T>(this.collection, this.query)[Symbol.asyncIterator]();
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
		return this.provider.getQuery<T>(this.collection, this.query);
	}
	get exists(): boolean {
		return !!this.provider.getQuery<T>(this.collection, { ...this.query, $limit: 1 }).length;
	}
	get count(): number {
		return this.items.length;
	}
	get first(): ItemValue<T> {
		return getOptionalFirstItem(this.provider.getQuery<T>(this.collection, { ...this.query, $limit: 1 }));
	}
	get last(): ItemValue<T> {
		return getOptionalLastItem(this.items);
	}
	get data(): ItemData<T> {
		return getFirstItem(this.provider.getQuery<T>(this.collection, { ...this.query, $limit: 1 }));
	}
	set(data: T): number {
		return this.provider.setQuery<T>(this.collection, this.query, data);
	}
	update(updates: Updates<T>): number {
		return this.provider.updateQuery<T>(this.collection, this.query, updates);
	}
	delete(): number {
		return this.provider.deleteQuery<T>(this.collection, this.query);
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
		return this.provider.getQuery<T>(this.collection, this.query);
	}
	get exists(): Promise<boolean> {
		return this.provider.getQuery<T>(this.collection, { ...this.query, $limit: 1 }).then(isArrayLength);
	}
	get count(): Promise<number> {
		return this.items.then(countArray);
	}
	get first(): Promise<ItemValue<T>> {
		return this.provider.getQuery<T>(this.collection, { ...this.query, $limit: 1 }).then(getOptionalFirstItem);
	}
	get last(): Promise<ItemValue<T>> {
		return this.items.then(getOptionalLastItem);
	}
	get data(): Promise<ItemData<T>> {
		return this.provider.getQuery<T>(this.collection, { ...this.query, $limit: 1 }).then(getFirstItem);
	}
	set(data: T): Promise<number> {
		return this.provider.setQuery<T>(this.collection, this.query, data);
	}
	update(updates: Updates<T>): PromiseLike<number> {
		return this.provider.updateQuery<T>(this.collection, this.query, updates);
	}
	delete(): PromiseLike<number> {
		return this.provider.deleteQuery<T>(this.collection, this.query);
	}
}
