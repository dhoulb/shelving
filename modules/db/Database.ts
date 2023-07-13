import type { AddChange, DeleteChange, ItemChanges, SetChange, UpdateChange, WriteChange } from "./Change.js";
import type { ItemQuery, ItemValue } from "./ItemReference.js";
import type { AsyncProvider, Provider } from "../provider/Provider.js";
import type { Data, DataKey, Datas } from "../util/data.js";
import type { Optional } from "../util/optional.js";
import type { Updates } from "../util/update.js";
import { changeAsyncProvider, changeProvider } from "./Change.js";
import { AsyncCollectionReference, CollectionReference } from "./CollectionReference.js";
import { AsyncItemReference, ItemReference } from "./ItemReference.js";
import { AsyncQueryReference, QueryReference } from "./QueryReference.js";

/** Database with a synchronous or asynchronous provider. */
abstract class AbstractDatabase<T extends Datas> {
	abstract readonly provider: Provider | AsyncProvider;

	/** Create a query on a collection in this database. */
	abstract collection<K extends DataKey<T>>(collection: K): CollectionReference<T[K]> | AsyncCollectionReference<T[K]>;

	/** Create a query on a collection in this database. */
	abstract query<K extends DataKey<T>>(collection: K, query?: ItemQuery<T[K]>): QueryReference<T[K]> | AsyncQueryReference<T[K]>;

	/** Reference an item in a collection in this database. */
	abstract item<K extends DataKey<T>>(collection: K, id: string): ItemReference<T[K]> | AsyncItemReference<T[K]>;

	/** Run a set of changes in this database. */
	abstract change(...changes: Optional<WriteChange<Data>>[]): ItemChanges | Promise<ItemChanges>;

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
	getAdd<K extends DataKey<T>>(collection: K, data: T[K]): AddChange<T[K]> {
		return { action: "add", collection, data };
	}

	/** Get a set change for a collection in this database. */
	getSet<K extends DataKey<T>>(collection: K, id: string, data: T[K]): SetChange<T[K]> {
		return { action: "set", collection, id, data };
	}

	/** Get an update change for a collection in this database. */
	getUpdate<K extends DataKey<T>>(collection: K, id: string, updates: Updates<T[K]>): UpdateChange<T[K]> {
		return { action: "update", collection, id, updates };
	}

	/** Get a delete change for a collection in this database. */
	getDelete<K extends DataKey<T>>(collection: K, id: string): DeleteChange {
		return { action: "delete", collection, id };
	}
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
	change(...changes: Optional<WriteChange<Data>>[]): ItemChanges {
		return changeProvider(this.provider, ...changes);
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
	change(...changes: Optional<WriteChange<Data>>[]): Promise<ItemChanges> {
		return changeAsyncProvider(this.provider, ...changes);
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
