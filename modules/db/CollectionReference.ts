import type { AddChange, DeleteItemChange, DeleteQueryChange, SetItemChange, SetQueryChange, UpdateItemChange, UpdateQueryChange } from "./Change.js";
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

	/** Get an add change for an item in a database collection. */
	getAdd(data: T): AddChange<T> {
		return { action: "add", collection: this.collection, data };
	}

	/** Get a set change for an item in a database collection. */
	getItemSet(id: string, data: T): SetItemChange<T> {
		return { action: "set", collection: this.collection, id, data };
	}

	/** Get an update change for an item in a database collection. */
	getItemUpdate(id: string, updates: Updates<T>): UpdateItemChange<T> {
		return { action: "update", collection: this.collection, id, updates };
	}

	/** Get a delete change for an item in a database collection. */
	getItemDelete(id: string): DeleteItemChange<T> {
		return { action: "delete", collection: this.collection, id };
	}

	/** Get a set change for multiple items in a database collection. */
	getQuerySet(query: ItemQuery<T>, data: T): SetQueryChange<T> {
		return { action: "set", collection: this.collection, query, data };
	}

	/** Get an update change for multiple items in a database collection. */
	getQueryUpdate(query: ItemQuery<T>, updates: Updates<T>): UpdateQueryChange<T> {
		return { action: "update", collection: this.collection, query, updates };
	}

	/** Get a delete change for multiple items in a database collection. */
	getQueryDelete(query: ItemQuery<T>): DeleteQueryChange<T> {
		return { action: "delete", collection: this.collection, query };
	}

	/** Add an item to a database collection. */
	abstract add(data: T): string | Promise<string>;

	/** Get an item from a database collection. */
	abstract getItem(id: string): ItemValue<T> | Promise<ItemValue<T>>;

	/** Set an item to a database collection. */
	abstract setItem(id: string, data: T): void | Promise<void>;

	/** Update an item to a database collection. */
	abstract updateItem(id: string, updates: Updates<T>): void | Promise<void>;

	/** Delete an item to a database collection. */
	abstract deleteItem(id: string): void | Promise<void>;

	/** Get multiple items from a database collection. */
	abstract getQuery(query: ItemQuery<T>): ItemArray<T> | Promise<ItemArray<T>>;

	/** Set multiple items in a database collection. */
	abstract setQuery(query: ItemQuery<T>, data: T): number | Promise<number>;

	/** Update multiple items in a database collection. */
	abstract updateQuery(query: ItemQuery<T>, updates: Updates<T>): number | Promise<number>;

	/** Delete multiple items in a database collection. */
	abstract deleteQuery(query: ItemQuery<T>): number | Promise<number>;

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
	add(data: T): string {
		return this.provider.addItem<T>(this.collection, data);
	}
	getItem(id: string): ItemValue<T> {
		return this.provider.getItem<T>(this.collection, id);
	}
	setItem(id: string, data: T): void {
		return this.provider.setItem<T>(this.collection, id, data);
	}
	updateItem(id: string, updates: Updates<T>): void {
		return this.provider.updateItem<T>(this.collection, id, updates);
	}
	deleteItem(id: string): void {
		return this.provider.deleteItem<T>(this.collection, id);
	}
	getQuery(query: ItemQuery<T>): ItemArray<T> {
		return this.provider.getQuery<T>(this.collection, query) as ItemArray<T>;
	}
	setQuery(query: ItemQuery<T>, data: T): number {
		return this.provider.setQuery<T>(this.collection, query, data);
	}
	updateQuery(query: ItemQuery<T>, updates: Updates<T>): number {
		return this.provider.updateQuery<T>(this.collection, query, updates);
	}
	deleteQuery(query: ItemQuery<T>): number {
		return this.provider.deleteQuery<T>(this.collection, query);
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
	add(data: T): Promise<string> {
		return this.provider.addItem<T>(this.collection, data);
	}
	getItem(id: string): Promise<ItemValue<T>> {
		return this.provider.getItem<T>(this.collection, id);
	}
	setItem(id: string, data: T): Promise<void> {
		return this.provider.setItem<T>(this.collection, id, data);
	}
	updateItem(id: string, updates: Updates<T>): Promise<void> {
		return this.provider.updateItem<T>(this.collection, id, updates);
	}
	deleteItem(id: string): Promise<void> {
		return this.provider.deleteItem<T>(this.collection, id);
	}
	getQuery(query: ItemQuery<T>): Promise<ItemArray<T>> {
		return this.provider.getQuery<T>(this.collection, query) as Promise<ItemArray<T>>;
	}
	setQuery(query: ItemQuery<T>, data: T): Promise<number> {
		return this.provider.setQuery<T>(this.collection, query, data);
	}
	updateQuery(query: ItemQuery<T>, updates: Updates<T>): Promise<number> {
		return this.provider.updateQuery<T>(this.collection, query, updates);
	}
	deleteQuery(query: ItemQuery<T>): Promise<number> {
		return this.provider.deleteQuery<T>(this.collection, query);
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
