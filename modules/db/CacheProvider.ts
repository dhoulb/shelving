import type { DataKey, Database } from "../util/data.js";
import type { ItemQuery, Items, OptionalItem } from "../util/item.js";
import type { Sourceable } from "../util/source.js";
import type { Updates } from "../util/update.js";
import { MemoryProvider } from "./MemoryProvider.js";
import { AsyncProvider } from "./Provider.js";

/** Keep a copy of asynchronous remote data in a local synchronous cache. */
export class CacheProvider<T extends Database> extends AsyncProvider<T> implements Sourceable<AsyncProvider<T>> {
	readonly source: AsyncProvider<T>;
	readonly memory: MemoryProvider<T>;
	constructor(source: AsyncProvider<T>, cache: MemoryProvider<T> = new MemoryProvider<T>()) {
		super();
		this.source = source;
		this.memory = cache;
	}
	async getItem<K extends DataKey<T>>(collection: K, id: string): Promise<OptionalItem<T[K]>> {
		const item = await this.source.getItem(collection, id);
		item ? this.memory.setItem(collection, id, item) : this.memory.deleteItem(collection, id);
		return item;
	}
	getItemSequence<K extends DataKey<T>>(collection: K, id: string): AsyncIterable<OptionalItem<T[K]>> {
		return this.memory.setItemSequence(collection, id, this.source.getItemSequence(collection, id));
	}
	async addItem<K extends DataKey<T>>(collection: K, data: T[K]): Promise<string> {
		const id = await this.source.addItem(collection, data);
		this.memory.setItem(collection, id, data);
		return id;
	}
	async setItem<K extends DataKey<T>>(collection: K, id: string, data: T[K]): Promise<void> {
		await this.source.setItem(collection, id, data);
		this.memory.setItem(collection, id, data);
	}
	async updateItem<K extends DataKey<T>>(collection: K, id: string, updates: Updates<T[K]>): Promise<void> {
		await this.source.updateItem(collection, id, updates);
		this.memory.updateItem(collection, id, updates);
	}
	async deleteItem<K extends DataKey<T>>(collection: K, id: string): Promise<void> {
		await this.source.deleteItem(collection, id);
		this.memory.deleteItem(collection, id);
	}
	override countQuery<K extends DataKey<T>>(collection: K, query?: ItemQuery<T[K]>): Promise<number> {
		return this.source.countQuery(collection, query);
	}
	async getQuery<K extends DataKey<T>>(collection: K, query?: ItemQuery<T[K]>): Promise<Items<T[K]>> {
		const items = await this.source.getQuery(collection, query);
		this.memory.setItems(collection, items, query);
		return items;
	}
	getQuerySequence<K extends DataKey<T>>(collection: K, query?: ItemQuery<T[K]>): AsyncIterable<Items<T[K]>> {
		return this.memory.setItemsSequence(collection, this.source.getQuerySequence(collection, query), query);
	}
	async setQuery<K extends DataKey<T>>(collection: K, query: ItemQuery<T[K]>, data: T[K]): Promise<void> {
		await this.source.setQuery(collection, query, data);
		this.memory.setQuery(collection, query, data);
	}
	async updateQuery<K extends DataKey<T>>(collection: K, query: ItemQuery<T[K]>, updates: Updates<T[K]>): Promise<void> {
		await this.source.updateQuery(collection, query, updates);
		this.memory.updateQuery(collection, query, updates);
	}
	async deleteQuery<K extends DataKey<T>>(collection: K, query: ItemQuery<T[K]>): Promise<void> {
		await this.source.deleteQuery(collection, query);
		this.memory.deleteQuery(collection, query);
	}
}
