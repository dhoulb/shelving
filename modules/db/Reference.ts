import type { Data, OptionalData, Entity, OptionalEntity, Entities } from "../util/data.js";
import type { Dispatch } from "../util/function.js";
import { getFirstItem, getLastItem, ImmutableArray } from "../util/array.js";
import type { PartialObserver } from "../observe/Observer.js";
import type { Validator } from "../util/validate.js";
import { Query, QueryProps } from "../query/Query.js";
import { Filters } from "../query/Filters.js";
import { Sorts } from "../query/Sorts.js";
import { callAsync } from "../util/async.js";
import { countItems, hasItems } from "../util/iterate.js";
import { DataUpdate, PropUpdates } from "../update/DataUpdate.js";
import type { FilterProps } from "../query/Filter.js";
import type { Observable, Unsubscribe } from "../observe/Observable.js";
import { RequiredError } from "../error/RequiredError.js";
import type { Database } from "./Database.js";

/** A refence to a location in a database. */
export interface Reference {
	readonly db: Database;
	toString(): string;
}

/** A query reference within a specific database. */
export class QueryReference<T extends Data = Data> extends Query<Entity<T>> implements Observable<ImmutableArray<Entity<T>>>, Reference {
	readonly db: Database;
	readonly validator: Validator<T>;
	readonly collection: string;
	constructor(db: Database, validator: Validator<T>, collection: string, { sort, limit, ...filters }: QueryProps<Entity<T>> = {}) {
		super(Filters.on(filters as FilterProps<Entity<T>>), sort && Sorts.on(sort), limit);
		this.db = db;
		this.validator = validator;
		this.collection = collection;
	}

	/** Reference a document in this query's collection. */
	doc(id: string): DocumentReference<T> {
		return new DocumentReference(this.db, this.validator, this.collection, id);
	}

	/**
	 * Create a new document with a random ID.
	 * - Created document is guaranteed to have a unique ID.
	 *
	 * @param data Complete data to set the document to.
	 * @return String ID for the created document (possibly promised).
	 */
	add(data: T): string | PromiseLike<string> {
		return this.db.provider.addDocument(this, data);
	}

	/**
	 * Get array of entities for this query.
	 * @return Array of entities.
	 */
	get value(): Entities<T> | PromiseLike<Entities<T>> {
		return this.db.provider.getQuery(this);
	}

	/**
	 * Count the number of results of this set of documents.
	 * @return Number of documents matching the query (possibly promised).
	 */
	get count(): number | PromiseLike<number> {
		return callAsync(countItems, this.value);
	}

	/**
	 * Does at least one document exist for this query?
	 * @return `true` if a document exists or `false` otherwise (possibly promised).
	 */
	get exists(): boolean | PromiseLike<boolean> {
		return callAsync(hasItems, this.db.provider.getQuery(this.max(1)));
	}

	/**
	 * Get the first document matched by this query or `null` if this query has no results.
	 * @throws RequiredError if there were no results for this query.
	 */
	get firstValue(): OptionalEntity<T> | PromiseLike<OptionalEntity<T>> {
		return callAsync(getQueryFirstValue, this.db.provider.getQuery(this.max(1)));
	}

	/**
	 * Get the first document matched by this query.
	 * @throws RequiredError if there were no results for this query.
	 */
	get firstData(): Entity<T> | PromiseLike<Entity<T>> {
		return callAsync(getQueryFirstData, this.db.provider.getQuery(this.max(1)), this);
	}

	/**
	 * Get the last document matched by this query or `null` if this query has no results.
	 * @throws RequiredError if there were no results for this query.
	 */
	get lastValue(): OptionalEntity<T> | PromiseLike<OptionalEntity<T>> {
		return callAsync(getQueryLastValue, this.db.provider.getQuery(this.max(1)));
	}

	/**
	 * Get the last document matched by this query.
	 * @throws RequiredError if there were no results for this query.
	 */
	get lastData(): Entity<T> | PromiseLike<Entity<T>> {
		return callAsync(getQueryLastData, this.db.provider.getQuery(this.max(1)), this);
	}

	/**
	 * Subscribe to all matching documents.
	 * - `next()` is called once with the initial results, and again any time the results change.
	 *
	 * @param next Observer with `next`, `error`, or `complete` methods or a `next()` dispatcher.
	 * @return Function that ends the subscription.
	 */
	subscribe(next: PartialObserver<ImmutableArray<Entity<T>>> | Dispatch<[ImmutableArray<Entity<T>>]>): Unsubscribe {
		return this.db.provider.subscribeQuery(this, typeof next === "function" ? { next } : next);
	}

	/**
	 * Set all matching documents to the same exact value.
	 *
	 * @param data Complete data to set the document to.
	 * @return Nothing (possibly promised).
	 */
	set(data: T): number | PromiseLike<number> {
		return this.db.provider.setQuery(this, data);
	}

	/**
	 * Update all matching documents with the same partial value.
	 *
	 * @param updates `Update` instance or set of updates to apply to every matching document.
	 * @return Nothing (possibly promised).
	 */
	update(updates: DataUpdate<T> | PropUpdates<T>): number | PromiseLike<number> {
		return this.db.provider.updateQuery<T>(this, updates instanceof DataUpdate ? updates : new DataUpdate<T>(updates));
	}

	/**
	 * Delete all matching documents.
	 * @return Nothing (possibly promised).
	 */
	delete(): number | PromiseLike<number> {
		return this.db.provider.deleteQuery(this);
	}

	// Override to include the collection name.
	override toString(): string {
		return `${this.collection}?${super.toString()}`;
	}
}

/** A document reference within a specific database. */
export class DocumentReference<T extends Data = Data> implements Observable<OptionalData<T>>, Reference {
	readonly db: Database;
	readonly validator: Validator<T>;
	readonly collection: string;
	readonly id: string;
	constructor(db: Database, validator: Validator<T>, collection: string, id: string) {
		this.db = db;
		this.validator = validator;
		this.collection = collection;
		this.id = id;
	}

	/** Create a query on this document's collection. */
	query(query?: QueryProps<Entity<T>>): QueryReference<T> {
		return new QueryReference(this.db, this.validator, this.collection, query);
	}

	/** Get an 'optional' reference to this document (uses a `ModelQuery` with an `id` filter). */
	get optional(): QueryReference<T> {
		return new QueryReference(this.db, this.validator, this.collection, { id: this.id, limit: 1 } as QueryProps<Entity<T>>);
	}

	/**
	 * Does this document exist?
	 * @return `true` if a document exists or `false` otherwise (possibly promised).
	 */
	get exists(): boolean | PromiseLike<boolean> {
		return callAsync(Boolean, this.db.provider.getDocument(this));
	}

	/**
	 * Get the optional data of this document.
	 * @return Document's data, or `null` if the document doesn't exist (possibly promised).
	 */
	get value(): OptionalEntity<T> | PromiseLike<OptionalEntity<T>> {
		return this.db.provider.getDocument(this);
	}

	/**
	 * Get the data of this document.
	 * - Useful for destructuring, e.g. `{ name, title } = await documentThatMustExist.asyncData`
	 *
	 * @return Document's data (possibly promised).
	 * @throws RequiredError if the document does not exist.
	 */
	get data(): Entity<T> | PromiseLike<Entity<T>> {
		return callAsync(getDocumentData, this.db.provider.getDocument(this), this);
	}

	/**
	 * Subscribe to the result of this document (indefinitely).
	 * - `next()` is called once with the initial result, and again any time the result changes.
	 *
	 * @param next Observer with `next`, `error`, or `complete` methods or a `next()` dispatcher.
	 * @return Function that ends the subscription.
	 */
	subscribe(next: PartialObserver<OptionalEntity<T>> | Dispatch<[OptionalEntity<T>]>): Unsubscribe {
		return this.db.provider.subscribeDocument(this, typeof next === "function" ? { next } : next);
	}

	/** Set the complete data of this document. */
	set(data: T): void | PromiseLike<void> {
		return this.db.provider.setDocument(this, data);
	}

	/** Update this document. */
	update(updates: DataUpdate<T> | PropUpdates<T>): void | PromiseLike<void> {
		return this.db.provider.updateDocument(this, updates instanceof DataUpdate ? updates : new DataUpdate(updates));
	}

	/** Delete this document. */
	delete(): void | PromiseLike<void> {
		return this.db.provider.deleteDocument(this);
	}

	// Implement toString()
	toString(): string {
		return `${this.collection}/${this.id}`;
	}
}

/** Get the data for a document from a result for that document. */
export function getDocumentData<T extends Data>(entity: OptionalEntity<T>, ref: DocumentReference<T>): Entity<T> {
	if (entity) return entity;
	throw new RequiredError(`Document "${ref}" does not exist`);
}

/** Get the data for a document from a set of queried entities. */
export function getQueryFirstData<T extends Data>(entities: Entities<T>, ref: QueryReference<T>): Entity<T> {
	const entity = getQueryFirstValue(entities);
	if (entity) return entity;
	throw new RequiredError(`Query "${ref}" has no documents`);
}

/** Get the data for a document from a set of queried entities. */
export function getQueryLastData<T extends Data>(entities: Entities<T>, ref: QueryReference<T>): Entity<T> {
	const entity = getQueryLastValue(entities);
	if (entity) return entity;
	throw new RequiredError(`Query "${ref}" has no documents`);
}

/** Get the optional data for a document from a set of queried entities. */
export function getQueryFirstValue<T extends Data>(entities: Entities<T>): OptionalEntity<T> {
	return getFirstItem(entities) || null;
}

/** Get the optional data for a document from a set of queried entities. */
export function getQueryLastValue<T extends Data>(entities: Entities<T>): OptionalEntity<T> {
	return getLastItem(entities) || null;
}

/** Are two database references equal? */
export const isSameReference = (left: Reference, right: Reference): boolean => left === right || left.toString() === right.toString();
