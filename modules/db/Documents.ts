import {
	Data,
	Results,
	AsyncDispatcher,
	AsyncEmptyDispatcher,
	AsyncCatcher,
	Unsubscriber,
	Entry,
	ArrayType,
	ImmutableArray,
	countProps,
	getFirstProp,
	getLastProp,
	Observer,
	Observable,
	throwAsync,
	isAsync,
} from "../util";
import type { Validator } from "../schema";
import { Queryable, Query } from "../query";
import { Document } from "./Document";
import type { Reference } from "./Reference";
import { Provider } from "./Provider";

const EMPTY_QUERY = new Query<any>(); // eslint-disable-line @typescript-eslint/no-explicit-any

/**
 * Documents reference: allows reading from / writing to a list of documents in a database, optionally with query filtering and sorting.
 */
export class Documents<T extends Data = Data> implements Reference<T>, Queryable<T>, Observable<Results<T>> {
	readonly provider: Provider;
	readonly schema: Validator<T>;
	readonly path: string;
	readonly query: Query<T> = EMPTY_QUERY;

	protected constructor(schema: Validator<T>, provider: Provider, collection: string) {
		this.schema = schema;
		this.provider = provider;
		this.path = collection;
	}

	/**
	 * Get a `Document` instance for a document.
	 * @param id Document ID, e.g. `fido`
	 * @example `db.docs("puppies").doc("fido").get()`
	 */
	doc(id: string): Document<T> {
		// @ts-expect-error Documents should only be created from databases.
		return new Document(this.schema, this.provider, this.path, id);
	}

	/**
	 * Create a new document (with a random ID).
	 * - Input data must be valid according's schema or error will be thrown unless `options.validate` is `false`
	 */
	add(data: T): string | Promise<string> {
		return this.provider.addDocument(this, data);
	}

	/**
	 * Get the set of results matching the current query.
	 * @returns Set of document results (possibly promised).
	 */
	get(): Results<T> | Promise<Results<T>> {
		return this.provider.getDocuments(this);
	}

	/**
	 * Get value of this document (synchronously).
	 * @returns Set of document results.
	 * @throws Promise if the value was not synchronous.
	 */
	get value(): Results<T> {
		return throwAsync(this.asyncValue);
	}

	/**
	 * Get the value of this document (asynchronously).
	 * @returns Set of document results (possibly promised).
	 */
	get asyncValue(): Results<T> | Promise<Results<T>> {
		return this.get();
	}

	/**
	 * Count the number of results of this set of documents (synchronously).
	 * @returns Number of documents in the collection.
	 * @throws Promise if the value was not synchronous.
	 */
	get count(): number {
		return throwAsync(this.asyncCount);
	}

	/**
	 * Count the number of results of this set of documents (asynchronously).
	 * @returns Number of documents in the collection (possibly promised).
	 */
	get asyncCount(): number | Promise<number> {
		const results = this.provider.getDocuments(this);
		return isAsync(results) ? results.then(countProps) : countProps(results);
	}

	/**
	 * Get an array of string IDs for this set of documents (asynchronously).
	 * @returns Array of strings representing the documents in the current collection (possibly promised).
	 * @throws Promise if the value was not synchronous.
	 */
	get ids(): ImmutableArray<string> {
		return throwAsync(this.asyncIds);
	}

	/**
	 * Get an array of string IDs for this set of documents (asynchronously).
	 * @returns Array of strings representing the documents in the current collection (possibly promised).
	 */
	get asyncIds(): ImmutableArray<string> | Promise<ImmutableArray<string>> {
		const results = this.provider.getDocuments(this);
		return isAsync(results) ? results.then(Object.keys) : Object.keys(results);
	}

	/**
	 * Subscribe to the results of this collection (indefinitely).
	 * - Called once with the first set of results, and again any time the results change.
	 *
	 * @param observer Observer with `next`, `error`, or `complete` methods.
	 * @param next Callback that is called when this document changes. Called with the document's data, or `undefined` if it doesn't exist.
	 * @param error Callback that is called if an error occurs.
	 * @param complete Callback that is called when the subscription is done.
	 *
	 * @returns Function that ends the subscription.
	 */
	subscribe(observer: Observer<Results<T>>): Unsubscriber;
	subscribe(next: AsyncDispatcher<Results<T>>, error?: AsyncCatcher, complete?: AsyncEmptyDispatcher): Unsubscriber;
	subscribe(either: Observer<Results<T>> | AsyncDispatcher<Results<T>>, error?: AsyncCatcher, complete?: AsyncEmptyDispatcher): Unsubscriber;
	subscribe(next: Observer<Results<T>> | AsyncDispatcher<Results<T>>, error?: AsyncCatcher, complete?: AsyncEmptyDispatcher): Unsubscriber {
		return typeof next === "object" ? this.provider.onDocuments(this, next) : this.provider.onDocuments(this, { next, error, complete });
	}

	/**
	 * Get an entry for the first result in this set of documents (synchronously).
	 * @returns Entry in `[id, data]` format for the first document, or `undefined` if there are no matching documents.
	 * @throws Promise if the value was not synchronous.
	 */
	get first(): Entry<T> | undefined {
		return throwAsync(this.asyncFirst);
	}

	/**
	 * Get an entry for the first result in this set of documents (asynchronously).
	 * @returns Entry in `[id, data]` format for the last document, or `undefined` if there are no matching documents (possibly promised).
	 */
	get asyncFirst(): Entry<T> | undefined | Promise<Entry<T> | undefined> {
		const results = this.limit(1).get();
		if (isAsync(results)) return results.then(getFirstProp);
		return getFirstProp(results);
	}

	/**
	 * Get an entry for the last result in this set of documents (synchronously).
	 * @returns Entry in `[id, data]` format for the last document, or `undefined` if there are no matching documents.
	 * @throws Promise if the value was not synchronous.
	 */
	get last(): Entry<T> | undefined {
		return throwAsync(this.asyncLast);
	}

	/**
	 * Get an entry for the last result in this set of documents (asynchronously).
	 * @returns Entry in `[id, data]` format for the first document, or `undefined` if there are no matching documents (possibly promised).
	 */
	get asyncLast(): Entry<T> | undefined | Promise<Entry<T> | undefined> {
		const results = this.limit(1).get();
		if (isAsync(results)) return results.then(getLastProp);
		return getLastProp(results);
	}

	/**
	 * Set all matched documents with the specified partial data.
	 * - All documents matched by the current query will have their data set to `data`
	 *
	 * @param data The (potentially invalid) data to apply to all matched documents.
	 * @param options.validate Whether the data is validated (defaults to `true`)
	 *
	 * @return Promise that resolves when done.
	 */
	async set(data: T): Promise<void> {
		await this.provider.setDocuments(this, data);
	}

	/**
	 * Update all matched documents with the specified partial data.
	 * - All documents matched by the current query will have `partial` merged into their data.
	 *
	 * @param partial The (potentially invalid) partial data to apply to all matched documents.
	 * @param options.validate Whether the partial data is validated (defaults to `true`)
	 *
	 * @return Promise that resolves when done.
	 */
	async update(partial: Partial<T>): Promise<void> {
		await this.provider.updateDocuments(this, partial);
	}

	/**
	 * Delete all matched documents.
	 *
	 * @return Promise that resolves when done.
	 */
	async delete(): Promise<void> {
		await this.provider.deleteDocuments(this);
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
