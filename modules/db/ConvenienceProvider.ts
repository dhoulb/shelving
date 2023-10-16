import type { DatabaseChange, DatabaseChanges, ItemAddChange, ItemDeleteChange, ItemSetChange, ItemUpdateChange, QueryDeleteChange, QuerySetChange, QueryUpdateChange } from "../change/Change.js";
import type { DataKey, Database } from "../util/data.js";
import type { Item, ItemQuery, OptionalItem } from "../util/item.js";
import type { Updates } from "../util/update.js";
import { getItemAdd, getItemDelete, getItemSet, getItemUpdate, getQueryDelete, getQuerySet, getQueryUpdate, writeAsyncProviderChange, writeAsyncProviderChanges, writeProviderChange, writeProviderChanges } from "../change/Change.js";
import { RequiredError } from "../error/RequiredError.js";
import { getOptionalFirstItem } from "../util/array.js";
import { type Optional } from "../util/optional.js";
import { AsyncThroughProvider, ThroughProvider } from "./ThroughProvider.js";

export class ConvenienceProvider<T extends Database> extends ThroughProvider<T> {
	requireItem<K extends DataKey<T>>(collection: K, id: string): Item<T[K]> {
		const item = this.getItem(collection, id);
		if (!item) throw new RequiredError(`Item must exist in "${collection}"`, id);
		return item;
	}
	getFirst<K extends DataKey<T>>(collection: K, query: ItemQuery<T[K]>): OptionalItem<T[K]> {
		return getOptionalFirstItem(this.getQuery(collection, { ...query, $limit: 1 }));
	}
	requireFirst<K extends DataKey<T>>(collection: K, query: ItemQuery<T[K]>): Item<T[K]> {
		const first = this.getFirst(collection, query);
		if (!first) throw new RequiredError(`First item must exist in "${collection}"`, query);
		return first;
	}
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
	writeChanges(...changes: Optional<DatabaseChange<T>>[]): DatabaseChanges<T> {
		return writeProviderChanges(this, ...changes);
	}
	writeChange(change: DatabaseChange<T>): DatabaseChange<T> {
		return writeProviderChange(this, change);
	}
}

export class AsyncConvenienceProvider<T extends Database> extends AsyncThroughProvider<T> {
	async requireItem<K extends DataKey<T>>(collection: K, id: string): Promise<Item<T[K]>> {
		const item = await this.getItem(collection, id);
		if (!item) throw new RequiredError(`Item must exist in "${collection}"`, id);
		return item;
	}
	async getFirst<K extends DataKey<T>>(collection: K, query: ItemQuery<T[K]>): Promise<OptionalItem<T[K]>> {
		return getOptionalFirstItem(await this.getQuery(collection, { ...query, $limit: 1 }));
	}
	async requireFirst<K extends DataKey<T>>(collection: K, query: ItemQuery<T[K]>): Promise<Item<T[K]>> {
		const first = await this.getFirst(collection, query);
		if (!first) throw new RequiredError(`First item must exist in "${collection}"`, query);
		return first;
	}
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
	writeChanges(...changes: Optional<DatabaseChange<T>>[]): Promise<DatabaseChanges<T>> {
		return writeAsyncProviderChanges(this, ...changes);
	}
	writeChange(change: DatabaseChange<T>): Promise<DatabaseChange<T>> {
		return writeAsyncProviderChange(this, change);
	}
}
