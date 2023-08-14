import type { AddItemChange, DeleteItemChange, DeleteQueryChange, SetItemChange, SetQueryChange, UpdateItemChange, UpdateQueryChange, WriteChange } from "../change/Change.js";
import type { AbstractProvider, AsyncProvider, Provider } from "../provider/Provider.js";
import type { ImmutableArray } from "../util/array.js";
import type { DataKey, DataValue, Datas } from "../util/data.js";
import type { ItemArray, ItemQuery, ItemValue } from "../util/item.js";
import type { Optional } from "../util/optional.js";
import type { Updates } from "../util/update.js";
import { writeAsyncProviderChange, writeAsyncProviderChanges, writeProviderChange, writeProviderChanges } from "../change/Change.js";
import { AsyncCollectionReference, CollectionReference } from "./CollectionReference.js";
import { AsyncItemReference, ItemReference } from "./ItemReference.js";
import { AsyncQueryReference, QueryReference } from "./QueryReference.js";

/** Database with a synchronous or asynchronous provider. */
export abstract class AbstractDatabase<T extends Datas> {
	abstract readonly provider: AbstractProvider;

	/** Create a query on a collection in this database. */
	abstract collection<K extends DataKey<T>>(collection: K): CollectionReference<T[K]> | AsyncCollectionReference<T[K]>;

	/** Create a query on a collection in this database. */
	abstract query<K extends DataKey<T>>(collection: K, query?: ItemQuery<T[K]>): QueryReference<T[K]> | AsyncQueryReference<T[K]>;

	/** Reference an item in a collection in this database. */
	abstract item<K extends DataKey<T>>(collection: K, id: string): ItemReference<T[K]> | AsyncItemReference<T[K]>;

	/** Get an add change for an item in a database collection. */
	getItemAdd<K extends DataKey<T>>(collection: K, data: T[K]): AddItemChange<T[K]> {
		return { action: "add", collection, data };
	}

	/** Get a set change for an item in a database collection. */
	getItemSet<K extends DataKey<T>>(collection: K, id: string, data: T[K]): SetItemChange<T[K]> {
		return { action: "set", collection, id, data };
	}

	/** Get an update change for an item in a database collection. */
	getItemUpdate<K extends DataKey<T>>(collection: K, id: string, updates: Updates<T[K]>): UpdateItemChange<T[K]> {
		return { action: "update", collection, id, updates };
	}

	/** Get a delete change for an item in a database collection. */
	getItemDelete<K extends DataKey<T>>(collection: K, id: string): DeleteItemChange<T[K]> {
		return { action: "delete", collection, id };
	}

	/** Get a set change for multiple items in a database collection. */
	getQuerySet<K extends DataKey<T>>(collection: K, query: ItemQuery<T[K]>, data: T[K]): SetQueryChange<T[K]> {
		return { action: "set", collection, query, data };
	}

	/** Get an update change for multiple items in a database collection. */
	getQueryUpdate<K extends DataKey<T>>(collection: K, query: ItemQuery<T[K]>, updates: Updates<T[K]>): UpdateQueryChange<T[K]> {
		return { action: "update", collection, query, updates };
	}

	/** Get a delete change for multiple items in a database collection. */
	getQueryDelete<K extends DataKey<T>>(collection: K, query: ItemQuery<T[K]>): DeleteQueryChange<T> {
		return { action: "delete", collection, query };
	}

	/** Add an item to a database collection. */
	abstract addItem<K extends DataKey<T>>(collection: K, data: T[K]): string | Promise<string>;

	/** Get an item from a database collection. */
	abstract getItem<K extends DataKey<T>>(collection: K, id: string): ItemValue<T[K]> | Promise<ItemValue<T[K]>>;

	/** Set an item to a database collection. */
	abstract setItem<K extends DataKey<T>>(collection: K, id: string, data: T[K]): void | Promise<void>;

	/** Update an item to a database collection. */
	abstract updateItem<K extends DataKey<T>>(collection: K, id: string, updates: Updates<T[K]>): void | Promise<void>;

	/** Delete an item to a database collection. */
	abstract deleteItem<K extends DataKey<T>>(collection: K, id: string): void | Promise<void>;

	/** Get multiple items from a database collection. */
	abstract getQuery<K extends DataKey<T>>(collection: K, query: ItemQuery<T[K]>): ItemArray<T[K]> | Promise<ItemArray<T[K]>>;

	/** Set multiple items in a database collection. */
	abstract setQuery<K extends DataKey<T>>(collection: K, query: ItemQuery<T[K]>, data: T[K]): number | Promise<number>;

	/** Update multiple items in a database collection. */
	abstract updateQuery<K extends DataKey<T>>(collection: K, query: ItemQuery<T[K]>, updates: Updates<T[K]>): number | Promise<number>;

	/** Delete multiple items in a database collection. */
	abstract deleteQuery<K extends DataKey<T>>(collection: K, query: ItemQuery<T[K]>): number | Promise<number>;

	/** Write a single change to this database. */
	abstract writeChange<K extends DataKey<T>>(change: WriteChange<T[K]>): WriteChange<T[K]> | PromiseLike<WriteChange<T[K]>>;

	/** Write a set of changes to this database. */
	abstract writeChanges(...changes: Optional<WriteChange<DataValue<T>>>[]): ImmutableArray<WriteChange<DataValue<T>>> | PromiseLike<ImmutableArray<WriteChange<DataValue<T>>>>;
}

/** Database with a synchronous provider. */
export class Database<T extends Datas = Datas> extends AbstractDatabase<T> {
	readonly provider: Provider;
	constructor(provider: Provider) {
		super();
		this.provider = provider;
	}
	collection<K extends DataKey<T>>(collection: K): CollectionReference<T[K]> {
		return new CollectionReference<T[K]>(this.provider, collection);
	}
	query<K extends DataKey<T>>(collection: K, query?: ItemQuery<T[K]>): QueryReference<T[K]> {
		return new QueryReference<T[K]>(this.provider, collection, query);
	}
	item<K extends DataKey<T>>(collection: K, id: string): ItemReference<T[K]> {
		return new ItemReference<T[K]>(this.provider, collection, id);
	}
	addItem<K extends DataKey<T>>(collection: K, data: T[K]): string {
		return this.provider.addItem<T[K]>(collection, data);
	}
	getItem<K extends DataKey<T>>(collection: K, id: string): ItemValue<T[K]> {
		return this.provider.getItem<T[K]>(collection, id);
	}
	setItem<K extends DataKey<T>>(collection: K, id: string, data: T[K]): void {
		return this.provider.setItem<T[K]>(collection, id, data);
	}
	updateItem<K extends DataKey<T>>(collection: K, id: string, updates: Updates<T[K]>): void {
		return this.provider.updateItem<T[K]>(collection, id, updates);
	}
	deleteItem<K extends DataKey<T>>(collection: K, id: string): void {
		return this.provider.deleteItem<T[K]>(collection, id);
	}
	getQuery<K extends DataKey<T>>(collection: K, query: ItemQuery<T[K]>): ItemArray<T[K]> {
		return this.provider.getQuery<T[K]>(collection, query);
	}
	setQuery<K extends DataKey<T>>(collection: K, query: ItemQuery<T[K]>, data: T[K]): number {
		return this.provider.setQuery<T[K]>(collection, query, data);
	}
	updateQuery<K extends DataKey<T>>(collection: K, query: ItemQuery<T[K]>, updates: Updates<T[K]>): number {
		return this.provider.updateQuery<T[K]>(collection, query, updates);
	}
	deleteQuery<K extends DataKey<T>>(collection: K, query: ItemQuery<T[K]>): number {
		return this.provider.deleteQuery<T[K]>(collection, query);
	}
	writeChange<K extends DataKey<T>>(change: WriteChange<T[K]>): WriteChange<T[K]> {
		return writeProviderChange(this.provider, change);
	}
	writeChanges(...changes: Optional<WriteChange<DataValue<T>>>[]): ImmutableArray<WriteChange<DataValue<T>>> {
		return writeProviderChanges(this.provider, ...changes);
	}
}

/** Database with a synchronous provider. */
export class AsyncDatabase<T extends Datas = Datas> extends AbstractDatabase<T> {
	readonly provider: AsyncProvider;
	constructor(provider: AsyncProvider) {
		super();
		this.provider = provider;
	}
	collection<K extends DataKey<T>>(collection: K): AsyncCollectionReference<T[K]> {
		return new AsyncCollectionReference<T[K]>(this.provider, collection);
	}
	query<K extends DataKey<T>>(collection: K, query?: ItemQuery<T[K]>): AsyncQueryReference<T[K]> {
		return new AsyncQueryReference<T[K]>(this.provider, collection, query);
	}
	item<K extends DataKey<T>>(collection: K, id: string): AsyncItemReference<T[K]> {
		return new AsyncItemReference<T[K]>(this.provider, collection, id);
	}
	addItem<K extends DataKey<T>>(collection: K, data: T[K]): Promise<string> {
		return this.provider.addItem<T[K]>(collection, data);
	}
	getItem<K extends DataKey<T>>(collection: K, id: string): Promise<ItemValue<T[K]>> {
		return this.provider.getItem<T[K]>(collection, id);
	}
	setItem<K extends DataKey<T>>(collection: K, id: string, data: T[K]): Promise<void> {
		return this.provider.setItem<T[K]>(collection, id, data);
	}
	updateItem<K extends DataKey<T>>(collection: K, id: string, updates: Updates<T[K]>): Promise<void> {
		return this.provider.updateItem<T[K]>(collection, id, updates);
	}
	deleteItem<K extends DataKey<T>>(collection: K, id: string): Promise<void> {
		return this.provider.deleteItem<T[K]>(collection, id);
	}
	getQuery<K extends DataKey<T>>(collection: K, query: ItemQuery<T[K]>): Promise<ItemArray<T[K]>> {
		return this.provider.getQuery<T[K]>(collection, query);
	}
	setQuery<K extends DataKey<T>>(collection: K, query: ItemQuery<T[K]>, data: T[K]): Promise<number> {
		return this.provider.setQuery<T[K]>(collection, query, data);
	}
	updateQuery<K extends DataKey<T>>(collection: K, query: ItemQuery<T[K]>, updates: Updates<T[K]>): Promise<number> {
		return this.provider.updateQuery<T[K]>(collection, query, updates);
	}
	deleteQuery<K extends DataKey<T>>(collection: K, query: ItemQuery<T[K]>): Promise<number> {
		return this.provider.deleteQuery<T[K]>(collection, query);
	}
	writeChange<K extends DataKey<T>>(change: WriteChange<T[K]>): PromiseLike<WriteChange<T[K]>> {
		return writeAsyncProviderChange(this.provider, change);
	}
	writeChanges(...changes: Optional<WriteChange<DataValue<T>>>[]): PromiseLike<ImmutableArray<WriteChange<DataValue<T>>>> {
		return writeAsyncProviderChanges(this.provider, ...changes);
	}
}
