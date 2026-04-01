import type { Data } from "../../util/data.js";
import type { Identifier, Items, OptionalItem } from "../../util/item.js";
import type { ItemQuery } from "../../util/query.js";
import type { Sourceable } from "../../util/source.js";
import type { Updates } from "../../util/update.js";
import type { Collection } from "../collection/Collection.js";
import { DBProvider } from "./DBProvider.js";
import { MemoryDBProvider } from "./MemoryDBProvider.js";

/** Keep a copy of asynchronous remote data in a local synchronous cache. */
export class CacheDBProvider<I extends Identifier = Identifier> extends DBProvider<I> implements Sourceable<DBProvider<I>> {
	readonly source: DBProvider<I>;
	readonly memory: MemoryDBProvider<I>;

	constructor(source: DBProvider<I>, cache: MemoryDBProvider<I> = new MemoryDBProvider<I>()) {
		super();
		this.source = source;
		this.memory = cache;
	}

	async getItem<T extends Data>(collection: Collection<string, I, T>, id: I): Promise<OptionalItem<I, T>> {
		const item = await this.source.getItem(collection, id);
		const table = this.memory.getTable<T>(collection.name);
		item ? table.setItem(id, item) : table.deleteItem(id);
		return item;
	}

	getItemSequence<T extends Data>(collection: Collection<string, I, T>, id: I): AsyncIterable<OptionalItem<I, T>> {
		return this.memory.setItemSequence(collection, id, this.source.getItemSequence(collection, id));
	}

	async addItem<T extends Data>(collection: Collection<string, I, T>, data: T): Promise<I> {
		const id = await this.source.addItem(collection, data);
		this.memory.getTable<T>(collection.name).setItem(id, data);
		return id;
	}

	async setItem<T extends Data>(collection: Collection<string, I, T>, id: I, data: T): Promise<void> {
		await this.source.setItem(collection, id, data);
		this.memory.getTable<T>(collection.name).setItem(id, data);
	}

	async updateItem<T extends Data>(collection: Collection<string, I, T>, id: I, updates: Updates<T>): Promise<void> {
		await this.source.updateItem(collection, id, updates);
		this.memory.getTable<T>(collection.name).updateItem(id, updates);
	}

	async deleteItem<T extends Data>(collection: Collection<string, I, T>, id: I): Promise<void> {
		await this.source.deleteItem(collection, id);
		this.memory.getTable<T>(collection.name).deleteItem(id);
	}

	override countQuery<T extends Data>(collection: Collection<string, I, T>, query?: ItemQuery<I, T>): Promise<number> {
		return this.source.countQuery(collection, query);
	}

	async getQuery<T extends Data>(collection: Collection<string, I, T>, query?: ItemQuery<I, T>): Promise<Items<I, T>> {
		const items = await this.source.getQuery(collection, query);
		this.memory.getTable<T>(collection.name).setItems(items, query);
		return items;
	}

	getQuerySequence<T extends Data>(collection: Collection<string, I, T>, query?: ItemQuery<I, T>): AsyncIterable<Items<I, T>> {
		return this.memory.setItemsSequence(collection, this.source.getQuerySequence(collection, query), query);
	}

	async setQuery<T extends Data>(collection: Collection<string, I, T>, query: ItemQuery<I, T>, data: T): Promise<void> {
		await this.source.setQuery(collection, query, data);
		this.memory.getTable<T>(collection.name).setQuery(query, data);
	}

	async updateQuery<T extends Data>(collection: Collection<string, I, T>, query: ItemQuery<I, T>, updates: Updates<T>): Promise<void> {
		await this.source.updateQuery(collection, query, updates);
		this.memory.getTable<T>(collection.name).updateQuery(query, updates);
	}

	async deleteQuery<T extends Data>(collection: Collection<string, I, T>, query: ItemQuery<I, T>): Promise<void> {
		await this.source.deleteQuery(collection, query);
		this.memory.getTable<T>(collection.name).deleteQuery(query);
	}
}
