import type { DataKey, Datas } from "../util/data.js";
import type { Nullish } from "../util/null.js";
import type { DeepIterable } from "../util/iterate.js";
import type { AsyncProvider, Provider } from "../provider/Provider.js";
import type { FilterList } from "../constraint/FilterConstraint.js";
import type { SortList } from "../constraint/SortConstraint.js";
import type { ItemData, ItemValue } from "../db/Item.js";
import type { Updates } from "../update/DataUpdate.js";
import { Item, AsyncItem } from "./Item.js";
import { Query, AsyncQuery } from "./Query.js";
import { Collection, AsyncCollection } from "./Collection.js";
import { AddChange, changeAsyncProvider, changeProvider, DeleteChange, ItemChanges, SetChange, UpdateChange, WriteChange } from "./Change.js";

/** Database with a synchronous or asynchronous provider. */
abstract class BaseDatabase<T extends Datas> {
	abstract readonly provider: Provider | AsyncProvider;

	/** Create a query on a collection in this database. */
	abstract collection<K extends DataKey<T>>(collection: K): Collection<T[K]> | AsyncCollection<T[K]>;

	/** Create a query on a collection in this database. */
	abstract query<K extends DataKey<T>>(collection: K, filters?: FilterList<Partial<ItemData<T[K]>>>, sorts?: SortList<Partial<ItemData<T[K]>>>, limit?: number | null): Query<T[K]> | AsyncQuery<T[K]>;

	/** Reference an item in a collection in this database. */
	abstract item<K extends DataKey<T>>(collection: K, id: string): Item<T[K]> | AsyncItem<T[K]>;

	/** Run a set of changes in this database. */
	abstract change(...changes: DeepIterable<Nullish<WriteChange>>[]): ItemChanges | Promise<ItemChanges>;

	/** Get a document from a collection in this database. */
	abstract get<K extends DataKey<T>>(collection: K, id: string): ItemValue<T[K]> | Promise<ItemValue<T[K]>>;

	/** Add a document to a collection in this database. */
	abstract add<K extends DataKey<T>>(collection: K, data: T[K]): string | Promise<string>;

	/** Set a document in a collection in this database. */
	abstract set<K extends DataKey<T>>(collection: K, id: string, data: T[K]): void | Promise<void>;

	/** Update a document in a collection in this database. */
	abstract update<K extends DataKey<T>>(collection: K, id: string, updates: Updates<T[K]>): void | Promise<void>;

	/** Delete a document from a collection in this database. */
	abstract delete<K extends DataKey<T>>(collection: K, id: string): void | Promise<void>;

	/** Get an add change for a collection in this database. */
	getAdd<K extends DataKey<T>>(collection: K, data: T[K]): AddChange {
		return { action: "ADD", collection, data };
	}

	/** Get a set change for a collection in this database. */
	getSet<K extends DataKey<T>>(collection: K, id: string, data: T[K]): SetChange {
		return { action: "SET", collection, id, data };
	}

	/** Get an update change for a collection in this database. */
	getUpdate<K extends DataKey<T>>(collection: K, id: string, updates: Updates<T[K]>): UpdateChange {
		return { action: "UPDATE", collection, id, updates };
	}

	/** Get a delete change for a collection in this database. */
	getDelete<K extends DataKey<T>>(collection: K, id: string): DeleteChange {
		return { action: "DELETE", collection, id };
	}
}

/** Database with a synchronous provider. */
export class Database<T extends Datas = Datas> extends BaseDatabase<T> {
	readonly provider: Provider;
	constructor(provider: Provider) {
		super();
		this.provider = provider;
	}
	collection<K extends DataKey<T>>(collection: K): Collection<T[K]> {
		return new Collection<T[K]>(this.provider, collection);
	}
	query<K extends DataKey<T>>(collection: K, filters?: FilterList<ItemData<T[K]>>, sorts?: SortList<ItemData<T[K]>>, limit?: number | null): Query<T[K]> {
		return new Query<T[K]>(this.provider, collection, filters, sorts, limit);
	}
	item<K extends DataKey<T>>(collection: K, id: string): Item<T[K]> {
		return new Item<T[K]>(this.provider, collection, id);
	}
	change(...changes: DeepIterable<Nullish<WriteChange>>[]): ItemChanges {
		return changeProvider(this.provider, changes);
	}
	get<K extends DataKey<T>>(collection: K, id: string): ItemValue<T[K]> {
		return this.provider.getItem(collection, id) as ItemValue<T[K]>;
	}
	add<K extends DataKey<T>>(collection: K, data: T[K]): string {
		return this.provider.addItem(collection, data);
	}
	set<K extends DataKey<T>>(collection: K, id: string, data: T[K]): void {
		return this.provider.setItem(collection, id, data);
	}
	update<K extends DataKey<T>>(collection: K, id: string, updates: Updates<T[K]>): void {
		return this.provider.updateItem(collection, id, updates);
	}
	delete<K extends DataKey<T>>(collection: K, id: string): void {
		return this.provider.deleteItem(collection, id);
	}
}

/** Database with a synchronous provider. */
export class AsyncDatabase<T extends Datas = Datas> extends BaseDatabase<T> {
	readonly provider: AsyncProvider;
	constructor(provider: AsyncProvider) {
		super();
		this.provider = provider;
	}
	collection<K extends DataKey<T>>(collection: K): AsyncCollection<T[K]> {
		return new AsyncCollection<T[K]>(this.provider, collection);
	}
	query<K extends DataKey<T>>(collection: K, filters?: FilterList<ItemData<T[K]>>, sorts?: SortList<ItemData<T[K]>>, limit?: number | null): AsyncQuery<T[K]> {
		return new AsyncQuery<T[K]>(this.provider, collection, filters, sorts, limit);
	}
	item<K extends DataKey<T>>(collection: K, id: string): AsyncItem<T[K]> {
		return new AsyncItem<T[K]>(this.provider, collection, id);
	}
	change(...changes: DeepIterable<Nullish<WriteChange>>[]): Promise<ItemChanges> {
		return changeAsyncProvider(this.provider, changes);
	}
	get<K extends DataKey<T>>(collection: K, id: string): Promise<ItemValue<T[K]>> {
		return this.provider.getItem(collection, id) as Promise<ItemValue<T[K]>>;
	}
	add<K extends DataKey<T>>(collection: K, data: T[K]): Promise<string> {
		return this.provider.addItem(collection, data);
	}
	set<K extends DataKey<T>>(collection: K, id: string, data: T[K]): Promise<void> {
		return this.provider.setItem(collection, id, data);
	}
	update<K extends DataKey<T>>(collection: K, id: string, updates: Updates<T[K]>): Promise<void> {
		return this.provider.updateItem(collection, id, updates);
	}
	delete<K extends DataKey<T>>(collection: K, id: string): Promise<void> {
		return this.provider.deleteItem(collection, id);
	}
}
