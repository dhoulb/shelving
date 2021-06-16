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
} from "../util";
import type { Validator } from "../schema";
import { Queryable, Query } from "../query";
import { State } from "../stream";
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
	 */
	get(): Results<T> | Promise<Results<T>> {
		return this.provider.getDocuments(this);
	}

	/**
	 * Get the set of results.
	 * - Alternate syntax for `this.get()`
	 *
	 * @returns Document's data, or `undefined` if the document doesn't exist. Uses a promise if the provider is async, or a non-promise otherwise.
	 */
	get results(): Results<T> | Promise<Results<T>> {
		return this.get();
	}

	/**
	 * Count the result of this document.
	 * - Often more efficient than plain `get()` because it doesn't always need to read all the data.
	 *
	 * @returns Number of documents in the collection. Uses a promise if the provider is async, or a non-promise otherwise.
	 */
	get count(): number | Promise<number> {
		const results = this.provider.getDocuments(this);
		return results instanceof Promise ? results.then(countProps) : countProps(results);
	}

	/**
	 * Get the IDs as an array of strings.
	 * - More efficient than plain `get()` because it doesn't need to validate the returned data.
	 *
	 * @returns Array of strings representing the documents in the current collection. Uses a promise if the provider is async, or a non-promise otherwise.
	 */
	get ids(): string[] | Promise<string[]> {
		const results = this.provider.getDocuments(this);
		return results instanceof Promise ? results.then(Object.keys) : Object.keys(results);
	}

	/**
	 * Get current state for this document.
	 * - Not all providers will support `currentDocument()` (it's primarily for caching or in-memory providers).
	 *
	 * @returns `State` instance representing the current state of the document's data.
	 * - State will be in a `LOADING` state if the value is not available synchronously.
	 */
	get state(): State<Results<T>> {
		return this.provider.currentDocuments(this);
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

	/** Get a pointer first result (i.e. an object containing `.id` and `.data`, or `undefined` if no documents match this collecton). */
	get first(): Entry<T> | undefined | Promise<Entry<T> | undefined> {
		const results = this.limit(1).get();
		if (results instanceof Promise) return results.then(getFirstProp);
		return getFirstProp(results);
	}

	/** Get a pointer last result (i.e. an object containing `.id` and `.data`, or `undefined` if no documents match this collecton). */
	get last(): Entry<T> | undefined | Promise<Entry<T> | undefined> {
		const results = this.limit(1).get();
		if (results instanceof Promise) return results.then(getLastProp);
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
