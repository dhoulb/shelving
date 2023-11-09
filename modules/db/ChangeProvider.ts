import type { DatabaseChange, ItemAddChange, ItemDeleteChange, ItemSetChange, ItemUpdateChange, QueryDeleteChange, QuerySetChange, QueryUpdateChange } from "../change/Change.js";
import type { DataKey, Database } from "../util/data.js";
import type { ItemQuery } from "../util/item.js";
import type { Updates } from "../util/update.js";
import { getItemAdd, getItemDelete, getItemSet, getItemUpdate, getQueryDelete, getQuerySet, getQueryUpdate, writeAsyncChange, writeChange } from "../change/Change.js";
import { AsyncThroughProvider, ThroughProvider } from "./ThroughProvider.js";

/** Synchronous provider that offers additional helper methods for working with `Change` items. */
export class ChangeProvider<T extends Database> extends ThroughProvider<T> {
	getItemAdd<K extends DataKey<T>>(collection: K, data: T[K]): ItemAddChange<T, K> {
		return getItemAdd(this, collection, data);
	}
	getItemSet<K extends DataKey<T>>(collection: K, id: string, data: T[K]): ItemSetChange<T, K> {
		return getItemSet(this, collection, id, data);
	}
	getItemUpdate<K extends DataKey<T>>(collection: K, id: string, updates: Updates<T[K]>): ItemUpdateChange<T, K> {
		return getItemUpdate(this, collection, id, updates);
	}
	getItemDelete<K extends DataKey<T>>(collection: K, id: string): ItemDeleteChange<T, K> {
		return getItemDelete(this, collection, id);
	}
	getQuerySet<K extends DataKey<T>>(collection: K, query: ItemQuery<T[K]>, data: T[K]): QuerySetChange<T, K> {
		return getQuerySet(this, collection, query, data);
	}
	getQueryUpdate<K extends DataKey<T>>(collection: K, query: ItemQuery<T[K]>, updates: Updates<T[K]>): QueryUpdateChange<T, K> {
		return getQueryUpdate(this, collection, query, updates);
	}
	getQueryDelete<K extends DataKey<T>>(collection: K, query: ItemQuery<T[K]>): QueryDeleteChange<T, K> {
		return getQueryDelete(this, collection, query);
	}

	/** Write a single change to a synchronous provider and return an array of the changes that were written. */
	change(change: DatabaseChange<T>): DatabaseChange<T> {
		return writeChange(this, change);
	}
}

/** Asynchronous provider that offers additional helper methods for working with `Change` items. */
export class AsyncConvenienceProvider<T extends Database> extends AsyncThroughProvider<T> {
	getItemAdd<K extends DataKey<T>>(collection: K, data: T[K]): ItemAddChange<T, K> {
		return getItemAdd(this, collection, data);
	}
	getItemSet<K extends DataKey<T>>(collection: K, id: string, data: T[K]): ItemSetChange<T, K> {
		return getItemSet(this, collection, id, data);
	}
	getItemUpdate<K extends DataKey<T>>(collection: K, id: string, updates: Updates<T[K]>): ItemUpdateChange<T, K> {
		return getItemUpdate(this, collection, id, updates);
	}
	getItemDelete<K extends DataKey<T>>(collection: K, id: string): ItemDeleteChange<T, K> {
		return getItemDelete(this, collection, id);
	}
	getQuerySet<K extends DataKey<T>>(collection: K, query: ItemQuery<T[K]>, data: T[K]): QuerySetChange<T, K> {
		return getQuerySet(this, collection, query, data);
	}
	getQueryUpdate<K extends DataKey<T>>(collection: K, query: ItemQuery<T[K]>, updates: Updates<T[K]>): QueryUpdateChange<T, K> {
		return getQueryUpdate(this, collection, query, updates);
	}
	getQueryDelete<K extends DataKey<T>>(collection: K, query: ItemQuery<T[K]>): QueryDeleteChange<T, K> {
		return getQueryDelete(this, collection, query);
	}

	/** Write a single change to a synchronous provider and return an array of the changes that were written. */
	change(change: DatabaseChange<T>): Promise<DatabaseChange<T>> {
		return writeAsyncChange(this, change);
	}
}
