import type { Data, Result, Entity } from "../util/data.js";
import type { Dispatcher } from "../util/function.js";
import type { SortKeys } from "../query/Sort.js";
import { getArray, ImmutableArray } from "../util/array.js";
import { ArrayObserver, Observable, Observer, Unsubscriber } from "../util/observe.js";
import { Validator } from "../util/validate.js";
import { Query } from "../query/Query.js";
import { Filters } from "../query/Filters.js";
import { Sorts } from "../query/Sorts.js";
import { callAsync } from "../util/async.js";
import { countItems, hasItems } from "../util/iterate.js";
import { DataUpdate, PropUpdates } from "../update/DataUpdate.js";
import { Filter, FilterProps } from "../query/Filter.js";
import { getDocumentData, getQueryData, getQueryResult } from "./util.js";
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
	constructor(db: Database, validator: Validator<T>, collection: string, filters?: Filters<Entity<T>>, sorts?: Sorts<Entity<T>>, limit?: number | null) {
		super(filters, sorts, limit);
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
		return this.db.provider.add(this, data);
	}

	/**
	 * Get an iterable that yields the entities of this query.
	 * @return Map containing the results.
	 */
	get items(): Iterable<Entity<T>> | PromiseLike<Iterable<Entity<T>>> {
		return this.db.provider.getQuery(this);
	}

	/**
	 * Get an array of the results of this .
	 * @return Array containing the entities.
	 */
	get array(): ImmutableArray<Entity<T>> | PromiseLike<ImmutableArray<Entity<T>>> {
		return callAsync<Iterable<Entity<T>>, ImmutableArray<Entity<T>>>(getArray, this.db.provider.getQuery(this));
	}

	/**
	 * Count the number of results of this set of documents.
	 * @return Number of documents matching the query (possibly promised).
	 */
	get count(): number | PromiseLike<number> {
		return callAsync(countItems, this.items);
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
	 *
	 * @return Entry in `[id, data]` format for the first document.
	 * @throws RequiredError if there were no results for this query.
	 */
	get result(): Result<Entity<T>> | PromiseLike<Result<Entity<T>>> {
		return callAsync(getQueryResult, this.db.provider.getQuery(this.max(1)));
	}

	/**
	 * Get the first document matched by this query.
	 *
	 * @return Entry in `[id, data]` format for the first document.
	 * @throws RequiredError if there were no results for this query.
	 */
	get data(): Entity<T> | PromiseLike<Entity<T>> {
		return callAsync(getQueryData, this.db.provider.getQuery(this.max(1)), this);
	}

	/**
	 * Subscribe to all matching documents.
	 * - `next()` is called once with the initial results, and again any time the results change.
	 *
	 * @param next Observer with `next`, `error`, or `complete` methods or a `next()` dispatcher.
	 * @return Function that ends the subscription.
	 */
	subscribe(next: Observer<ImmutableArray<Entity<T>>> | Dispatcher<[ImmutableArray<Entity<T>>]>): Unsubscriber {
		return this.db.provider.subscribeQuery(this, new ArrayObserver(typeof next === "function" ? { next } : next));
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
export class DocumentReference<T extends Data = Data> implements Observable<Result<T>>, Reference {
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
	query(filters?: FilterProps<Entity<T>>, sorts?: SortKeys<Entity<T>>, limit?: number | null): QueryReference<T> {
		return new QueryReference(this.db, this.validator, this.collection, filters && Filters.on(filters), sorts && Sorts.on(sorts), limit);
	}

	/** Get an 'optional' reference to this document (uses a `ModelQuery` with an `id` filter). */
	get optional(): QueryReference<T> {
		return new QueryReference(this.db, this.validator, this.collection, new Filters(new Filter("id", "IS", this.id)));
	}

	/**
	 * Does this document exist?
	 * @return `true` if a document exists or `false` otherwise (possibly promised).
	 */
	get exists(): boolean | PromiseLike<boolean> {
		return callAsync(Boolean, this.db.provider.get(this));
	}

	/**
	 * Get the result of this document.
	 * @return Document's data, or `null` if the document doesn't exist (possibly promised).
	 */
	get result(): Result<Entity<T>> | PromiseLike<Result<Entity<T>>> {
		return this.db.provider.get(this);
	}

	/**
	 * Get the data of this document.
	 * - Useful for destructuring, e.g. `{ name, title } = await documentThatMustExist.asyncData`
	 *
	 * @return Document's data (possibly promised).
	 * @throws RequiredError if the document does not exist.
	 */
	get data(): Entity<T> | PromiseLike<Entity<T>> {
		return callAsync(getDocumentData, this.db.provider.get(this), this);
	}

	/**
	 * Subscribe to the result of this document (indefinitely).
	 * - `next()` is called once with the initial result, and again any time the result changes.
	 *
	 * @param next Observer with `next`, `error`, or `complete` methods or a `next()` dispatcher.
	 * @return Function that ends the subscription.
	 */
	subscribe(next: Observer<Result<Entity<T>>> | Dispatcher<[Result<Entity<T>>]>): Unsubscriber {
		return this.db.provider.subscribe(this, typeof next === "function" ? { next } : next);
	}

	/** Set the complete data of this document. */
	set(data: T): void | PromiseLike<void> {
		return this.db.provider.set(this, data);
	}

	/** Update this document. */
	update(updates: DataUpdate<T> | PropUpdates<T>): void | PromiseLike<void> {
		return this.db.provider.update(this, updates instanceof DataUpdate ? updates : new DataUpdate(updates));
	}

	/** Delete this document. */
	delete(): void | PromiseLike<void> {
		return this.db.provider.delete(this);
	}

	// Implement toString()
	toString(): string {
		return `${this.collection}/${this.id}`;
	}
}
