import type { Data, Datas, Key } from "../util/data.js";
import type { ItemArray, ItemValue, ItemData, ItemConstraints } from "../db/Item.js";
import type { PartialObserver } from "../observe/Observer.js";
import type { Unsubscribe } from "../observe/Observable.js";
import type { DataUpdate } from "../update/DataUpdate.js";
import { ThroughObserver } from "../observe/ThroughObserver.js";
import { QueryConstraints } from "../constraint/QueryConstraints.js";
import type { AsyncProvider } from "./Provider.js";
import type { AsyncThroughProvider } from "./ThroughProvider.js";
import { MemoryProvider, MemoryTable } from "./MemoryProvider.js";

/** Keep a copy of asynchronous remote data in a local synchronous cache. */
export class CacheProvider<T extends Datas> implements AsyncThroughProvider<T> {
	readonly source: AsyncProvider<T>;
	readonly memory: MemoryProvider<T>;
	constructor(source: AsyncProvider<T>, cache: MemoryProvider<T> = new MemoryProvider()) {
		this.source = source;
		this.memory = cache;
	}
	async getItem<K extends Key<T>>(collection: K, id: string): Promise<ItemValue<T[K]>> {
		const table = this.memory.getTable(collection);
		const data = await this.source.getItem(collection, id);
		data ? table.setItemData(data) : table.deleteItem(id);
		return data;
	}
	subscribeItem<K extends Key<T>>(collection: K, id: string, observer: PartialObserver<ItemValue<T[K]>>): Unsubscribe {
		return this.source.subscribeItem(collection, id, new _CacheEntityObserver(this.memory.getTable(collection), id, observer));
	}
	async addItem<K extends Key<T>>(collection: K, data: T[K]): Promise<string> {
		const id = await this.source.addItem(collection, data);
		this.memory.getTable(collection).setItem(id, data);
		return id;
	}
	async setItem<K extends Key<T>>(collection: K, id: string, data: T[K]): Promise<void> {
		await this.source.setItem(collection, id, data);
		this.memory.getTable(collection).setItem(id, data);
	}
	async updateItem<K extends Key<T>>(collection: K, id: string, update: DataUpdate<T[K]>): Promise<void> {
		await this.source.updateItem(collection, id, update);
		const table = this.memory.getTable(collection);
		if (table.getItem(id)) table.updateItem(id, update);
	}
	async deleteItem<K extends Key<T>>(collection: K, id: string): Promise<void> {
		await this.source.deleteItem(collection, id);
		this.memory.getTable(collection).deleteItem(id);
	}
	async getQuery<K extends Key<T>>(collection: K, constraints: ItemConstraints<T[K]>): Promise<ItemArray<T[K]>> {
		const entities = await this.source.getQuery(collection, constraints);
		const table = this.memory.getTable(collection);
		table.setItems(entities);
		table.setQueryTime(constraints);
		return entities;
	}
	subscribeQuery<K extends Key<T>>(collection: K, constraints: ItemConstraints<T[K]>, observer: PartialObserver<ItemArray<T[K]>>): Unsubscribe {
		return this.source.subscribeQuery(collection, constraints, new _CacheEntitiesObserver(this.memory.getTable(collection), constraints, observer));
	}
	async setQuery<K extends Key<T>>(collection: K, constraints: ItemConstraints<T[K]>, data: T[K]): Promise<number> {
		const count = await this.source.setQuery(collection, constraints, data);
		this.memory.getTable(collection).setQuery(constraints, data);
		return count;
	}
	async updateQuery<K extends Key<T>>(collection: K, constraints: ItemConstraints<T[K]>, update: DataUpdate<T[K]>): Promise<number> {
		const count = await this.source.updateQuery(collection, constraints, update);
		this.memory.getTable(collection).updateQuery(constraints, update);
		return count;
	}
	async deleteQuery<K extends Key<T>>(collection: K, constraints: ItemConstraints<T[K]>): Promise<number> {
		const count = await this.source.deleteQuery(collection, constraints);
		this.memory.getTable(collection).deleteQuery(constraints);
		return count;
	}
}

class _CacheEntityObserver<T extends Data> extends ThroughObserver<ItemValue<T>> {
	private readonly _id: string;
	private readonly _table: MemoryTable<T>;
	constructor(table: MemoryTable<T>, id: string, source: PartialObserver<ItemValue<T>>) {
		super(source);
		this._id = id;
		this._table = table;
	}
	override next(entity: ItemValue<T>): void {
		if (entity) this._table.setItem(this._id, entity);
		else this._table.deleteItem(this._id);
		super.next(entity);
	}
}

class _CacheEntitiesObserver<T extends Data> extends ThroughObserver<ItemArray<T>> {
	private readonly _table: MemoryTable<T>;
	private readonly _constraints: QueryConstraints<ItemData<T>>;
	constructor(table: MemoryTable<T>, constraints: QueryConstraints<ItemData<T>>, source: PartialObserver<ItemArray<T>>) {
		super(source);
		this._table = table;
		this._constraints = constraints;
	}
	override next(entities: ItemArray<T>): void {
		this._table.setItems(entities);
		this._table.setQueryTime(this._constraints);
		super.next(entities);
	}
}
