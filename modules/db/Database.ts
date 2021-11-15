import {
	EmptyDispatcher,
	countItems,
	createObserver,
	Data,
	Datas,
	Dispatcher,
	Entry,
	getFirstProp,
	getLastProp,
	ImmutableArray,
	isAsync,
	Observable,
	Observer,
	Result,
	Results,
	throwAsync,
	Unsubscriber,
	Validator,
	Validators,
	isTransformer,
	Transformer,
	Transformers,
} from "../util/index.js";
import { ObjectTransform } from "../transform/index.js";
import type { Filters, Slice, Sorts } from "../query/index.js";
import type { Provider } from "../provider/Provider.js";
import { Model, ModelQuery, ModelDocument } from "./Model.js";
import { DocumentRequiredError } from "./errors.js";

/**
 * Combines a database model and a provider.
 *
 * @param documents Set of loci describing named documents at the root level of the database.
 * @param collections Set of loci describing collections at the root level of the database.
 * @param provider Provider that allows data to be read/written.
 */
export class Database<D extends Datas = Datas> extends Model<D> {
	readonly provider: Provider;
	constructor(schemas: Validators<D>, provider: Provider) {
		super(schemas);
		this.provider = provider;
	}

	// Override to return `DatabaseQuery` instead of `ModelQuery`
	override query<C extends keyof D & string>(collection: C, filters?: Filters<D[C]>, sorts?: Sorts<D[C]>, slice?: Slice<D[C]>): DatabaseQuery<D[C]> {
		return new DatabaseQuery(this.provider, this.validators[collection], collection, filters, sorts, slice);
	}

	// Override to return `DatabaseDocument` instead of `ModelDocument
	override doc<C extends keyof D & string>(collection: C, id: string): DatabaseDocument<D[C]> {
		return new DatabaseDocument(this.provider, this.validators[collection], collection, id);
	}
}

/** A documents reference within a specific database. */
export class DatabaseQuery<T extends Data = Data> extends ModelQuery<T> implements Observable<Results<T>> {
	readonly provider: Provider;
	constructor(provider: Provider, schema: Validator<T>, collection: string, filters?: Filters<T>, sorts?: Sorts<T>, slice?: Slice<T>) {
		super(schema, collection, filters, sorts, slice);
		this.provider = provider;
	}

	// Override to return `DatabaseDocument` instead of `ModelDocument
	override doc(id: string): DatabaseDocument<T> {
		return new DatabaseDocument(this.provider, this.validator, this.collection, id);
	}

	/**
	 * Create a new document with a random ID.
	 * - Created document is guaranteed to have a unique ID.
	 *
	 * @param data Complete data to set the document to.
	 * @return String ID for the created document (possibly promised).
	 */
	add(data: T): string | Promise<string> {
		return this.provider.add(this, data);
	}

	/**
	 * Get the set of results matching the current query.
	 *
	 * @return Set of results in `id: data` format (possibly promised).
	 */
	get(): Results<T> | Promise<Results<T>> {
		return this.provider.getQuery(this);
	}

	/**
	 * Get the value of this document.
	 *
	 * @return Set of results in `id: data` format (possibly promised).
	 */
	get value(): Results<T> | Promise<Results<T>> {
		return this.get();
	}

	/**
	 * Count the number of results of this set of documents.
	 *
	 * @return Number of documents in the collection (possibly promised).
	 */
	get count(): number | Promise<number> {
		const results = this.provider.getQuery(this);
		return isAsync(results) ? results.then(countItems) : countItems(results);
	}

	/**
	 * Get an array of string IDs for this set of documents.
	 *
	 * @return Array of strings representing the documents in the current collection (possibly promised).
	 */
	get ids(): ImmutableArray<string> | Promise<ImmutableArray<string>> {
		const results = this.provider.getQuery(this);
		return isAsync(results) ? results.then(Object.keys) : Object.keys(results);
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
	subscribe(next: Observer<Results<T>> | Dispatcher<Results<T>>, error?: Dispatcher<Error | unknown>, complete?: EmptyDispatcher): Unsubscriber {
		return this.provider.subscribeQuery(this, createObserver(next, error, complete));
	}

	/**
	 * Get an entry for the first result in this set of documents.
	 *
	 * @return Entry in `[id, data]` format for the last document, or `undefined` if there are no matching documents (possibly promised).
	 */
	get first(): Entry<T> | undefined | Promise<Entry<T> | undefined> {
		const results = this.limit(1).get();
		if (isAsync(results)) return results.then(getFirstProp);
		return getFirstProp(results);
	}

	/**
	 * Get an entry for the last result in this set of documents.
	 *
	 * @return Entry in `[id, data]` format for the first document, or `undefined` if there are no matching documents (possibly promised).
	 */
	get last(): Entry<T> | undefined | Promise<Entry<T> | undefined> {
		const results = this.limit(1).get();
		if (isAsync(results)) return results.then(getLastProp);
		return getLastProp(results);
	}

	/**
	 * Set all matching documents to the same exact value.
	 *
	 * @param data Complete data to set the document to.
	 * @return Nothing (possibly promised).
	 */
	set(data: T): void | Promise<void> {
		return this.provider.writeQuery(this, data);
	}

	/**
	 * Update all matching documents with the same partial value.
	 *
	 * @param transformers `Transformer` instance or set of transforms to apply to every matching document.
	 * - Not all transforms may be supported by all providers.
	 *
	 * @return Nothing (possibly promised).
	 */
	update(transformers: Transformer<T> | Transformers<T>): void | Promise<void> {
		return this.provider.writeQuery<T>(this, isTransformer(transformers) ? transformers : new ObjectTransform(transformers));
	}

	/**
	 * Delete all matching documents.
	 *
	 * @return Nothing (possibly promised).
	 */
	delete(): void | Promise<void> {
		return this.provider.writeQuery(this, undefined);
	}

	// Implement iterator protocol (only works if get is synchronous, otherwise `Promise` is thrown).
	*[Symbol.iterator](): Generator<Entry<T>, void, undefined> {
		yield* Object.entries(throwAsync(this.get()));
	}

	// Implement async iterator protocol.
	async *[Symbol.asyncIterator](): AsyncGenerator<Entry<T>, void, undefined> {
		yield* Object.entries(await this.get());
	}
}

/** A document reference within a specific database. */
export class DatabaseDocument<T extends Data = Data> extends ModelDocument<T> implements Observable<Result<T>> {
	readonly provider: Provider;
	constructor(provider: Provider, schema: Validator<T>, collection: string, id: string) {
		super(schema, collection, id);
		this.provider = provider;
	}

	// Override to return `DatabaseQuery` instead of `ModelQuery`
	override query(filters?: Filters<T>, sorts?: Sorts<T>, slice?: Slice<T>): DatabaseQuery<T> {
		return new DatabaseQuery(this.provider, this.validator, this.collection, filters, sorts, slice);
	}

	/**
	 * Get the result of this document.
	 * - Alternate syntax for `this.result`
	 * - If `options.required = true` then throws `DocumentRequiredError` if the document doesn't exist.
	 *
	 * @return Document's data, or `undefined` if it doesn't exist.
	 */
	get(): Result<T> | Promise<Result<T>> {
		return this.provider.get(this);
	}

	/**
	 * Does this document exist?
	 *
	 * @return Document's data, or `undefined` if the document doesn't exist (possibly promised).
	 */
	get exists(): boolean | Promise<boolean> {
		const result = this.get();
		return isAsync(result) ? result.then(Boolean) : !!result;
	}

	/**
	 * Get the result of this document.
	 *
	 * @return Document's data, or `undefined` if the document doesn't exist (possibly promised).
	 */
	get result(): Result<T> | Promise<Result<T>> {
		return this.get();
	}

	/**
	 * Get the data of this document.
	 * - Useful for destructuring, e.g. `{ name, title } = await documentThatMustExist.asyncData`
	 *
	 * @return Document's data (possibly promised).
	 * @throws RequiredError if the document's result was undefined.
	 */
	get data(): T | Promise<T> {
		const result = this.get();
		if (isAsync(result))
			return result.then(r => {
				if (!r) throw new DocumentRequiredError(this);
				return r;
			});
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
	subscribe(next: Observer<Result<T>> | Dispatcher<Result<T>>, error?: Dispatcher<Error | unknown>, complete?: EmptyDispatcher): Unsubscriber {
		return this.provider.subscribe<T>(this, createObserver(next, error, complete));
	}

	/**
	 * Set the complete data of this document.
	 *
	 * @param data Complete data to set the document to.
	 *
	 * @return Nothing (possibly promised).
	 */
	set(data: T): void | Promise<void> {
		return this.provider.write(this, data);
	}

	/**
	 * Update this document with partial data.
	 * - If the document exists, merge the partial data into it.
	 * - If the document doesn't exist, throw an error.
	 *
	 * @param transformers `Transform` instance or set of transforms to apply to the existing document.
	 * - Not all transforms may be supported by all providers.
	 *
	 * @return Nothing (possibly promised).
	 * @throws Error If the document does not exist (ideally a `RequiredError` but may be provider-specific).
	 */
	update(transformers: Transformer<T> | Transformers<T>): void | Promise<void> {
		return this.provider.write(this, isTransformer(transformers) ? transformers : new ObjectTransform(transformers));
	}

	/**
	 * Delete this document.
	 * - Will not throw an error if the document doesn't exist.
	 *
	 * @return Nothing (possibly promised).
	 */
	delete(): void | Promise<void> {
		return this.provider.write(this, undefined);
	}
}
