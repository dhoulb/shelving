import {
	deriveAsync,
	createObserver,
	Dispatcher,
	Entry,
	getFirstItem,
	isAsync,
	Observable,
	Observer,
	Result,
	throwAsync,
	Unsubscriber,
	Datas,
	Results,
	Validatable,
	validate,
	Validator,
	Validators,
	Key,
	toMap,
	countItems,
	Data,
	MutableObject,
	ImmutableMap,
} from "../util/index.js";
import { DataTransform, Transform, Transforms } from "../transform/index.js";
import type { Provider } from "../provider/Provider.js";
import { Feedback, InvalidFeedback } from "../feedback/index.js";
import { Filters, Sorts, Query, EqualFilter } from "../query/index.js";
import { DocumentRequiredError, DocumentValidationError, QueryValidationError } from "./errors.js";

/**
 * Combines a database model and a provider.
 *
 * @param documents Set of loci describing named documents at the root level of the database.
 * @param collections Set of loci describing collections at the root level of the database.
 * @param provider Provider that allows data to be read/written.
 */
export class Database<D extends Datas> {
	readonly validators: Validators<D>;
	readonly provider: Provider<D>;
	constructor(validators: Validators<D>, provider: Provider<D>) {
		this.validators = validators;
		this.provider = provider;
	}

	/** Create a query on a collection in this model. */
	query<C extends Key<D>>(collection: C, filters?: Filters<D[C]>, sorts?: Sorts<D[C]>, limit?: number | null): DatabaseQuery<D, C> {
		return new DatabaseQuery(this, collection, filters, sorts, limit);
	}

	/** Reference a document in a collection in this model. */
	doc<C extends Key<D>>(collection: C, id: string): DatabaseDocument<D, C> {
		return new DatabaseDocument(this, collection, id);
	}
}

/** A documents reference within a specific database. */
export class DatabaseQuery<D extends Datas, C extends Key<D>>
	extends Query<D[C]>
	implements Observable<Results<D[C]>>, Validatable<Results<D[C]>>, Iterable<Entry<D[C]>>
{
	readonly db: Database<D>;
	readonly validator: Validator<D[C]>;
	readonly collection: C;
	constructor(db: Database<D>, collection: C, filters?: Filters<D[C]>, sorts?: Sorts<D[C]>, limit?: number | null) {
		super(filters, sorts, limit);
		this.db = db;
		this.validator = db.validators[collection];
		this.collection = collection;
	}

	/** Reference a document in this query's collection. */
	doc(id: string): DatabaseDocument<D, C> {
		return new DatabaseDocument(this.db, this.collection, id);
	}

	/**
	 * Create a new document with a random ID.
	 * - Created document is guaranteed to have a unique ID.
	 *
	 * @param data Complete data to set the document to.
	 * @return String ID for the created document (possibly promised).
	 */
	add(data: D[C]): string | Promise<string> {
		return this.db.provider.add(this, data);
	}

	/**
	 * Get an iterable that yields the results of this entry.
	 * @return Map containing the results.
	 */
	get results(): Results<D[C]> | Promise<Results<D[C]>> {
		return this.db.provider.getQuery(this);
	}

	/**
	 * Read the results of this query into a map.
	 * @return Set of results in `id: data` format (possibly promised).
	 */
	get map(): ImmutableMap<D[C]> | Promise<ImmutableMap<D[C]>> {
		return deriveAsync<Results<D[C]>, ImmutableMap<D[C]>>(this.db.provider.getQuery(this), toMap);
	}

	/**
	 * Count the number of results of this set of documents.
	 * @return Number of documents in the collection (possibly promised).
	 */
	get count(): number | Promise<number> {
		return deriveAsync(this.db.provider.getQuery(this), countItems);
	}

	/**
	 * Subscribe to all matching documents.
	 * - `next()` is called once with the initial results, and again any time the results change.
	 *
	 * @param observer Observer with `next`, `error`, or `complete` methods that the document results are reported back to.
	 * @param next Callback that is called once initially and again whenever the results change.
	 * @param error Callback that is called if an error occurs.
	 * @param complete Callback that is called when the subscription is done.
	 *
	 * @return Function that ends the subscription.
	 */
	subscribe(next: Observer<Results<D[C]>> | Dispatcher<Results<D[C]>>, error?: Dispatcher<Error | unknown>, complete?: Dispatcher<void>): Unsubscriber {
		return this.db.provider.subscribeQuery(this, createObserver(next, error, complete));
	}

	/**
	 * Get an entry for the first document matching this query.
	 * @return Entry in `[id, data]` format for the first document, or `undefined` if there are no matching documents (possibly promised).
	 */
	get first(): Entry<D[C]> | undefined | Promise<Entry<D[C]> | undefined> {
		return deriveAsync(this.max(1).results, getFirstItem);
	}

	/**
	 * Set all matching documents to the same exact value.
	 *
	 * @param data Complete data to set the document to.
	 * @return Nothing (possibly promised).
	 */
	set(data: D[C]): void | Promise<void> {
		return this.write(data);
	}

	/**
	 * Update all matching documents with the same partial value.
	 *
	 * @param transform `Transform` instance or set of transforms to apply to every matching document.
	 * - Not all transforms may be supported by all providers.
	 *
	 * @return Nothing (possibly promised).
	 */
	update(transform: Transform<D[C]> | Transforms<D[C]>): void | Promise<void> {
		return this.write(transform instanceof Transform ? transform : new DataTransform(transform));
	}

	/**
	 * Delete all matching documents.
	 * @return Nothing (possibly promised).
	 */
	delete(): void | Promise<void> {
		return this.write(undefined);
	}

	/**
	 * Combine `set()`, `update()`, `delete()` into a single method.
	 * @return Nothing (possibly promised).
	 */
	write(value: Result<D[C]> | Transform<D[C]>): void | Promise<void> {
		return this.db.provider.writeQuery(this, value);
	}

	/** Iterate over the resuls (will throw `Promise` if the results are asynchronous). */
	[Symbol.iterator](): Iterator<Entry<D[C]>, void> {
		return throwAsync(this.results)[Symbol.iterator]();
	}

	/** Validate a set of results for this query reference. */
	*validate(unsafeEntries: Results): Results<D[C]> {
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
export class DatabaseDocument<D extends Datas, C extends Key<D>> implements Observable<Result<D[C]>>, Validatable<D[C]> {
	readonly db: Database<D>;
	readonly validator: Validator<D[C]>;
	readonly collection: C;
	readonly id: string;
	constructor(db: Database<D>, collection: C, id: string) {
		this.db = db;
		this.validator = db.validators[collection];
		this.collection = collection;
		this.id = id;
	}

	/** Create a query on this document's collection. */
	query(filters?: Filters<D[C]>, sorts?: Sorts<D[C]>, limit?: number | null): DatabaseQuery<D, C> {
		return new DatabaseQuery(this.db, this.collection, filters, sorts, limit);
	}

	/** Get an 'optional' reference to this document (uses a `ModelQuery` with an `id` filter). */
	get optional(): DatabaseQuery<D, C> {
		return new DatabaseQuery(this.db, this.collection, new Filters(new EqualFilter("id", this.id)));
	}

	/**
	 * Does this document exist?
	 *
	 * @return Document's data, or `undefined` if the document doesn't exist (possibly promised).
	 */
	get exists(): boolean | Promise<boolean> {
		const result = this.db.provider.get(this);
		return isAsync(result) ? result.then(Boolean) : !!result;
	}

	/**
	 * Get the result of this document.
	 *
	 * @return Document's data, or `undefined` if the document doesn't exist (possibly promised).
	 */
	get result(): Result<D[C]> | Promise<Result<D[C]>> {
		return this.db.provider.get(this);
	}

	/**
	 * Get the data of this document.
	 * - Useful for destructuring, e.g. `{ name, title } = await documentThatMustExist.asyncData`
	 *
	 * @return Document's data (possibly promised).
	 * @throws RequiredError if the document's result was undefined.
	 */
	get data(): D[C] | Promise<D[C]> {
		const result = this.db.provider.get(this);
		if (isAsync(result)) return _awaitRequired(this, result);
		if (!result) throw new DocumentRequiredError(this);
		return result;
	}

	/**
	 * Subscribe to the result of this document (indefinitely).
	 * - `next()` is called once with the initial result, and again any time the result changes.
	 *
	 * @param observer Observer with `next`, `error`, or `complete` methods.
	 * @param next Callback that is called once initially and again whenever the result changes.
	 * @param error Callback that is called if an error occurs.
	 * @param complete Callback that is called when the subscription is done.
	 *
	 * @return Function that ends the subscription.
	 */
	subscribe(next: Observer<Result<D[C]>> | Dispatcher<Result<D[C]>>, error?: Dispatcher<Error | unknown>, complete?: Dispatcher<void>): Unsubscriber {
		return this.db.provider.subscribe(this, createObserver(next, error, complete));
	}

	/**
	 * Set the complete data of this document.
	 *
	 * @param data Complete data to set the document to.
	 *
	 * @return Nothing (possibly promised).
	 */
	set(data: D[C]): void | Promise<void> {
		return this.write(data);
	}

	/**
	 * Update this document with partial data.
	 * - If the document exists, merge the partial data into it.
	 * - If the document doesn't exist, throw an error.
	 *
	 * @param transforms `Transform` instance or set of transforms to apply to the existing document.
	 * - Not all transforms may be supported by all providers.
	 *
	 * @return Nothing (possibly promised).
	 * @throws Error If the document does not exist (ideally a `RequiredError` but may be provider-specific).
	 */
	update(transforms: Transform<D[C]> | Transforms<D[C]>): void | Promise<void> {
		return this.write(transforms instanceof Transform ? transforms : new DataTransform(transforms));
	}

	/**
	 * Delete this document.
	 * - Will not throw an error if the document doesn't exist.
	 *
	 * @return Nothing (possibly promised).
	 */
	delete(): void | Promise<void> {
		return this.write(undefined);
	}

	/**
	 * Combine `set()`, `update()`, `delete()` into a single method.
	 */
	write(value: Result<D[C]> | Transform<D[C]>): void | Promise<void> {
		return this.db.provider.write(this, value);
	}

	/** Validate data for this query reference. */
	validate(unsafeData: Data): D[C] {
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

/** Wait for a result and throw a `DocumentRequiredError` if the document doesn't exist. */
async function _awaitRequired<D extends Datas, C extends Key<D>>(ref: DatabaseDocument<D, C>, asyncResult: Promise<Result<D[C]>>): Promise<D[C]> {
	const result = await asyncResult;
	if (!result) throw new DocumentRequiredError(ref);
	return result;
}
