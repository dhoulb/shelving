import type { Data } from "../../util/data.js";
import type { Identifier, Item, Items, OptionalItem } from "../../util/item.js";
import type { Query } from "../../util/query.js";
import type { Sourceable } from "../../util/source.js";
import type { Updates } from "../../util/update.js";
import type { Collection } from "../collection/Collection.js";
import { DBProvider } from "./DBProvider.js";
import { MemoryDBProvider } from "./MemoryDBProvider.js";

/** Keep a copy of asynchronous remote data in a local synchronous cache. */
export class CacheDBProvider<I extends Identifier, T extends Data> extends DBProvider<I, T> implements Sourceable<DBProvider<I, T>> {
	readonly source: DBProvider<I, T>;
	readonly memory: MemoryDBProvider<I, T>;

	constructor(source: DBProvider<I, T>, cache: MemoryDBProvider<I, T> = new MemoryDBProvider<I, T>()) {
		super();
		this.source = source;
		this.memory = cache;
	}

	async getItem<II extends I, TT extends T>(collection: Collection<string, II, TT>, id: II): Promise<OptionalItem<II, TT>> {
		const item = await this.source.getItem(collection, id);
		const table = this.memory.getTable(collection);
		item ? table.setItem(id, item) : table.deleteItem(id);
		return item;
	}

	getItemSequence<II extends I, TT extends T>(collection: Collection<string, II, TT>, id: II): AsyncIterable<OptionalItem<II, TT>> {
		return this.memory.getTable(collection).setItemSequence(id, this.source.getItemSequence(collection, id));
	}

	async addItem<II extends I, TT extends T>(collection: Collection<string, II, TT>, data: TT): Promise<II> {
		const id = await this.source.addItem(collection, data);
		this.memory.getTable(collection).setItem(id, data);
		return id;
	}

	async setItem<II extends I, TT extends T>(collection: Collection<string, II, TT>, id: II, data: TT): Promise<void> {
		await this.source.setItem(collection, id, data);
		this.memory.getTable(collection).setItem(id, data);
	}

	async updateItem<II extends I, TT extends T>(
		collection: Collection<string, II, TT>,
		id: II,
		updates: Updates<Item<II, TT>>,
	): Promise<void> {
		await this.source.updateItem(collection, id, updates);
		this.memory.getTable(collection).updateItem(id, updates);
	}

	async deleteItem<II extends I, TT extends T>(collection: Collection<string, II, TT>, id: II): Promise<void> {
		await this.source.deleteItem(collection, id);
		this.memory.getTable(collection).deleteItem(id);
	}

	override countQuery<II extends I, TT extends T>(collection: Collection<string, II, TT>, query?: Query<Item<II, TT>>): Promise<number> {
		return this.source.countQuery(collection, query);
	}

	async getQuery<II extends I, TT extends T>(collection: Collection<string, II, TT>, query?: Query<Item<II, TT>>): Promise<Items<II, TT>> {
		const items = await this.source.getQuery(collection, query);
		this.memory.getTable(collection).setItems(items);
		return items;
	}

	getQuerySequence<II extends I, TT extends T>(
		collection: Collection<string, II, TT>,
		query?: Query<Item<II, TT>>,
	): AsyncIterable<Items<II, TT>> {
		return this.memory.getTable(collection).setItemsSequence(this.source.getQuerySequence(collection, query));
	}

	async setQuery<II extends I, TT extends T>(collection: Collection<string, II, TT>, query: Query<Item<II, TT>>, data: TT): Promise<void> {
		await this.source.setQuery(collection, query, data);
		this.memory.getTable(collection).setQuery(query, data);
	}

	async updateQuery<II extends I, TT extends T>(
		collection: Collection<string, II, TT>,
		query: Query<Item<II, TT>>,
		updates: Updates<TT>,
	): Promise<void> {
		await this.source.updateQuery(collection, query, updates);
		this.memory.getTable(collection).updateQuery(query, updates);
	}

	async deleteQuery<II extends I, TT extends T>(collection: Collection<string, II, TT>, query: Query<Item<II, TT>>): Promise<void> {
		await this.source.deleteQuery(collection, query);
		this.memory.getTable(collection).deleteQuery(query);
	}
}
