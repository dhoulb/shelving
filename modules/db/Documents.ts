import {
	Data,
	Observable,
	Results,
	throwAsync,
	isAsync,
	countEntries,
	ImmutableArray,
	Observer,
	Unsubscriber,
	AsyncDispatcher,
	AsyncCatcher,
	AsyncEmptyDispatcher,
	Entry,
	getFirstProp,
	getLastProp,
	ArrayType,
	Transforms,
} from "../util";
import { Query, Queryable } from "../query";
import type { Database } from "./Database";
import { Document } from "./Document";
import { DocumentsState } from "./DocumentsState";
import { Reference } from "./Reference";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const EMPTY_QUERY = new Query<any>();

/**
 * Documents reference: allows reading from / writing to a list of documents in a database, optionally with query filtering and sorting.
 */
export class Documents<T extends Data = Data> extends Reference<T> implements Queryable<T>, Observable<Results<T>> {
	readonly query: Query<T>;

	constructor(db: Database, collection: string, query: Query<T> = EMPTY_QUERY) {
		super(db, collection, collection);
		this.query = query;
	}

	/**
	 * Get a `Document` instance for a document.
	 *
	 * @param id Document ID, e.g. `fido`
	 * @example `db.docs("puppies").doc("fido").get()`
	 */
	doc(id: string): Document<T> {
		return new Document(this.db, this.collection, id);
	}

	/**
	 * Create a new document with a random ID.
	 * - Created document is guaranteed to have a unique ID.
	 *
	 * @param data Complete data to set the document to.
	 * @return String ID for the created document (possibly promised).
	 */
	add(data: T): string | Promise<string> {
		return this.db.provider.addDocument(this, data);
	}

	/**
	 * Get the set of results matching the current query.
	 *
	 * @return Set of results in `id: data` format (possibly promised).
	 */
	get(): Results<T> | Promise<Results<T>> {
		return this.db.provider.getDocuments(this);
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
		const results = this.db.provider.getDocuments(this);
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
		const results = this.db.provider.getDocuments(this);
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
		return typeof next === "object" ? this.db.provider.onDocuments(this, next) : this.db.provider.onDocuments(this, { next, error, complete });
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
	 * Get the global document state for this document.
	 * - This won't (necessarily) be updated automatically as documents are refetched. To update it insert a `StateProvider` into your provider stack.
	 *
	 * @return Unique global `State` instance specifying the current global state for this document.
	 */
	get state(): DocumentsState<T> {
		return DocumentsState.get(this);
	}

	/**
	 * Set all matching documents to the same exact value.
	 *
	 * @param data Complete data to set the document to.
	 * @return Nothing (possibly promised).
	 */
	set(data: T): void | Promise<void> {
		return this.db.provider.setDocuments(this, data);
	}

	/**
	 * Update all matching documents with the same partial value.
	 *
	 * @param transforms Set of transforms to apply to every matching document.
	 *
	 * @return Nothing (possibly promised).
	 */
	update(transforms: Transforms<T>): void | Promise<void> {
		return this.db.provider.updateDocuments(this, transforms);
	}

	/**
	 * Delete all matching documents.
	 *
	 * @return Nothing (possibly promised).
	 */
	delete(): void | Promise<void> {
		return this.db.provider.deleteDocuments(this);
	}

	// Implement Queryable
	is<K extends "id" | keyof T>(key: K & string, value: K extends "id" ? string : T[K]): this {
		return { __proto__: Documents.prototype, ...this, query: this.query.is<K>(key, value) };
	}
	not<K extends "id" | keyof T>(key: K & string, value: K extends "id" ? string : T[K]): this {
		return { __proto__: Documents.prototype, ...this, query: this.query.not<K>(key, value) };
	}
	in<K extends "id" | keyof T>(key: K & string, value: K extends "id" ? readonly string[] : readonly T[K][]): this {
		return { __proto__: Documents.prototype, ...this, query: this.query.in<K>(key, value) };
	}
	lt<K extends "id" | keyof T>(key: K & string, value: K extends "id" ? string : T[K]): this {
		return { __proto__: Documents.prototype, ...this, query: this.query.lt<K>(key, value) };
	}
	lte<K extends "id" | keyof T>(key: K & string, value: K extends "id" ? string : T[K]): this {
		return { __proto__: Documents.prototype, ...this, query: this.query.lte<K>(key, value) };
	}
	gt<K extends "id" | keyof T>(key: K & string, value: K extends "id" ? string : T[K]): this {
		return { __proto__: Documents.prototype, ...this, query: this.query.gt<K>(key, value) };
	}
	gte<K extends "id" | keyof T>(key: K & string, value: K extends "id" ? string : T[K]): this {
		return { __proto__: Documents.prototype, ...this, query: this.query.gte<K>(key, value) };
	}
	contains<K extends keyof T>(key: K & string, value: T[K] extends ImmutableArray ? ArrayType<T[K]> : never): this {
		return { __proto__: Documents.prototype, ...this, query: this.query.contains<K>(key, value) };
	}
	after(id: string, data: T): this {
		return { __proto__: Documents.prototype, ...this, query: this.query.after(id, data) };
	}
	before(id: string, data: T): this {
		return { __proto__: Documents.prototype, ...this, query: this.query.before(id, data) };
	}
	asc(key: "id" | (keyof T & string) = "id"): this {
		return { __proto__: Documents.prototype, ...this, query: this.query.asc(key) };
	}
	desc(key: "id" | (keyof T & string) = "id"): this {
		return { __proto__: Documents.prototype, ...this, query: this.query.desc(key) };
	}
	limit(limit: number | null): this {
		if (limit === this.query.slice.limit) return this;
		return { __proto__: Documents.prototype, ...this, query: this.query.limit(limit) };
	}

	// Implement toString()
	toString(): string {
		return `${this.path}?${this.query.toString()}`;
	}

	// Implement iterator protocol.
	*[Symbol.iterator](): Generator<[string, T], void, undefined> {
		yield* Object.entries(this.get());
	}
}
