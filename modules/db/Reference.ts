import {
	ArrayType,
	AsyncCatcher,
	AsyncDispatcher,
	AsyncEmptyDispatcher,
	countEntries,
	createObserver,
	Data,
	Entry,
	Feedback,
	getFirstProp,
	getLastProp,
	ImmutableArray,
	isAsync,
	Observable,
	Observer,
	Result,
	Results,
	throwAsync,
	Transforms,
	Unsubscriber,
	Validator,
} from "../util/index.js";
import { Query, Queryable } from "../query/index.js";
import { ReferenceValidationError, ReferenceRequiredError } from "./errors.js";
import type { Provider } from "./Provider.js";

/**
 * Reference: a path in a database
 * - This class is a shared base for both `Document` and `Documents`
 */
export class Reference<T extends Data = Data> implements Validator<T> {
	readonly provider: Provider;
	readonly schema: Validator<T>;
	readonly path: string;

	constructor(provider: Provider, schema: Validator<T>, path: string) {
		this.provider = provider;
		this.schema = schema;
		this.path = path;
	}

	// Implement `Validator`
	validate(data: unknown): T {
		const schema = this.schema;
		try {
			return schema.validate(data);
		} catch (thrown: unknown) {
			throw thrown instanceof Feedback ? new ReferenceValidationError(this, thrown) : thrown;
		}
	}

	// Implement `toString()`
	toString(): string {
		return this.path;
	}
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const EMPTY_QUERY = new Query<any>();

/**
 * Documents reference: allows reading from / writing to a list of documents using a provider, optionally with query filtering and sorting.
 */
export class Documents<T extends Data = Data> extends Reference<T> implements Queryable<T>, Observable<Results<T>> {
	readonly collection: string;
	readonly query: Query<T>;
	constructor(provider: Provider, schema: Validator<T>, collection: string, query: Query<T> = EMPTY_QUERY) {
		super(provider, schema, collection);
		this.collection = collection;
		this.query = query;
	}

	/**
	 * Get a `Document` instance for a document.
	 *
	 * @param id Document ID, e.g. `fido`
	 * @example `db.docs("puppies").doc("fido").get()`
	 */
	doc(id: string): Document<T> {
		return new Document(this.provider, this.schema, this.collection, id);
	}

	/**
	 * Create a new document with a random ID.
	 * - Created document is guaranteed to have a unique ID.
	 *
	 * @param data Complete data to set the document to.
	 * @return String ID for the created document (possibly promised).
	 */
	add(data: T): string | Promise<string> {
		return this.provider.addDocument(this, data);
	}

	/**
	 * Get the set of results matching the current query.
	 *
	 * @return Set of results in `id: data` format (possibly promised).
	 */
	get(): Results<T> | Promise<Results<T>> {
		return this.provider.getDocuments(this);
	}

	/**
	 * Get value of this document (synchronously).
	 *
	 * @return Set of results in `id: data` format.
	 * @throws Promise if the value was not synchronous.
	 */
	get value(): Results<T> {
		return throwAsync(this.asyncValue);
	}

	/**
	 * Get the value of this document (asynchronously).
	 *
	 * @return Set of results in `id: data` format (possibly promised).
	 */
	get asyncValue(): Results<T> | Promise<Results<T>> {
		return this.get();
	}

	/**
	 * Count the number of results of this set of documents (synchronously).
	 *
	 * @return Number of documents in the collection.
	 * @throws Promise if the value was not synchronous.
	 */
	get count(): number {
		return throwAsync(this.asyncCount);
	}

	/**
	 * Count the number of results of this set of documents (asynchronously).
	 *
	 * @return Number of documents in the collection (possibly promised).
	 */
	get asyncCount(): number | Promise<number> {
		const results = this.provider.getDocuments(this);
		return isAsync(results) ? results.then(countEntries) : countEntries(results);
	}

	/**
	 * Get an array of string IDs for this set of documents (asynchronously).
	 *
	 * @return Array of strings representing the documents in the current collection (possibly promised).
	 * @throws Promise if the value was not synchronous.
	 */
	get ids(): ImmutableArray<string> {
		return throwAsync(this.asyncIds);
	}

	/**
	 * Get an array of string IDs for this set of documents (asynchronously).
	 *
	 * @return Array of strings representing the documents in the current collection (possibly promised).
	 */
	get asyncIds(): ImmutableArray<string> | Promise<ImmutableArray<string>> {
		const results = this.provider.getDocuments(this);
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
	subscribe(observer: Observer<Results<T>>): Unsubscriber;
	subscribe(next: AsyncDispatcher<Results<T>>, error?: AsyncCatcher, complete?: AsyncEmptyDispatcher): Unsubscriber;
	subscribe(either: Observer<Results<T>> | AsyncDispatcher<Results<T>>, error?: AsyncCatcher, complete?: AsyncEmptyDispatcher): Unsubscriber;
	subscribe(next: Observer<Results<T>> | AsyncDispatcher<Results<T>>, error?: AsyncCatcher, complete?: AsyncEmptyDispatcher): Unsubscriber {
		return this.provider.onDocuments(this, createObserver(next, error, complete));
	}

	/**
	 * Get an entry for the first result in this set of documents (synchronously).
	 *
	 * @return Entry in `[id, data]` format for the first document, or `undefined` if there are no matching documents.
	 * @throws Promise if the value was not synchronous.
	 */
	get first(): Entry<T> | undefined {
		return throwAsync(this.asyncFirst);
	}

	/**
	 * Get an entry for the first result in this set of documents (asynchronously).
	 *
	 * @return Entry in `[id, data]` format for the last document, or `undefined` if there are no matching documents (possibly promised).
	 */
	get asyncFirst(): Entry<T> | undefined | Promise<Entry<T> | undefined> {
		const results = this.limit(1).get();
		if (isAsync(results)) return results.then(getFirstProp);
		return getFirstProp(results);
	}

	/**
	 * Get an entry for the last result in this set of documents (synchronously).
	 *
	 * @return Entry in `[id, data]` format for the last document, or `undefined` if there are no matching documents.
	 * @throws Promise if the value was not synchronous.
	 */
	get last(): Entry<T> | undefined {
		return throwAsync(this.asyncLast);
	}

	/**
	 * Get an entry for the last result in this set of documents (asynchronously).
	 *
	 * @return Entry in `[id, data]` format for the first document, or `undefined` if there are no matching documents (possibly promised).
	 */
	get asyncLast(): Entry<T> | undefined | Promise<Entry<T> | undefined> {
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
		return this.provider.setDocuments(this, data);
	}

	/**
	 * Update all matching documents with the same partial value.
	 *
	 * @param transforms Set of transforms to apply to every matching document.
	 *
	 * @return Nothing (possibly promised).
	 */
	update(transforms: Transforms<T>): void | Promise<void> {
		return this.provider.updateDocuments(this, transforms);
	}

	/**
	 * Delete all matching documents.
	 *
	 * @return Nothing (possibly promised).
	 */
	delete(): void | Promise<void> {
		return this.provider.deleteDocuments(this);
	}

	// Implement Queryable
	is<K extends "id" | keyof T>(key: K & string, value: K extends "id" ? string : T[K]): this {
		return { __proto__: Object.getPrototypeOf(this), ...this, query: this.query.is<K>(key, value) };
	}
	not<K extends "id" | keyof T>(key: K & string, value: K extends "id" ? string : T[K]): this {
		return { __proto__: Object.getPrototypeOf(this), ...this, query: this.query.not<K>(key, value) };
	}
	in<K extends "id" | keyof T>(key: K & string, value: K extends "id" ? readonly string[] : readonly T[K][]): this {
		return { __proto__: Object.getPrototypeOf(this), ...this, query: this.query.in<K>(key, value) };
	}
	lt<K extends "id" | keyof T>(key: K & string, value: K extends "id" ? string : T[K]): this {
		return { __proto__: Object.getPrototypeOf(this), ...this, query: this.query.lt<K>(key, value) };
	}
	lte<K extends "id" | keyof T>(key: K & string, value: K extends "id" ? string : T[K]): this {
		return { __proto__: Object.getPrototypeOf(this), ...this, query: this.query.lte<K>(key, value) };
	}
	gt<K extends "id" | keyof T>(key: K & string, value: K extends "id" ? string : T[K]): this {
		return { __proto__: Object.getPrototypeOf(this), ...this, query: this.query.gt<K>(key, value) };
	}
	gte<K extends "id" | keyof T>(key: K & string, value: K extends "id" ? string : T[K]): this {
		return { __proto__: Object.getPrototypeOf(this), ...this, query: this.query.gte<K>(key, value) };
	}
	contains<K extends keyof T>(key: K & string, value: T[K] extends ImmutableArray ? ArrayType<T[K]> : never): this {
		return { __proto__: Object.getPrototypeOf(this), ...this, query: this.query.contains<K>(key, value) };
	}
	after(id: string, data: T): this {
		return { __proto__: Object.getPrototypeOf(this), ...this, query: this.query.after(id, data) };
	}
	before(id: string, data: T): this {
		return { __proto__: Object.getPrototypeOf(this), ...this, query: this.query.before(id, data) };
	}
	asc(key: "id" | (keyof T & string) = "id"): this {
		return { __proto__: Object.getPrototypeOf(this), ...this, query: this.query.asc(key) };
	}
	desc(key: "id" | (keyof T & string) = "id"): this {
		return { __proto__: Object.getPrototypeOf(this), ...this, query: this.query.desc(key) };
	}
	limit(limit: number | null): this {
		if (limit === this.query.slice.limit) return this;
		return { __proto__: Object.getPrototypeOf(this), ...this, query: this.query.limit(limit) };
	}

	// Implement toString()
	override toString(): string {
		return `${this.path}?${this.query.toString()}`;
	}

	// Implement iterator protocol (only works if get is synchronous, otherwise `Promise` is thrown).
	*[Symbol.iterator](): Generator<[string, T], void, undefined> {
		yield* Object.entries(throwAsync(this.get()));
	}

	// Implement async iterator protocol.
	async *[Symbol.asyncIterator](): AsyncGenerator<[string, T], void, undefined> {
		yield* Object.entries(await this.get());
	}
}

/**
 * Document reference: allows reading from / writing to a specific document using a provider.
 */
export class Document<T extends Data = Data> extends Reference<T> implements Observable<Result<T>> {
	readonly collection: string;
	readonly id: string;
	constructor(provider: Provider, schema: Validator<T>, collection: string, id: string) {
		super(provider, schema, `${collection}/${id}`);
		this.collection = collection;
		this.id = id;
	}

	/**
	 * Get a `Documents` reference for the collection this document is part of.
	 * @param query Optional query to create the `Documents` reference with.
	 */
	docs(query?: Query<T>): Documents<T> {
		return new Documents(this.provider, this.schema, this.collection, query);
	}

	/**
	 * Get the result of this document.
	 * - Alternate syntax for `this.result`
	 * - If `options.required = true` then throws `ReferenceRequiredError` if the document doesn't exist.
	 *
	 * @return Document's data, or `undefined` if it doesn't exist.
	 */
	get(): Result<T> | Promise<Result<T>> {
		return this.provider.getDocument(this);
	}

	/**
	 * Does this document exist (synchronously).
	 *
	 * @return `true` if the document exists and `false` if it doesn't.
	 */
	get exists(): boolean {
		return throwAsync(this.asyncExists);
	}

	/**
	 * Does this document exist?
	 * @return `true` if the document exists and `false` if it doesn't.
	 */
	get asyncExists(): boolean | Promise<boolean> {
		const result = this.get();
		return isAsync(result) ? result.then(Boolean) : !!result;
	}

	/**
	 * Get value of this document (synchronously).
	 *
	 * @return Document's data, or `undefined` if the document doesn't exist.
	 * @throws Promise if the value was not synchronous.
	 */
	get value(): Result<T> {
		return throwAsync(this.asyncValue);
	}

	/**
	 * Get the value of this document (asynchronously).
	 *
	 * @return Document's data, or `undefined` if the document doesn't exist (possibly promised).
	 */
	get asyncValue(): Result<T> | Promise<Result<T>> {
		return this.get();
	}

	/**
	 * Get the data of this document (asynchronously).
	 * - Useful for destructuring, e.g. `{ name, title } = documentThatMustExist.data`
	 *
	 * @return Document's data.
	 * @throws Promise if the data was not synchronous.
	 * @throws RequiredError if the document's result was undefined.
	 */
	get data(): T {
		return throwAsync(this.asyncData);
	}

	/**
	 * Get the data of this document (asynchronously).
	 * - Useful for destructuring, e.g. `{ name, title } = await documentThatMustExist.asyncData`
	 *
	 * @return Document's data (possibly promised).
	 * @throws RequiredError if the document's result was undefined.
	 */
	get asyncData(): T | Promise<T> {
		const result = this.get();
		if (isAsync(result))
			return result.then(r => {
				if (!r) throw new ReferenceRequiredError(this);
				return r;
			});
		if (!result) throw new ReferenceRequiredError(this);
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
	subscribe(observer: Observer<Result<T>>): Unsubscriber;
	subscribe(next: AsyncDispatcher<Result<T>>, error?: AsyncCatcher, complete?: AsyncEmptyDispatcher): Unsubscriber;
	subscribe(either: Observer<Result<T>> | AsyncDispatcher<Result<T>>, error?: AsyncCatcher, complete?: AsyncEmptyDispatcher): Unsubscriber;
	subscribe(next: Observer<Result<T>> | AsyncDispatcher<Result<T>>, error?: AsyncCatcher, complete?: AsyncEmptyDispatcher): Unsubscriber {
		return this.provider.onDocument<T>(this, createObserver(next, error, complete));
	}

	/**
	 * Set the complete data of this document.
	 *
	 * @param data Complete data to set the document to.
	 *
	 * @return Nothing (possibly promised).
	 */
	set(data: T): void | Promise<void> {
		return this.provider.setDocument(this, data);
	}

	/**
	 * Update this document with partial data.
	 * - If the document exists, merge the partial data into it.
	 * - If the document doesn't exist, throw an error.
	 *
	 * @param transforms Set of transforms to apply to the existing document.
	 *
	 * @return Nothing (possibly promised).
	 * @throws Error If the document does not exist (ideally a `RequiredError` but may be provider-specific).
	 */
	update(transforms: Transforms<T>): void | Promise<void> {
		return this.provider.updateDocument(this, transforms);
	}

	/**
	 * Delete this document.
	 * - If the document doesn't exist, throw an error.
	 *
	 * @return Nothing (possibly promised).
	 * @throws Error If the document does not exist (ideally a `RequiredError` but may be provider-specific).
	 */
	delete(): void | Promise<void> {
		return this.provider.deleteDocument(this);
	}
}
