import type { DocumentReference, QueryReference } from "../db/Reference.js";
import type { Data, Entities, OptionalEntity } from "../util/data.js";
import type { PartialObserver } from "../observe/Observer.js";
import type { Unsubscribe } from "../observe/Observable.js";
import { DataUpdate } from "../update/DataUpdate.js";
import { TransformObserver } from "../observe/TransformObserver.js";
import type { Provider, AsynchronousProvider } from "./Provider.js";
import { MemoryProvider } from "./MemoryProvider.js";
import { ThroughProvider } from "./ThroughProvider.js";

/** Keep a copy of received data in a local cache. */
export class CacheProvider extends ThroughProvider implements AsynchronousProvider {
	/** The local cache provider. */
	readonly memory: MemoryProvider;

	constructor(source: Provider, cache: MemoryProvider = new MemoryProvider()) {
		super(source);
		this.memory = cache;
	}

	// Override to cache any got result.
	override async getDocument<T extends Data>(ref: DocumentReference<T>): Promise<OptionalEntity<T>> {
		const table = this.memory.getTable(ref);
		const result = await super.getDocument(ref);
		result ? table.setEntity(result) : table.deleteDocument(ref.id);
		return result;
	}

	// Override to cache any got results.
	override subscribeDocument<T extends Data>(ref: DocumentReference<T>, observer: PartialObserver<OptionalEntity<T>>): Unsubscribe {
		const table = this.memory.getTable(ref);
		return super.subscribeDocument(
			ref,
			new TransformObserver((result: OptionalEntity<T>) => {
				result ? table.setEntity(result) : table.deleteDocument(ref.id);
				return result;
			}, observer),
		);
	}

	override async addDocument<T extends Data>(ref: QueryReference<T>, data: T): Promise<string> {
		const id = await super.addDocument(ref, data);
		this.memory.getTable(ref).setDocument(id, data);
		return id;
	}

	override async setDocument<T extends Data>(ref: DocumentReference<T>, data: T): Promise<void> {
		await super.setDocument(ref, data);
		this.memory.getTable(ref).setDocument(ref.id, data);
	}

	override async updateDocument<T extends Data>(ref: DocumentReference<T>, update: DataUpdate<T>): Promise<void> {
		await super.updateDocument(ref, update);
		// Update the cache but only if the document exists.
		const table = this.memory.getTable(ref);
		if (table.getDocument(ref.id)) table.updateDocument(ref.id, update);
	}

	override async deleteDocument<T extends Data>(ref: DocumentReference<T>): Promise<void> {
		await super.deleteDocument(ref);
		this.memory.deleteDocument(ref);
	}

	// Override to cache any got results.
	override async getQuery<T extends Data>(ref: QueryReference<T>): Promise<Entities<T>> {
		const entities = await super.getQuery(ref);
		this.memory.getTable(ref).setEntities(ref, entities);
		return entities;
	}

	// Override to cache any got results.
	override subscribeQuery<T extends Data>(ref: QueryReference<T>, observer: PartialObserver<Entities<T>>): Unsubscribe {
		const table = this.memory.getTable(ref);
		return super.subscribeQuery(
			ref,
			new TransformObserver((entities: Entities<T>) => {
				table.setEntities(ref, entities);
				return entities;
			}, observer),
		);
	}

	override async setQuery<T extends Data>(ref: QueryReference<T>, data: T): Promise<number> {
		const count = await super.setQuery(ref, data);
		this.memory.setQuery(ref, data);
		return count;
	}

	override async updateQuery<T extends Data>(ref: QueryReference<T>, update: DataUpdate<T>): Promise<number> {
		const count = await super.updateQuery(ref, update);
		this.memory.updateQuery(ref, update);
		return count;
	}

	override async deleteQuery<T extends Data>(ref: QueryReference<T>): Promise<number> {
		const count = await super.deleteQuery(ref);
		this.memory.deleteQuery(ref);
		return count;
	}
}
