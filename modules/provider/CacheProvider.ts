import type { Data, Datas, Entities, Entity, Key, OptionalEntity } from "../util/data.js";
import type { PartialObserver } from "../observe/Observer.js";
import type { Unsubscribe } from "../observe/Observable.js";
import type { DataUpdate } from "../update/DataUpdate.js";
import { ThroughObserver } from "../observe/ThroughObserver.js";
import { Query } from "../query/Query.js";
import type { AsyncProvider, ProviderCollection, ProviderDocument, ProviderQuery } from "./Provider.js";
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
	async getDocument<K extends Key<T>>(ref: ProviderDocument<T, K>): Promise<OptionalEntity<T[K]>> {
		const table = this.memory.getTable(ref);
		const result = await this.source.getDocument(ref);
		result ? table.setEntity(result) : table.deleteDocument(ref.id);
		return result;
	}
	subscribeDocument<K extends Key<T>>(ref: ProviderDocument<T, K>, observer: PartialObserver<OptionalEntity<T[K]>>): Unsubscribe {
		return this.source.subscribeDocument(ref, new _CacheEntityObserver(ref.id, this.memory.getTable(ref), observer));
	}
	async addDocument<K extends Key<T>>(ref: ProviderCollection<T, K>, data: T[K]): Promise<string> {
		const id = await this.source.addDocument(ref, data);
		this.memory.getTable(ref).setDocument(id, data);
		return id;
	}
	async setDocument<K extends Key<T>>(ref: ProviderDocument<T, K>, data: T[K]): Promise<void> {
		await this.source.setDocument(ref, data);
		this.memory.getTable(ref).setDocument(ref.id, data);
	}
	async updateDocument<K extends Key<T>>(ref: ProviderDocument<T, K>, update: DataUpdate<T[K]>): Promise<void> {
		await this.source.updateDocument(ref, update);
		const table = this.memory.getTable(ref);
		if (table.getDocument(ref.id)) table.updateDocument(ref.id, update);
	}
	async deleteDocument<K extends Key<T>>(ref: ProviderDocument<T, K>): Promise<void> {
		await this.source.deleteDocument(ref);
		this.memory.deleteDocument(ref);
	}
	async getQuery<K extends Key<T>>(ref: ProviderQuery<T, K>): Promise<Entities<T[K]>> {
		const entities = await this.source.getQuery(ref);
		this.memory.getTable(ref).setEntities(ref, entities);
		return entities;
	}
	subscribeQuery<K extends Key<T>>(ref: ProviderQuery<T, K>, observer: PartialObserver<Entities<T[K]>>): Unsubscribe {
		return this.source.subscribeQuery(ref, new _CacheEntitiesObserver(ref, this.memory.getTable(ref), observer));
	}
	async setQuery<K extends Key<T>>(ref: ProviderQuery<T, K>, data: T[K]): Promise<number> {
		const count = await this.source.setQuery(ref, data);
		this.memory.setQuery(ref, data);
		return count;
	}
	async updateQuery<K extends Key<T>>(ref: ProviderQuery<T, K>, update: DataUpdate<T[K]>): Promise<number> {
		const count = await this.source.updateQuery(ref, update);
		this.memory.updateQuery(ref, update);
		return count;
	}
	async deleteQuery<K extends Key<T>>(ref: ProviderQuery<T, K>): Promise<number> {
		const count = await this.source.deleteQuery(ref);
		this.memory.deleteQuery(ref);
		return count;
	}
}

class _CacheEntityObserver<T extends Data> extends ThroughObserver<OptionalEntity<T>> {
	private readonly _id: string;
	private readonly _table: MemoryTable<T>;
	constructor(id: string, table: MemoryTable<T>, source: PartialObserver<OptionalEntity<T>>) {
		super(source);
		this._id = id;
		this._table = table;
	}
	override next(entity: OptionalEntity<T>): void {
		if (entity) this._table.setDocument(this._id, entity);
		else this._table.deleteDocument(this._id);
		super.next(entity);
	}
}

class _CacheEntitiesObserver<T extends Data> extends ThroughObserver<Entities<T>> {
	private readonly _query: Query<Entity<T>>;
	private readonly _table: MemoryTable<T>;
	constructor(query: Query<Entity<T>>, table: MemoryTable<T>, source: PartialObserver<Entities<T>>) {
		super(source);
		this._query = query;
		this._table = table;
	}
	override next(entities: Entities<T>): void {
		this._table.setEntities(this._query, entities);
		super.next(entities);
	}
}
