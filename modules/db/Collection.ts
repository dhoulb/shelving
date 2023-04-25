import type { AddChange, DeleteChange, SetChange, UpdateChange } from "./Change.js";
import type { ItemData, ItemValue } from "./Item.js";
import type { PossibleFilters } from "../constraint/Filters.js";
import type { PossibleSorts } from "../constraint/Sorts.js";
import type { AsyncProvider, Provider } from "../provider/Provider.js";
import type { Updates } from "../update/DataUpdate.js";
import type { Data } from "../util/data.js";
import { AsyncItem, Item } from "./Item.js";
import { AsyncQuery, Query } from "./Query.js";

/** Reference to a collection in a synchronous or asynchronous provider. */
abstract class BaseCollection<T extends Data = Data> {
	abstract readonly provider: Provider | AsyncProvider;
	abstract readonly collection: string;

	/** Create a query on this item's collection. */
	abstract query(filters?: PossibleFilters<ItemData<T>>, sorts?: PossibleSorts<ItemData<T>>, limit?: number | null): Query<T> | AsyncQuery<T>;

	/** Create a query on this item's collection. */
	abstract item(id: string): Item<T> | AsyncItem<T>;

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
		return { action: "ADD", collection: this.collection, data };
	}

	/** Get a set change for this collection. */
	getSet(id: string, data: T): SetChange<T> {
		return { action: "SET", collection: this.collection, id, data };
	}

	/** Get an update change for this collection. */
	getUpdate(id: string, updates: Updates<T>): UpdateChange<T> {
		return { action: "UPDATE", collection: this.collection, id, updates };
	}

	/** Get a delete change for this collection. */
	getDelete(id: string): DeleteChange {
		return { action: "DELETE", collection: this.collection, id };
	}

	// Implement toString()
	toString(): string {
		return this.collection;
	}
}

/** Reference to a collection in a synchronous provider. */
export class Collection<T extends Data = Data> extends BaseCollection<T> {
	readonly provider: Provider;
	readonly collection: string;
	constructor(provider: Provider, collection: string) {
		super();
		this.provider = provider;
		this.collection = collection;
	}
	query(filters?: PossibleFilters<ItemData<T>>, sorts?: PossibleSorts<ItemData<T>>, limit?: number | null): Query<T> {
		return new Query<T>(this.provider, this.collection, filters, sorts, limit);
	}
	item(id: string): Item<T> {
		return new Item<T>(this.provider, this.collection, id);
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
export class AsyncCollection<T extends Data = Data> extends BaseCollection<T> {
	readonly provider: AsyncProvider;
	readonly collection: string;
	constructor(provider: AsyncProvider, collection: string) {
		super();
		this.provider = provider;
		this.collection = collection;
	}
	query(filters?: PossibleFilters<ItemData<T>>, sorts?: PossibleSorts<ItemData<T>>, limit?: number | null): AsyncQuery<T> {
		return new AsyncQuery<T>(this.provider, this.collection, filters, sorts, limit);
	}
	item(id: string): AsyncItem<T> {
		return new AsyncItem<T>(this.provider, this.collection, id);
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
