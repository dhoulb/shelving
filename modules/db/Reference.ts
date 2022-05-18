import { callAsync, Entry, Observable, Observer, Result, throwAsync, Unsubscriber, Results, Validatable, validate, Validator, getMap, countItems, Data, MutableObject, Entries, Dispatcher, hasItems, ResultsObserver } from "../util/index.js";
import { DataUpdate, PropUpdates } from "../update/index.js";
import { Feedback, InvalidFeedback } from "../feedback/index.js";
import { Filters, Sorts, Query, Filter, FilterProps, SortKeys } from "../query/index.js";
import { DocumentValidationError, QueryValidationError } from "./errors.js";
import { DocumentData, DocumentResult, DocumentResultObserver, getDocumentData, getDocumentResult, getQueryData, getQueryResult } from "./helpers.js";
import type { Database } from "./Database.js";

/** A refence to a location in a database. */
export interface Reference {
	readonly db: Database;
	toString(): string;
}

/** A query reference within a specific database. */
export class QueryReference<T extends Data = Data> extends Query<T> implements Observable<Results<T>>, Validatable<Entries<T>>, Iterable<Entry<T>>, Reference {
	readonly db: Database;
	readonly validator: Validator<T>;
	readonly collection: string;
	constructor(db: Database, validator: Validator<T>, collection: string, filters?: Filters<T>, sorts?: Sorts<T>, limit?: number | null) {
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
	 * Get an iterable that yields the results of this entry.
	 * @return Map containing the results.
	 */
	get entries(): Entries<T> | PromiseLike<Entries<T>> {
		return this.db.provider.getQuery(this);
	}

	/**
	 * Get an iterable that yields the results of this entry.
	 * @return Map containing the results.
	 */
	get results(): Results<T> | PromiseLike<Results<T>> {
		return callAsync<Entries<T>, Results<T>>(getMap, this.db.provider.getQuery(this));
	}

	/**
	 * Count the number of results of this set of documents.
	 * @return Number of documents matching the query (possibly promised).
	 */
	get count(): number | PromiseLike<number> {
		return callAsync(countItems, this.entries);
	}

	/**
	 * Does at least one document exist for this query?
	 * @return `true` if a document exists or `false` otherwise (possibly promised).
	 */
	get exists(): boolean | PromiseLike<boolean> {
		return callAsync(hasItems, this.db.provider.getQuery(this.max(1)));
	}

	/**
	 * Get an entry for the first document matched by this query or `undefined` if this query has no results.
	 *
	 * @return Entry in `[id, data]` format for the first document.
	 * @throws RequiredError if there were no results for this query.
	 */
	get result(): DocumentResult<T> | PromiseLike<DocumentResult<T>> {
		return callAsync(getQueryResult, this.db.provider.getQuery(this.max(1)), this);
	}

	/**
	 * Get an entry for the first document matched by this query.
	 *
	 * @return Entry in `[id, data]` format for the first document.
	 * @throws RequiredError if there were no results for this query.
	 */
	get data(): DocumentData<T> | PromiseLike<DocumentData<T>> {
		return callAsync(getQueryData, this.db.provider.getQuery(this.max(1)), this);
	}

	/**
	 * Subscribe to all matching documents.
	 * - `next()` is called once with the initial results, and again any time the results change.
	 *
	 * @param next Observer with `next`, `error`, or `complete` methods or a `next()` dispatcher.
	 * @return Function that ends the subscription.
	 */
	subscribe(next: Observer<Results<T>> | Dispatcher<[Results<T>]>): Unsubscriber {
		return this.db.provider.subscribeQuery(this, new ResultsObserver(typeof next === "function" ? { next } : next));
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

	/** Iterate over the resuls (will throw `Promise` if the results are asynchronous). */
	[Symbol.iterator](): Iterator<Entry<T>, void> {
		return throwAsync(this.entries)[Symbol.iterator]();
	}

	/** Validate a set of results for this query reference. */
	*validate(unsafeEntries: Entries): Entries<T> {
		let invalid = false;
		const details: MutableObject<Feedback> = {};
		for (const [id, unsafeValue] of unsafeEntries) {
			try {
				yield [id, validate(unsafeValue, this.validator)];
			} catch (thrown) {
				if (!(thrown instanceof Feedback)) throw thrown;
				invalid = true;
				details[id] = thrown;
			}
		}
		if (invalid) throw new QueryValidationError(this, new InvalidFeedback("Invalid results", details));
	}

	// Override to include the collection name.
	override toString(): string {
		return `${this.collection}?${super.toString()}`;
	}
}

/** A document reference within a specific database. */
export class DocumentReference<T extends Data = Data> implements Observable<Result<T>>, Validatable<T>, Reference {
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
	query(filters?: FilterProps<T>, sorts?: SortKeys<T>, limit?: number | null): QueryReference<T> {
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
	 * @return Document's data, or `undefined` if the document doesn't exist (possibly promised).
	 */
	get result(): DocumentResult<T> | PromiseLike<DocumentResult<T>> {
		return callAsync(getDocumentResult, this.db.provider.get(this), this);
	}

	/**
	 * Get the data of this document.
	 * - Useful for destructuring, e.g. `{ name, title } = await documentThatMustExist.asyncData`
	 *
	 * @return Document's data (possibly promised).
	 * @throws RequiredError if the document's result was undefined.
	 */
	get data(): DocumentData<T> | PromiseLike<DocumentData<T>> {
		return callAsync(getDocumentData, this.db.provider.get(this), this);
	}

	/**
	 * Subscribe to the result of this document (indefinitely).
	 * - `next()` is called once with the initial result, and again any time the result changes.
	 *
	 * @param next Observer with `next`, `error`, or `complete` methods or a `next()` dispatcher.
	 * @return Function that ends the subscription.
	 */
	subscribe(next: Observer<DocumentResult<T>> | Dispatcher<[DocumentResult<T>]>): Unsubscriber {
		return this.db.provider.subscribe(this, new DocumentResultObserver(typeof next === "function" ? { next } : next, this));
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

	/** Validate data for this query reference. */
	validate(unsafeData: Data): T {
		try {
			return validate(unsafeData, this.validator);
		} catch (thrown) {
			throw thrown instanceof Feedback ? new DocumentValidationError(this, thrown) : thrown;
		}
	}

	// Implement toString()
	toString(): string {
		return `${this.collection}/${this.id}`;
	}
}
