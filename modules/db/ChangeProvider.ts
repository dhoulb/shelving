import type { DatabaseChange, DatabaseChanges, ItemDeleteChange, ItemSetChange, ItemUpdateChange, QueryDeleteChange, QuerySetChange, QueryUpdateChange } from "../change/Change.js";
import type { DataKey, Database } from "../util/data.js";
import type { ItemQuery } from "../util/item.js";
import type { Optional } from "../util/optional.js";
import type { Updates } from "../util/update.js";
import { getItemDelete, getItemSet, getItemUpdate, getQueryDelete, getQuerySet, getQueryUpdate, writeAsyncProviderChange, writeAsyncProviderChanges, writeProviderChange, writeProviderChanges } from "../change/Change.js";
import { AsyncThroughProvider, ThroughProvider } from "./ThroughProvider.js";

export class ChangeProvider<T extends Database> extends ThroughProvider<T> {
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
	writeChanges(...changes: Optional<DatabaseChange<T>>[]): DatabaseChanges<T> {
		return writeProviderChanges(this, ...changes);
	}
	writeChange(change: DatabaseChange<T>): DatabaseChange<T> {
		return writeProviderChange(this, change);
	}
}

export class AsyncChangeProvider<T extends Database> extends AsyncThroughProvider<T> {
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
	writeChanges(...changes: Optional<DatabaseChange<T>>[]): Promise<DatabaseChanges<T>> {
		return writeAsyncProviderChanges(this, ...changes);
	}
	writeChange(change: DatabaseChange<T>): Promise<DatabaseChange<T>> {
		return writeAsyncProviderChange(this, change);
	}
}
