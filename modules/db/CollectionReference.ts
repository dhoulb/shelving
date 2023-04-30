import type { AddChange, DeleteChange, SetChange, UpdateChange } from "./Change.js";
import type { ItemArray, ItemData, ItemQuery, ItemValue } from "./ItemReference.js";
import type { AsyncProvider, Provider } from "../provider/Provider.js";
import type { Data } from "../util/data.js";
import type { Updates } from "../util/update.js";
import { countArray, getFirstItem, getOptionalFirstItem, getOptionalLastItem, isArrayLength } from "../util/array.js";
import { AsyncItemReference, ItemReference } from "./ItemReference.js";
import { AsyncQueryReference, QueryReference } from "./QueryReference.js";

/** Reference to a collection in a synchronous or asynchronous provider. */
abstract class AbstractCollectionReference<T extends Data = Data> {
	abstract readonly provider: Provider | AsyncProvider;
	readonly collection: string;
	constructor(collection: string) {
		this.collection = collection;
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

	/** Create a query on this item's collection. */
	abstract query(query?: ItemQuery<T>): QueryReference<T> | AsyncQueryReference<T>;

	/** Create a query on this item's collection. */
	abstract item(id: string): ItemReference<T> | AsyncItemReference<T>;

	/** Get an item from this collection. */
	abstract get(id: string): ItemValue<T> | Promise<ItemValue<T>>;

	/** Add an item to this collection. */
	abstract add(data: T): string | Promise<string>;

	/** Set a document in this collection. */
	abstract set(id: string, data: T): void | Promise<void>;

	/** Update a document in this collection. */
	abstract update(id: string, updates: Updates<T>): void | Promise<void>;

	/** Delete a document in this collection. */
	abstract delete(id: string): void | Promise<void>;

	/** Get an add change for this collection. */
	getAdd(data: T): AddChange<T> {
		return { action: "add", collection: this.collection, data };
	}

	/** Get a set change for this collection. */
	getSet(id: string, data: T): SetChange<T> {
		return { action: "set", collection: this.collection, id, data };
	}

	/** Get an update change for this collection. */
	getUpdate(id: string, updates: Updates<T>): UpdateChange<T> {
		return { action: "update", collection: this.collection, id, updates };
	}

	/** Get a delete change for this collection. */
	getDelete(id: string): DeleteChange {
		return { action: "delete", collection: this.collection, id };
	}

	// Implement toString()
	toString(): string {
		return this.collection;
	}
}

/** Reference to a collection in a synchronous provider. */
export class CollectionReference<T extends Data = Data> extends AbstractCollectionReference<T> {
	readonly provider: Provider;
	constructor(provider: Provider, collection: string) {
		super(collection);
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
		return getFirstItem(_getSingleItemArray(this));
	}
	query(constraints?: ItemQuery<T>): QueryReference<T> {
		return new QueryReference<T>(this.provider, this.collection, constraints);
	}
	item(id: string): ItemReference<T> {
		return new ItemReference<T>(this.provider, this.collection, id);
	}
	get(id: string): ItemValue<T> {
		return this.provider.getItem(this.collection, id) as ItemValue<T>;
	}
	add(data: T): string {
		return this.provider.addItem(this.collection, data);
	}
	set(id: string, data: T): void {
		return this.provider.setItem(this.collection, id, data);
	}
	update(id: string, updates: Updates<T>): void {
		return this.provider.updateItem(this.collection, id, updates);
	}
	delete(id: string): void {
		return this.provider.deleteItem(this.collection, id);
	}
}

/** Reference to a collection in an asynchronous provider. */
export class AsyncCollectionReference<T extends Data = Data> extends AbstractCollectionReference<T> {
	readonly provider: AsyncProvider;
	constructor(provider: AsyncProvider, collection: string) {
		super(collection);
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
		return _getSingleItemArray(this).then(getFirstItem);
	}
	query(query?: ItemQuery<T>): AsyncQueryReference<T> {
		return new AsyncQueryReference<T>(this.provider, this.collection, query);
	}
	item(id: string): AsyncItemReference<T> {
		return new AsyncItemReference<T>(this.provider, this.collection, id);
	}
	get(id: string): Promise<ItemValue<T>> {
		return this.provider.getItem(this.collection, id) as Promise<ItemValue<T>>;
	}
	add(data: T): Promise<string> {
		return this.provider.addItem(this.collection, data);
	}
	set(id: string, data: T): Promise<void> {
		return this.provider.setItem(this.collection, id, data);
	}
	update(id: string, updates: Updates<T>): Promise<void> {
		return this.provider.updateItem(this.collection, id, updates);
	}
	delete(id: string): Promise<void> {
		return this.provider.deleteItem(this.collection, id);
	}
}

function _getItemArray<T extends Data>({ provider, collection }: CollectionReference<T>): ItemArray<T>;
function _getItemArray<T extends Data>({ provider, collection }: AsyncCollectionReference<T>): Promise<ItemArray<T>>;
function _getItemArray({ provider, collection }: CollectionReference | AsyncCollectionReference): ItemArray | Promise<ItemArray> {
	return provider.getQuery(collection, {});
}

function _getSingleItemArray<T extends Data>({ provider, collection }: CollectionReference<T>): ItemArray<T>;
function _getSingleItemArray<T extends Data>({ provider, collection }: AsyncCollectionReference<T>): Promise<ItemArray<T>>;
function _getSingleItemArray({ provider, collection }: CollectionReference | AsyncCollectionReference): ItemArray | Promise<ItemArray> {
	return provider.getQuery(collection, { $limit: 1 });
}
