import type { AsyncProvider } from "./Provider.js";
import type { AsyncThroughProvider } from "./ThroughProvider.js";
import type { Data } from "../util/data.js";
import type { ItemArray, ItemQuery, ItemValue } from "../util/item.js";
import type { Updates } from "../util/update.js";
import { MemoryProvider } from "./MemoryProvider.js";

/** Keep a copy of asynchronous remote data in a local synchronous cache. */
export class CacheProvider implements AsyncThroughProvider {
	readonly source: AsyncProvider;
	readonly memory: MemoryProvider;
	constructor(source: AsyncProvider, cache: MemoryProvider = new MemoryProvider()) {
		this.source = source;
		this.memory = cache;
	}
	async getItem(collection: string, id: string): Promise<ItemValue> {
		const table = this.memory.getTable(collection);
		const item = await this.source.getItem(collection, id);
		item ? table.setItem(id, item) : table.deleteItem(id);
		return item;
	}
	async *getItemSequence(collection: string, id: string): AsyncIterableIterator<ItemValue> {
		const table = this.memory.getTable(collection);
		yield* table.setItemValueSequence(id, this.source.getItemSequence(collection, id));
	}
	async addItem(collection: string, data: Data): Promise<string> {
		const id = await this.source.addItem(collection, data);
		this.memory.getTable(collection).setItem(id, data);
		return id;
	}
	async setItem(collection: string, id: string, data: Data): Promise<void> {
		await this.source.setItem(collection, id, data);
		this.memory.getTable(collection).setItem(id, data);
	}
	async updateItem(collection: string, id: string, updates: Updates): Promise<void> {
		await this.source.updateItem(collection, id, updates);
		const table = this.memory.getTable(collection);
		if (table.getItem(id)) table.updateItem(id, updates);
	}
	async deleteItem(collection: string, id: string): Promise<void> {
		await this.source.deleteItem(collection, id);
		this.memory.getTable(collection).deleteItem(id);
	}
	async getQuery(collection: string, query: ItemQuery): Promise<ItemArray> {
		const items = await this.source.getQuery(collection, query);
		const table = this.memory.getTable(collection);
		table.setQueryArray(query, items);
		return items;
	}
	async *getQuerySequence(collection: string, query: ItemQuery): AsyncIterableIterator<ItemArray> {
		const table = this.memory.getTable(collection);
		yield* table.setQueryArraySequence(query, this.source.getQuerySequence(collection, query));
	}
	async setQuery(collection: string, query: ItemQuery, data: Data): Promise<number> {
		const count = await this.source.setQuery(collection, query, data);
		this.memory.getTable(collection).setQuery(query, data);
		return count;
	}
	async updateQuery(collection: string, query: ItemQuery, updates: Updates): Promise<number> {
		const count = await this.source.updateQuery(collection, query, updates);
		this.memory.getTable(collection).updateQuery(query, updates);
		return count;
	}
	async deleteQuery(collection: string, query: ItemQuery): Promise<number> {
		const count = await this.source.deleteQuery(collection, query);
		this.memory.getTable(collection).deleteQuery(query);
		return count;
	}
}
