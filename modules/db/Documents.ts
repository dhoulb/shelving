import type { Data, Results } from "../data";
import type { Validator } from "../schema";
import type { AsyncDispatcher, AsyncEmptyDispatcher, AsyncCatcher, Unsubscriber } from "../function";
import type { Entry } from "../entry";
import type { ArrayType, ImmutableArray } from "../array";
import { Queryable, Query } from "../query";
import { getFirstProp, getLastProp, ImmutableObject } from "../object";
import { DerivingStream, Observer, Observable, State } from "../stream";
import { cacheMethod } from "../class";
import { Document } from "./Document";
import type { DatabaseReadOptions, DatabaseWriteOptions } from "./options";
import { Reference } from "./Reference";

const OPTIONS = {};
const PARTIAL = { partial: true } as const;
const EMPTY_QUERY = new Query<any>(); // eslint-disable-line @typescript-eslint/no-explicit-any

/**
 * Documents reference: Allows a set of documents in a collection to be read or deleted from a database.
 */
export class Documents<T extends Data = Data> extends Reference<T> implements Queryable<T>, Validator<T>, Observable<Results<T>> {
	/** Query that filters and sorts these documents. */
	readonly query: Query<T> = EMPTY_QUERY;

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
	async add(unsafeData: ImmutableObject, options: DatabaseWriteOptions & { validate: false }): Promise<string>;
	async add(data: T, options?: DatabaseWriteOptions): Promise<string>;
	async add(unvalidatedData: ImmutableObject, { validate = true }: DatabaseWriteOptions = OPTIONS): Promise<string> {
		const data = validate === false ? (unvalidatedData as Data) : this.validate(unvalidatedData);
		return await this.provider.addDocument(this, data);
	}

	/**
	 * Get the set of results matching the current query.
	 */
	async get(options: DatabaseReadOptions & { validate: false }): Promise<Results>;
	async get(options?: DatabaseReadOptions): Promise<Results<T>>;
	async get({ validate = this.provider.VALIDATE }: DatabaseReadOptions = OPTIONS): Promise<Results> {
		const unvalidatedData = await this.provider.getDocuments(this);
		return validate ? this.validateResults(unvalidatedData) : unvalidatedData;
	}

	/**
	 * Get the set of results.
	 * - Alternate syntax for `this.get()`
	 *
	 * @returns Document's data, or `undefined` if the document doesn't exist. Uses a promise if the provider is async, or a non-promise otherwise.
	 */
	get results(): Promise<Results<T>> {
		return this.get();
	}

	/**
	 * Count the result of this document.
	 * - Often more efficient than plain `get()` because it doesn't always need to read all the data.
	 *
	 * @returns Number of documents in the collection. Uses a promise if the provider is async, or a non-promise otherwise.
	 */
	get count(): Promise<number> {
		return Promise.resolve(this.provider.countDocuments(this));
	}

	/**
	 * Get the IDs as an array of strings.
	 * - More efficient than plain `get()` because it doesn't need to validate the returned data.
	 *
	 * @returns Array of strings representing the documents in the current collection. Uses a promise if the provider is async, or a non-promise otherwise.
	 */
	get ids(): Promise<string[]> {
		return Promise.resolve(this.provider.getDocuments(this)).then(Object.keys);
	}

	/**
	 * Get current state for this document.
	 * - Not all providers will support `currentDocument()` (it's primarily for caching or in-memory providers).
	 *
	 * @returns `State` instance representing the current state of the document's data.
	 * - State will be in a `LOADING` state if the value is not available synchronously.
	 */
	current(options: DatabaseReadOptions & { validate: false }): State<Results>;
	current(options?: DatabaseReadOptions): State<Results<T>>;
	current({ validate = this.provider.VALIDATE }: DatabaseReadOptions = OPTIONS): State<Results> | State<Results<T>> {
		const state = this.provider.currentDocuments(this);
		return validate ? state.derive((v): Results<T> => this.validateResults(v)) : state;
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
		return typeof next === "object" ? this.on(next) : this.on({ next, error, complete });
	}

	/**
	 * Subscribe to the results of this collection (indefinitely).
	 * - Like `subscribe()` but first argument must be an observer and a `DatabaseGetOptions` can be set as the second argument.
	 *
	 * @param observer Observer with `next`, `error`, or `complete` methods.
	 * @returns Function that ends the subscription.
	 */
	on(observer: Observer<Results>, options: DatabaseReadOptions & { validate: false }): Unsubscriber;
	on(observer: Observer<Results<T>>, options?: DatabaseReadOptions): Unsubscriber;
	on(observer: Observer<Results>, { validate = this.provider.VALIDATE }: DatabaseReadOptions = OPTIONS): Unsubscriber {
		if (validate === false) {
			return this.provider.onDocuments(this, observer);
		} else {
			const stream = new DerivingStream<Results, Results>(v => this.validateResults(v));
			stream.on(observer);
			return this.provider.onDocuments(this, stream);
		}
	}

	/** Get a pointer first result (i.e. an object containing `.id` and `.data`, or `undefined` if no documents match this collecton). */
	get first(): Promise<Entry<T> | undefined> {
		return this.limit(1).get().then(getFirstProp);
	}

	/** Get a pointer last result (i.e. an object containing `.id` and `.data`, or `undefined` if no documents match this collecton). */
	get last(): Promise<Entry<T> | undefined> {
		return this.limit(1).get().then(getLastProp);
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
	async set(unsafeData: ImmutableObject, options: DatabaseWriteOptions & { validate: false }): Promise<void>;
	async set(data: T, options?: DatabaseWriteOptions): Promise<void>;
	async set(unvalidatedData: ImmutableObject, { validate = true }: DatabaseWriteOptions = OPTIONS): Promise<void> {
		const data = validate === false ? (unvalidatedData as Data) : this.validate(unvalidatedData);
		await this.provider.updateDocuments(this, data);
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
	async update(unsafePartial: ImmutableObject, options?: DatabaseWriteOptions & { validate: false }): Promise<void>;
	async update(partial: Partial<T>, options?: DatabaseWriteOptions): Promise<void>;
	async update(unvalidatedPartial: ImmutableObject, { validate = true }: DatabaseWriteOptions = OPTIONS): Promise<void> {
		const partial = validate === false ? (unvalidatedPartial as Data) : this.validate(unvalidatedPartial, PARTIAL);
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

	// Must implement toString()
	@cacheMethod // Calculating the full path string is expensive so only do it once.
	toString(): string {
		return `${this.path}?${this.query}`;
	}

	// Must implement iterator protocol.
	*[Symbol.iterator](): Generator<[string, T], void, undefined> {
		yield* Object.entries(this.get());
	}
}
