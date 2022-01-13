import {
	callAsync,
	Entry,
	getFirstItem,
	Observable,
	Observer,
	Result,
	throwAsync,
	Unsubscriber,
	Results,
	Validatable,
	validate,
	Validator,
	Key,
	getMap,
	countItems,
	Data,
	MutableObject,
	Entries,
	Datas,
	Validators,
	ValidatorType,
	Dispatcher,
	hasItems,
	ResultsObserver,
} from "../util/index.js";
import { DataUpdate, PropUpdates, Update } from "../update/index.js";
import type { Provider } from "../provider/Provider.js";
import { Feedback, InvalidFeedback } from "../feedback/index.js";
import { Filters, Sorts, Query, EqualFilter } from "../query/index.js";
import { DocumentRequiredError, DocumentValidationError, QueryRequiredError, QueryValidationError } from "./errors.js";

/**
 * Combines a database model and a provider.
 *
 * @param documents Set of loci describing named documents at the root level of the database.
 * @param collections Set of loci describing collections at the root level of the database.
 * @param provider Provider that allows data to be read/written.
 */
// Note: typing this with `Validators` rather than raw `Datas` works better for inference — type for props in each collection tends to get lost.
export class Database<V extends Validators<Datas> = Validators<Datas>> {
	readonly validators: V;
	readonly provider: Provider;
	constructor(validators: V, provider: Provider) {
		this.validators = validators;
		this.provider = provider;
	}

	/** Create a query on a collection in this model. */
	query<K extends Key<V>>(collection: K, filters?: Filters<ValidatorType<V[K]>>, sorts?: Sorts<ValidatorType<V[K]>>, limit?: number | null): DatabaseQuery<ValidatorType<V[K]>> {
		return new DatabaseQuery(this, this.validators[collection] as Validator<ValidatorType<V[K]>>, collection, filters, sorts, limit);
	}

	/** Reference a document in a collection in this model. */
	doc<K extends Key<V>>(collection: K, id: string): DatabaseDocument<ValidatorType<V[K]>> {
		return new DatabaseDocument(this, this.validators[collection] as Validator<ValidatorType<V[K]>>, collection, id);
	}

	/**
	 * Create a new document with a random ID.
	 * - Created document is guaranteed to have a unique ID.
	 *
	 * @param collection Name of the collection to add the document to.
	 * @param data Complete data to set the document to.
	 * @return String ID for the created document (possibly promised).
	 */
	add<K extends Key<V>>(collection: K, data: ValidatorType<V[K]>): string | PromiseLike<string> {
		return this.query(collection).add(data);
	}
}

/** A documents reference within a specific database. */
export class DatabaseQuery<T extends Data = Data> extends Query<T> implements Observable<Results<T>>, Validatable<Entries<T>>, Iterable<Entry<T>> {
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
	doc(id: string): DatabaseDocument<T> {
		return new DatabaseDocument(this.db, this.validator, this.collection, id);
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
	update(updates: Update<T> | PropUpdates<T>): number | PromiseLike<number> {
		return this.db.provider.updateQuery(this, updates instanceof Update ? updates : new DataUpdate(updates));
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

/** Get the data for a document from a result for that document. */
export function getQueryData<T extends Data>(entries: Entries<T>, ref: DatabaseQuery<T>): DocumentData<T> {
	const first = getFirstItem(entries);
	if (first) return getDocumentData(first[1], ref.doc(first[0]));
	throw new QueryRequiredError(ref);
}

/** Get the data for a document from a result for that document. */
export function getQueryResult<T extends Data>(entries: Entries<T>, ref: DatabaseQuery<T>): DocumentResult<T> {
	const first = getFirstItem(entries);
	if (first) return getDocumentData(first[1], ref.doc(first[0]));
	throw new QueryRequiredError(ref);
}

/** A document reference within a specific database. */
export class DatabaseDocument<T extends Data = Data> implements Observable<Result<T>>, Validatable<T> {
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
	query(filters?: Filters<T>, sorts?: Sorts<T>, limit?: number | null): DatabaseQuery<T> {
		return new DatabaseQuery(this.db, this.validator, this.collection, filters, sorts, limit);
	}

	/** Get an 'optional' reference to this document (uses a `ModelQuery` with an `id` filter). */
	get optional(): DatabaseQuery<T> {
		return new DatabaseQuery(this.db, this.validator, this.collection, new Filters(new EqualFilter("id", this.id)));
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
	subscribe(next: Observer<Result<T>> | Dispatcher<[Result<T>]>): Unsubscriber {
		return this.db.provider.subscribe(this, typeof next === "function" ? { next } : next);
	}

	/** Set the complete data of this document. */
	set(data: T): void | PromiseLike<void> {
		return this.db.provider.set(this, data);
	}

	/** Update this document. */
	update(updates: Update<T> | PropUpdates<T>): void | PromiseLike<void> {
		return this.db.provider.update(this, updates instanceof Update ? updates : new DataUpdate(updates));
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

/** Database data embeds the corresponding `Document` instance and string ID into the data. */
export type DocumentData<T extends Data> = T & { _id: string; _doc: DatabaseDocument<T> };

/** Get the data for a document from a result for that document. */
export function getDocumentData<T extends Data>(result: Result<T>, ref: DatabaseDocument<T>): DocumentData<T> {
	if (result) return { ...result, _id: ref.id, _doc: ref };
	throw new DocumentRequiredError(ref);
}

/** Database result embeds the corresponding `Document` instance and string ID into the result. */
export type DocumentResult<T extends Data> = DocumentData<T> | null;

/** Get the data for a document from a result for that document. */
export function getDocumentResult<T extends Data>(result: Result<T>, ref: DatabaseDocument<T>): DocumentResult<T> {
	return result ? getDocumentData(result, ref) : null;
}
