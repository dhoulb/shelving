import { OptionalData, Entity, OptionalEntity, Datas, Key } from "../util/data.js";
import type { Dispatch } from "../util/function.js";
import type { PartialObserver } from "../observe/Observer.js";
import { QueryProps } from "../query/Query.js";
import { DataUpdate, PropUpdates } from "../update/DataUpdate.js";
import type { Observable, Unsubscribe } from "../observe/Observable.js";
import { RequiredError } from "../error/RequiredError.js";
import { FilterProps } from "../query/Filter.js";
import type { ProviderDocument } from "../provider/Provider.js";
import type { Database, SynchronousDatabase, AsynchronousDatabase } from "./Database.js";
import type { DatabaseQuery, AsynchronousDatabaseQuery, SynchronousDatabaseQuery } from "./DatabaseQuery.js";

/** Reference to a document in a provider. */
export type DatabaseDocument<T extends Datas, K extends Key<T>> = _AbstractDatabaseDocument<T, K>;

/** Reference to a document in a synchronous or asynchronous provider. */
abstract class _AbstractDatabaseDocument<T extends Datas, K extends Key<T>> implements Observable<OptionalData<T[K]>>, ProviderDocument<T, K> {
	abstract readonly db: Database<T>;
	abstract readonly collection: K;
	abstract readonly id: string;

	/** Create a query on this document's collection. */
	abstract query(query?: QueryProps<Entity<T[K]>>): DatabaseQuery<T, K>;

	/** Get an 'optional' reference to this document (uses a `ModelQuery` with an `id` filter). */
	abstract optional: DatabaseQuery<T, K>;

	/**
	 * Does this document exist?
	 * @return `true` if a document exists or `false` otherwise (possibly promised).
	 */
	abstract exists: boolean | PromiseLike<boolean>;

	/**
	 * Get the optional data of this document.
	 * @return Document's data, or `null` if the document doesn't exist (possibly promised).
	 */
	abstract value: OptionalEntity<T[K]> | PromiseLike<OptionalEntity<T[K]>>;

	/**
	 * Get the data of this document.
	 * - Useful for destructuring, e.g. `{ name, title } = await documentThatMustExist.asyncData`
	 *
	 * @return Document's data (possibly promised).
	 * @throws RequiredError if the document does not exist.
	 */
	abstract data: Entity<T[K]> | PromiseLike<Entity<T[K]>>;

	/**
	 * Subscribe to the result of this document (indefinitely).
	 * - `next()` is called once with the initial result, and again any time the result changes.
	 *
	 * @param next Observer with `next`, `error`, or `complete` methods or a `next()` dispatcher.
	 * @return Function that ends the subscription.
	 */
	subscribe(next: PartialObserver<OptionalEntity<T[K]>> | Dispatch<[OptionalEntity<T[K]>]>): Unsubscribe {
		return this.db.provider.subscribeDocument(this, typeof next === "function" ? { next } : next);
	}

	/** Set the complete data of this document. */
	abstract set(data: T[K]): void | PromiseLike<void>;

	/** Update this document. */
	abstract update(updates: DataUpdate<T[K]> | PropUpdates<T[K]>): void | PromiseLike<void>;

	/** Delete this document. */
	abstract delete(): void | PromiseLike<void>;

	// Implement toString()
	toString(): string {
		return `${this.collection}/${this.id}`;
	}
}

/** Reference to a document in a synchronous provider. */
export class SynchronousDatabaseDocument<T extends Datas, K extends Key<T>> extends _AbstractDatabaseDocument<T, K> {
	readonly db: SynchronousDatabase<T>;
	readonly collection: K;
	readonly id: string;
	constructor(db: SynchronousDatabase<T>, collection: K, id: string) {
		super();
		this.db = db;
		this.collection = collection;
		this.id = id;
	}
	query(query?: QueryProps<Entity<T[K]>>): SynchronousDatabaseQuery<T, K> {
		return this.db.query(this.collection, query);
	}
	get optional(): SynchronousDatabaseQuery<T, K> {
		return this.db.query(this.collection, { filter: { id: this.id } as FilterProps<Entity<T[K]>>, limit: 1 });
	}
	get exists(): boolean {
		return !!this.db.provider.getDocument(this);
	}
	get value(): OptionalEntity<T[K]> {
		return this.db.provider.getDocument(this);
	}
	get data(): Entity<T[K]> {
		return getDocumentData(this.value, this);
	}
	set(data: T[K]): void {
		return this.db.provider.setDocument(this, data);
	}
	update(updates: DataUpdate<T[K]> | PropUpdates<T[K]>): void {
		return this.db.provider.updateDocument(this, updates instanceof DataUpdate ? updates : new DataUpdate(updates));
	}
	delete(): void {
		return this.db.provider.deleteDocument(this);
	}
}

/** Reference to a document in an asynchronous provider. */
export class AsynchronousDatabaseDocument<T extends Datas, K extends Key<T>> extends _AbstractDatabaseDocument<T, K> {
	readonly db: AsynchronousDatabase<T>;
	readonly collection: K;
	readonly id: string;
	constructor(provider: AsynchronousDatabase<T>, collection: K, id: string) {
		super();
		this.db = provider;
		this.collection = collection;
		this.id = id;
	}
	query(query?: QueryProps<Entity<T[K]>>): AsynchronousDatabaseQuery<T, K> {
		return this.db.query(this.collection, query);
	}
	get optional(): AsynchronousDatabaseQuery<T, K> {
		return this.db.query(this.collection, { filter: { id: this.id } as FilterProps<Entity<T[K]>>, limit: 1 });
	}
	get exists(): Promise<boolean> {
		return this.db.provider.getDocument(this).then(Boolean);
	}
	get value(): Promise<OptionalEntity<T[K]>> {
		return this.db.provider.getDocument(this);
	}
	get data(): Promise<Entity<T[K]>> {
		return this.value.then(v => getDocumentData(v, this));
	}
	set(data: T[K]): Promise<void> {
		return this.db.provider.setDocument(this, data);
	}
	update(updates: DataUpdate<T[K]> | PropUpdates<T[K]>): Promise<void> {
		return this.db.provider.updateDocument(this, updates instanceof DataUpdate ? updates : new DataUpdate(updates));
	}
	delete(): Promise<void> {
		return this.db.provider.deleteDocument(this);
	}
}

/** Get the data for a document from a result for that document. */
export function getDocumentData<T extends Datas, K extends Key<T>>(entity: OptionalEntity<T[K]>, ref: _AbstractDatabaseDocument<T, K>): Entity<T[K]> {
	if (entity) return entity;
	throw new RequiredError(`Document "${ref}" does not exist`);
}
