import { Entity, OptionalEntity, Entities, Key, Datas } from "../util/data.js";
import type { Dispatch } from "../util/function.js";
import { getFirstItem, getLastItem, ImmutableArray } from "../util/array.js";
import type { PartialObserver } from "../observe/Observer.js";
import { Query, QueryProps } from "../query/Query.js";
import { countItems, hasItems } from "../util/iterate.js";
import { DataUpdate, PropUpdates } from "../update/DataUpdate.js";
import type { Observable, Unsubscribe } from "../observe/Observable.js";
import { RequiredError } from "../error/RequiredError.js";
import type { Database, AsynchronousDatabase, SynchronousDatabase } from "./Database.js";
import type { DatabaseDocument, AsynchronousDatabaseDocument, SynchronousDatabaseDocument } from "./DatabaseDocument.js";

/** Reference to a set of documents in a provider. */
export type DatabaseQuery<T extends Datas, K extends Key<T>> = _AbstractDatabaseQuery<T, K>;

/** Reference to a set of documents in a sync or async provider. */
abstract class _AbstractDatabaseQuery<T extends Datas, K extends Key<T>> extends Query<Entity<T[K]>> implements Observable<ImmutableArray<Entity<T[K]>>> {
	abstract readonly db: Database<T>;
	abstract readonly collection: K;

	/** Reference a document in this query's collection. */
	abstract doc(id: string): DatabaseDocument<T, K>;

	/**
	 * Create a new document with a random ID.
	 * - Created document is guaranteed to have a unique ID.
	 *
	 * @param data Complete data to set the document to.
	 * @return String ID for the created document (possibly promised).
	 */
	abstract add(data: T[K]): string | PromiseLike<string>;

	/**
	 * Get array of entities for this query.
	 * @return Array of entities.
	 */
	abstract value: Entities<T[K]> | PromiseLike<Entities<T[K]>>;

	/**
	 * Count the number of results of this set of documents.
	 * @return Number of documents matching the query (possibly promised).
	 */
	abstract count: number | PromiseLike<number>;

	/**
	 * Does at least one document exist for this query?
	 * @return `true` if a document exists or `false` otherwise (possibly promised).
	 */
	abstract exists: boolean | PromiseLike<boolean>;

	/**
	 * Get the first document matched by this query or `null` if this query has no results.
	 * @throws RequiredError if there were no results for this query.
	 */
	abstract first: OptionalEntity<T[K]> | PromiseLike<OptionalEntity<T[K]>>;

	/**
	 * Get the first document matched by this query.
	 * @throws RequiredError if there were no results for this query.
	 */
	abstract data: Entity<T[K]> | PromiseLike<Entity<T[K]>>;

	/**
	 * Subscribe to all matching documents.
	 * - `next()` is called once with the initial results, and again any time the results change.
	 *
	 * @param next Observer with `next`, `error`, or `complete` methods or a `next()` dispatcher.
	 * @return Function that ends the subscription.
	 */
	subscribe(next: PartialObserver<Entities<T[K]>> | Dispatch<[Entities<T[K]>]>): Unsubscribe {
		return this.db.provider.subscribeQuery(this, typeof next === "function" ? { next } : next);
	}

	/**
	 * Set all matching documents to the same exact value.
	 *
	 * @param data Complete data to set the document to.
	 * @return Nothing (possibly promised).
	 */
	abstract set(data: T[K]): number | PromiseLike<number>;

	/**
	 * Update all matching documents with the same partial value.
	 *
	 * @param updates `Update` instance or set of updates to apply to every matching document.
	 * @return Nothing (possibly promised).
	 */
	abstract update(updates: DataUpdate<T[K]> | PropUpdates<T[K]>): number | PromiseLike<number>;

	/**
	 * Delete all matching documents.
	 * @return Nothing (possibly promised).
	 */
	abstract delete(): number | PromiseLike<number>;

	// Override to include the collection name.
	override toString(): string {
		return `${this.collection}?${super.toString()}`;
	}
}

/** Reference to a set of documents in a provider. */
export class SynchronousDatabaseQuery<T extends Datas, K extends Key<T>> extends _AbstractDatabaseQuery<T, K> {
	readonly db: SynchronousDatabase<T>;
	readonly collection: K;
	constructor(db: SynchronousDatabase<T>, collection: K, props?: QueryProps<Entity<T[K]>>) {
		super(props);
		this.db = db;
		this.collection = collection;
	}
	doc(id: string): SynchronousDatabaseDocument<T, K> {
		return this.db.doc(this.collection, id);
	}
	add(data: T[K]): string {
		return this.db.provider.addDocument(this, data);
	}
	get value(): Entities<T[K]> {
		return this.db.provider.getQuery(this);
	}
	get count(): number {
		return this.value.length;
	}
	get exists(): boolean {
		return hasItems(this.db.provider.getQuery(this.max(1)));
	}
	get first(): OptionalEntity<T[K]> {
		return getQueryFirstItem(this.db.provider.getQuery(this.max(1)));
	}
	get data(): Entity<T[K]> {
		return getQueryFirstData(this.db.provider.getQuery(this.max(1)), this);
	}
	set(data: T[K]): number {
		return this.db.provider.setQuery(this, data);
	}
	update(updates: DataUpdate<T[K]> | PropUpdates<T[K]>): number {
		return this.db.provider.updateQuery(this, updates instanceof DataUpdate ? updates : new DataUpdate(updates));
	}
	delete(): number {
		return this.db.provider.deleteQuery(this);
	}
}

/** Reference to a set of documents in a provider. */
export class AsynchronousDatabaseQuery<T extends Datas, K extends Key<T>> extends _AbstractDatabaseQuery<T, K> {
	readonly db: AsynchronousDatabase<T>;
	readonly collection: K;
	constructor(db: AsynchronousDatabase<T>, collection: K, props?: QueryProps<Entity<T[K]>>) {
		super(props);
		this.db = db;
		this.collection = collection;
	}
	doc(id: string): AsynchronousDatabaseDocument<T, K> {
		return this.db.doc(this.collection, id);
	}
	add(data: T[K]): Promise<string> {
		return this.db.provider.addDocument(this, data);
	}
	get value(): Promise<Entities<T[K]>> {
		return this.db.provider.getQuery(this);
	}
	get count(): Promise<number> {
		return this.value.then(countItems);
	}
	get exists(): Promise<boolean> {
		return this.db.provider.getQuery(this.max(1)).then(hasItems);
	}
	get first(): Promise<OptionalEntity<T[K]>> {
		return this.db.provider.getQuery(this.max(1)).then(getQueryFirstItem);
	}
	get data(): Promise<Entity<T[K]>> {
		return this.db.provider.getQuery(this.max(1)).then(v => getQueryFirstData(v, this));
	}
	set(data: T[K]): Promise<number> {
		return this.db.provider.setQuery(this, data);
	}
	update(updates: DataUpdate<T[K]> | PropUpdates<T[K]>): PromiseLike<number> {
		return this.db.provider.updateQuery(this, updates instanceof DataUpdate ? updates : new DataUpdate(updates));
	}
	delete(): PromiseLike<number> {
		return this.db.provider.deleteQuery(this);
	}
}

/** Get the optional data for a document from a set of queried entities. */
export function getQueryFirstItem<T extends Datas, K extends Key<T>>(entities: Entities<T[K]>): OptionalEntity<T[K]> {
	return getFirstItem(entities) || null;
}

/** Get the data for a document from a set of queried entities. */
export function getQueryFirstData<T extends Datas, K extends Key<T>>(entities: Entities<T[K]>, ref: _AbstractDatabaseQuery<T, K>): Entity<T[K]> {
	const entity = getQueryFirstItem(entities);
	if (entity) return entity;
	throw new RequiredError(`Query "${ref}" has no documents`);
}
/** Get the optional data for a document from a set of queried entities. */
export function getQueryLastValue<T extends Datas, K extends Key<T>>(entities: Entities<T[K]>): OptionalEntity<T[K]> {
	return getLastItem(entities) || null;
}

/** Get the data for a document from a set of queried entities. */
export function getQueryLastItem<T extends Datas, K extends Key<T>>(entities: Entities<T[K]>, ref: _AbstractDatabaseQuery<T, K>): Entity<T[K]> {
	const entity = getQueryLastValue(entities);
	if (entity) return entity;
	throw new RequiredError(`Query "${ref}" has no documents`);
}
