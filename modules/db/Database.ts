import {
	callAsync,
	Entry,
	getFirstItem,
	Observable,
	Observer,
	Result,
	throwAsync,
	Unsubscriber,
	ResultsMap,
	Validatable,
	validate,
	Validator,
	Key,
	toMap,
	countItems,
	Data,
	MutableObject,
	Results,
	TransformObserver,
	Datas,
	Validators,
	ValidatorType,
	Dispatcher,
} from "../util/index.js";
import { DataTransform, Transform, Transforms } from "../transform/index.js";
import type { Provider } from "../provider/Provider.js";
import { Feedback, InvalidFeedback } from "../feedback/index.js";
import { Filters, Sorts, Query, EqualFilter } from "../query/index.js";
import { DocumentRequiredError, DocumentValidationError, QueryValidationError } from "./errors.js";
import { DocumentWrite, Write } from "./Write.js";

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
	query<K extends Key<V>>(
		collection: K,
		filters?: Filters<ValidatorType<V[K]>>,
		sorts?: Sorts<ValidatorType<V[K]>>,
		limit?: number | null,
	): DataQuery<ValidatorType<V[K]>> {
		return new DataQuery(this.provider, this.validators[collection] as Validator<ValidatorType<V[K]>>, collection, filters, sorts, limit);
	}

	/** Reference a document in a collection in this model. */
	doc<K extends Key<V>>(collection: K, id: string): DataDocument<ValidatorType<V[K]>> {
		return new DataDocument(this.provider, this.validators[collection] as Validator<ValidatorType<V[K]>>, collection, id);
	}

	/** Perform a write on this database. */
	write(write: Write): void | PromiseLike<void> {
		return write.transform(this);
	}
}

/** A documents reference within a specific database. */
export class DataQuery<T extends Data = Data> extends Query<T> implements Observable<Results<T>>, Validatable<Results<T>>, Iterable<Entry<T>> {
	readonly provider: Provider;
	readonly validator: Validator<T>;
	readonly collection: string;
	constructor(provider: Provider, validator: Validator<T>, collection: string, filters?: Filters<T>, sorts?: Sorts<T>, limit?: number | null) {
		super(filters, sorts, limit);
		this.provider = provider;
		this.validator = validator;
		this.collection = collection;
	}

	/** Reference a document in this query's collection. */
	doc(id: string): DataDocument<T> {
		return new DataDocument(this.provider, this.validator, this.collection, id);
	}

	/**
	 * Create a new document with a random ID.
	 * - Created document is guaranteed to have a unique ID.
	 *
	 * @param data Complete data to set the document to.
	 * @return String ID for the created document (possibly promised).
	 */
	add(data: T): string | PromiseLike<string> {
		return this.provider.add(this, data);
	}

	/**
	 * Get an iterable that yields the results of this entry.
	 * @return Map containing the results.
	 */
	get results(): Results<T> | PromiseLike<Results<T>> {
		return this.provider.getQuery(this);
	}

	/**
	 * Get an iterable that yields the results of this entry.
	 * @return Map containing the results.
	 */
	get resultsMap(): ResultsMap<T> | PromiseLike<ResultsMap<T>> {
		return callAsync<Results<T>, ResultsMap<T>>(toMap, this.provider.getQuery(this));
	}

	/**
	 * Count the number of results of this set of documents.
	 * @return Number of documents in the collection (possibly promised).
	 */
	get count(): number | PromiseLike<number> {
		return callAsync(countItems, this.results);
	}

	/**
	 * Get an entry for the first document matching this query.
	 * @return Entry in `[id, data]` format for the first document, or `undefined` if there are no matching documents (possibly promised).
	 */
	get first(): Entry<T> | undefined | PromiseLike<Entry<T> | undefined> {
		return callAsync(getFirstItem, this.max(1).results);
	}

	/**
	 * Subscribe to all matching documents.
	 * - `next()` is called once with the initial results, and again any time the results change.
	 *
	 * @param next Observer with `next`, `error`, or `complete` methods or a `next()` dispatcher.
	 * @return Function that ends the subscription.
	 */
	subscribe(next: Observer<Results<T>> | Dispatcher<[Results<T>]>): Unsubscriber {
		return this.provider.subscribeQuery(this, typeof next === "function" ? { next } : next);
	}

	/**
	 * Subscribe to all matching documents.
	 * - `next()` is called once with the initial results, and again any time the results change.
	 *
	 * @param next Observer with `next`, `error`, or `complete` methods or a `next()` dispatcher.
	 * @return Function that ends the subscription.
	 */
	subscribeMap(next: Observer<ResultsMap<T>> | Dispatcher<[ResultsMap<T>]>): Unsubscriber {
		return this.provider.subscribeQuery(this, new TransformObserver(toMap, typeof next === "function" ? { next } : next));
	}

	/**
	 * Set all matching documents to the same exact value.
	 *
	 * @param data Complete data to set the document to.
	 * @return Nothing (possibly promised).
	 */
	set(data: T): void | PromiseLike<void> {
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
	update(transform: Transform<T> | Transforms<T>): void | PromiseLike<void> {
		return this.write(transform instanceof Transform ? transform : new DataTransform(transform));
	}

	/**
	 * Delete all matching documents.
	 * @return Nothing (possibly promised).
	 */
	delete(): void | PromiseLike<void> {
		return this.write(undefined);
	}

	/**
	 * Combine `set()`, `update()`, `delete()` into a single method.
	 * @return Nothing (possibly promised).
	 */
	write(value: Result<T> | Transform<T>): void | PromiseLike<void> {
		return this.provider.writeQuery(this, value);
	}

	/** Iterate over the resuls (will throw `Promise` if the results are asynchronous). */
	[Symbol.iterator](): Iterator<Entry<T>, void> {
		return throwAsync(this.results)[Symbol.iterator]();
	}

	/** Validate a set of results for this query reference. */
	*validate(unsafeEntries: Results): Results<T> {
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
export class DataDocument<T extends Data = Data> implements Observable<Result<T>>, Validatable<T> {
	readonly provider: Provider;
	readonly validator: Validator<T>;
	readonly collection: string;
	readonly id: string;
	constructor(provider: Provider, validator: Validator<T>, collection: string, id: string) {
		this.provider = provider;
		this.validator = validator;
		this.collection = collection;
		this.id = id;
	}

	/** Create a query on this document's collection. */
	query(filters?: Filters<T>, sorts?: Sorts<T>, limit?: number | null): DataQuery<T> {
		return new DataQuery(this.provider, this.validator, this.collection, filters, sorts, limit);
	}

	/** Get an 'optional' reference to this document (uses a `ModelQuery` with an `id` filter). */
	get optional(): DataQuery<T> {
		return new DataQuery(this.provider, this.validator, this.collection, new Filters(new EqualFilter("id", this.id)));
	}

	/**
	 * Does this document exist?
	 *
	 * @return Document's data, or `undefined` if the document doesn't exist (possibly promised).
	 */
	get exists(): boolean | PromiseLike<boolean> {
		return callAsync(Boolean, this.provider.get(this));
	}

	/**
	 * Get the result of this document.
	 *
	 * @return Document's data, or `undefined` if the document doesn't exist (possibly promised).
	 */
	get result(): Result<T> | PromiseLike<Result<T>> {
		return this.provider.get(this);
	}

	/**
	 * Get the data of this document.
	 * - Useful for destructuring, e.g. `{ name, title } = await documentThatMustExist.asyncData`
	 *
	 * @return Document's data (possibly promised).
	 * @throws RequiredError if the document's result was undefined.
	 */
	get data(): T | PromiseLike<T> {
		return callAsync(getDocumentData, this.provider.get(this), this);
	}

	/**
	 * Subscribe to the result of this document (indefinitely).
	 * - `next()` is called once with the initial result, and again any time the result changes.
	 *
	 * @param next Observer with `next`, `error`, or `complete` methods or a `next()` dispatcher.
	 * @return Function that ends the subscription.
	 */
	subscribe(next: Observer<Result<T>> | Dispatcher<[Result<T>]>): Unsubscriber {
		return this.provider.subscribe(this, typeof next === "function" ? { next } : next);
	}

	/** Set the complete data of this document. */
	set(data: T): void | PromiseLike<void> {
		return this.write(data);
	}

	/** Update this document. */
	update(transforms: Transform<T> | Transforms<T>): void | PromiseLike<void> {
		return this.write(transforms instanceof Transform ? transforms : new DataTransform(transforms));
	}

	/** Delete this document. */
	delete(): void | PromiseLike<void> {
		return this.write(undefined);
	}

	/** Set, update, or delete this document. */
	write(value: Result<T> | Transform<T>): void | PromiseLike<void> {
		return this.provider.write(this, value);
	}

	/** Represent a write that sets the complete data of this document in a database. */
	setter(data: T): DocumentWrite<T> {
		return this.writer(data);
	}

	/** Represent a write that updates this document in a database. */
	updater(transforms: Transform<T> | Transforms<T>): DocumentWrite<T> {
		return this.writer(transforms instanceof Transform ? transforms : new DataTransform(transforms));
	}

	/** Represent a write that deletes this document in a database. */
	deleter(): DocumentWrite<T> {
		return this.writer(undefined);
	}

	/** Represent a write that sets, updates, or deletes this document in a database. */
	writer(value: Result<T> | Transform<T>): DocumentWrite<T> {
		return new DocumentWrite(this, value);
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

/** Get the data for a document from a result for that document. */
export function getDocumentData<T extends Data>(result: Result<T>, ref: DataDocument<T>): T {
	if (result) return result;
	throw new DocumentRequiredError(ref);
}
