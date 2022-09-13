import type { Datas, DataKey } from "../util/data.js";
import type { ItemArray, ItemValue, ItemConstraints } from "../db/Item.js";
import type { Updates } from "../update/DataUpdate.js";
import type { AsyncProvider } from "./Provider.js";
import type { AsyncThroughProvider } from "./ThroughProvider.js";
import { MemoryProvider } from "./MemoryProvider.js";

/** Keep a copy of asynchronous remote data in a local synchronous cache. */
export class CacheProvider<T extends Datas> implements AsyncThroughProvider<T> {
	readonly source: AsyncProvider<T>;
	readonly memory: MemoryProvider<T>;
	constructor(source: AsyncProvider<T>, cache: MemoryProvider<T> = new MemoryProvider()) {
		this.source = source;
		this.memory = cache;
	}
	async getItem<K extends DataKey<T>>(collection: K, id: string): Promise<ItemValue<T[K]>> {
		const table = this.memory.getTable(collection);
		const item = await this.source.getItem(collection, id);
		item ? table.setItem(id, item) : table.deleteItem(id);
		return item;
	}
	async *getItemSequence<K extends DataKey<T>>(collection: K, id: string): AsyncIterableIterator<ItemValue<T[K]>> {
		const table = this.memory.getTable(collection);
		yield* table.setItemValueSequence(id, this.source.getItemSequence(collection, id));
	}
	async addItem<K extends DataKey<T>>(collection: K, data: T[K]): Promise<string> {
		const id = await this.source.addItem(collection, data);
		this.memory.getTable(collection).setItem(id, data);
		return id;
	}
	async setItem<K extends DataKey<T>>(collection: K, id: string, data: T[K]): Promise<void> {
		await this.source.setItem(collection, id, data);
		this.memory.getTable(collection).setItem(id, data);
	}
	async updateItem<K extends DataKey<T>>(collection: K, id: string, updates: Updates<T[K]>): Promise<void> {
		await this.source.updateItem(collection, id, updates);
		const table = this.memory.getTable(collection);
		if (table.getItem(id)) table.updateItem(id, updates);
	}
	async deleteItem<K extends DataKey<T>>(collection: K, id: string): Promise<void> {
		await this.source.deleteItem(collection, id);
		this.memory.getTable(collection).deleteItem(id);
	}
	async getQuery<K extends DataKey<T>>(collection: K, constraints: ItemConstraints<T[K]>): Promise<ItemArray<T[K]>> {
		const items = await this.source.getQuery(collection, constraints);
		const table = this.memory.getTable(collection);
		table.setQueryItems(constraints, items);
		return items;
	}
	async *getQuerySequence<K extends DataKey<T>>(collection: K, constraints: ItemConstraints<T[K]>): AsyncIterableIterator<ItemArray<T[K]>> {
		const table = this.memory.getTable(collection);
		yield* table.setQueryItemsSequence(constraints, this.source.getQuerySequence(collection, constraints));
	}
	async setQuery<K extends DataKey<T>>(collection: K, constraints: ItemConstraints<T[K]>, data: T[K]): Promise<number> {
		const count = await this.source.setQuery(collection, constraints, data);
		this.memory.getTable(collection).setQuery(constraints, data);
		return count;
	}
	async updateQuery<K extends DataKey<T>>(collection: K, constraints: ItemConstraints<T[K]>, updates: Updates<T[K]>): Promise<number> {
		const count = await this.source.updateQuery(collection, constraints, updates);
		this.memory.getTable(collection).updateQuery(constraints, updates);
		return count;
	}
	async deleteQuery<K extends DataKey<T>>(collection: K, constraints: ItemConstraints<T[K]>): Promise<number> {
		const count = await this.source.deleteQuery(collection, constraints);
		this.memory.getTable(collection).deleteQuery(constraints);
		return count;
	}
}
