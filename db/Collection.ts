import {
	logError,
	Keys,
	mapObject,
	Entry,
	ArrayType,
	ReadonlyArray,
	Data,
	Results,
	Changes,
	Change,
	getFirstProp,
	AsyncDispatcher,
	dispatch,
	ErrorDispatcher,
	UnsubscribeDispatcher,
} from "shelving/tools";
import { Query, Filterable, Sortable, Sliceable } from "shelving/query";
import type { DataSchema, UnknownDataSchema, DataSchemas } from "shelving/schema";
import { Reference } from "./Reference";
import type { Provider } from "./Provider";
import { Document } from "./Document";

/** Type of a collection for a given locus. */
export type CollectionType<S extends UnknownDataSchema, P extends Provider = Provider> = S extends DataSchema<infer T, infer D, infer C>
	? Collection<T, D, C, P>
	: never;

/** Collection defaults to empty query. */
const EMPTY_QUERY = new Query<any>(); // eslint-disable-line @typescript-eslint/no-explicit-any

/**
 * Collection reference: Allows a set of documents in a collection to be read or deleted from a database.
 */
export class Collection<T extends Data, D extends DataSchemas = DataSchemas, C extends DataSchemas = DataSchemas, P extends Provider = Provider>
	extends Reference<T, D, C, P>
	implements Filterable<T>, Sortable<T>, Sliceable {
	/** Query that filters and sorts these documents. */
	readonly query: Query<T> = EMPTY_QUERY;

	/**
	 * Get a `Document` instance for a document.
	 * @param id Document ID, e.g. `fido`
	 * @example `db.collection("dogs").doc("fido").get()`
	 */
	doc(id: string): Document<T, D, C, P> {
		return new Document(this.schema, this.provider, this.path, id);
	}

	/**
	 * Create a new document (with a random ID).
	 * Input data must be valid according's schema or error will be thrown.
	 */
	add(data: T): Promise<Entry<T>> {
		const safeData = this.validate(data);
		return this.provider.addDocument(this, safeData);
	}

	/**
	 * Get the set of results.
	 */
	get(): Promise<Results<T>> {
		return this.provider.getCollection(this);
	}

	/**
	 * Get the set of results.
	 * - Alternate syntax for `this.get()`
	 *
	 * @returns Document's data, or `undefined` if the document doesn't exist. Uses a `Promise` if the provider is async, or a non-promise otherwise.
	 */
	get results(): Promise<Results<T>> {
		return this.provider.getCollection(this);
	}

	/**
	 * Count the result of this document.
	 * @returns Number of documents in the collection. Uses a `Promise` if the provider is async, or a non-promise otherwise.
	 */
	get count(): Promise<number> {
		return this.provider.countCollection(this);
	}

	/**
	 * Get the IDs as an array of strings.
	 * @returns Array of strings representing the documents in the current collection. Uses a `Promise` if the provider is async, or a non-promise otherwise.
	 */
	get ids(): Promise<string[]> {
		return this.provider.getCollection(this).then(Object.keys);
	}

	/**
	 * Subscribe to the results.
	 * - Called immediately with the current results, and again any time the results change.
	 */
	on(onNext: AsyncDispatcher<Results<T>>, onError: ErrorDispatcher = logError): UnsubscribeDispatcher {
		return this.provider.onCollection(this, r => dispatch(onNext, r, onError), onError);
	}

	/** Get a pointer first result (i.e. an object containing `.id` and `.data`, or `undefined` if no documents match this collecton). */
	get first(): Promise<Entry<T> | undefined> {
		return this.provider.getCollection(this.limit(1)).then(getFirstProp);
	}

	/** Get a pointer last result (i.e. an object containing `.id` and `.data`, or `undefined` if no documents match this collecton). */
	get last(): Promise<Entry<T> | undefined> {
		return this.provider.getCollection(this.limit(1)).then(getFirstProp);
	}

	/**
	 * Add or update a set of documents.
	 * - Any data in the set of changes (indexed by their ID) will be updated or deleted.
	 * - Subscriptions are only fired once after all changes are made.
	 *
	 * @param results An object indexed by ID containing either partial data to merge in, or `undefined` to indicate the document should be deleted.
	 * @returns The set of changes after validation.
	 */
	set(results: Results<T>): Promise<Changes<T>> {
		return this.provider.mergeCollection(this, this.validateResults(results));
	}

	/**
	 * Apply a set of changes.
	 * - Any changes in the set of changes (indexed by their ID) will be updated or deleted.
	 * - e.g. `{ "abc": null }` will delete the record with key `abc`
	 * - e.g. `{ "abc": { title: "ABC" } }` will update the title of the record with key `abc`
	 * - Subscriptions are only fired once after all changes are made.
	 *
	 * @param changes An object indexed by ID containing either partial data to merge in, or `undefined` to indicate the document should be deleted.
	 * @returns The set of changes after validation.
	 */
	change(changes: Changes<T>): Promise<Changes<T>> {
		return this.provider.mergeCollection(this, this.validateChanges(changes));
	}

	/**
	 * Set a complete set of data on all matched documents.
	 * - All documents matched by the current query will have their data set to `data`
	 * - Subscriptions are only fired once after all changes are made.
	 */
	async setAll(data: T): Promise<Changes<T>> {
		const changes = mapObject(await this.provider.getCollection(this), this.validate(data));
		return this.provider.mergeCollection(this, changes);
	}

	/**
	 * Merge a single set of data into all matched documents.
	 * - All documents matched by the current query will have `partial` merged into their data.
	 * - Subscriptions are only fired once after all changes are made.
	 */
	async mergeAll(change: Change<T>): Promise<Changes<T>> {
		const changes = mapObject(await this.provider.getCollection(this), this.validateChange(change));
		return this.provider.mergeCollection(this, changes);
	}

	/**
	 * Delete all matched documents.
	 * - All documents matched by the current query will be deleted.
	 * - Subscriptions are only fired once after all changes are made.
	 * - Not called `delete()` because it's trying to be more clear.
	 */
	async deleteAll(): Promise<Changes<T>> {
		const changes = mapObject(await this.provider.getCollection(this), undefined);
		return this.provider.mergeCollection(this, changes);
	}

	/**
	 * Filter results with an equal where query.
	 * @param `key` Either `id`, or the name of a key in the document containing scalars.
	 * - While `id` can be used to specify the document's ID it's probably better to use `collection.doc(id).get()` instead as the provider may not optimise this usage.
	 * @param value Value to match the key against.
	 * @returns New instance with new query rules.
	 */
	is<K extends "id" | Keys<T>>(key: K, value: K extends "id" ? string : T[K]): this {
		return { __proto__: Collection.prototype, ...this, query: this.query.is(key, value) };
	}

	/**
	 * Filter results with an equal where query.
	 * @param `key` Either `id`, or the name of a key in the document containing scalars.
	 * - While `id` can be used to specify the document's ID it's probably better to use `collection.doc(id).get()` instead as the provider may not optimise this usage.
	 * @param value Value to match the key against.
	 * @returns New instance with new query rules.
	 */
	not<K extends "id" | Keys<T>>(key: K, value: K extends "id" ? string : T[K]): this {
		return { __proto__: Collection.prototype, ...this, query: this.query.not(key, value) };
	}

	/**
	 * Filter for documents with a key matching any of a list of values.
	 * @param `key` Either `id`, or the name of a key in the document containing scalars (numbers, strings, booleans, null).
	 * - While `id` can be used it's probably better to use `Promise.all([collection.doc(id).get()])` as providers may not optimise for this use.
	 * @param `values` Array of values to match the key against.
	 * - Note: Firestore imposes a limit of 10 items on `in` queries.
	 * @returns New instance with new query rules.
	 */
	in<K extends "id" | Keys<T>>(key: K, value: K extends "id" ? readonly string[] : readonly T[K][]): this {
		return { __proto__: Collection.prototype, ...this, query: this.query.in(key, value) };
	}

	/**
	 * Filter results with a less than query.
	 * @param key Either `id`, or the name of a key in the document containing numbers or strings.
	 * @param value Value to match the key against.
	 * @returns New instance with new query rules.
	 */
	lt<K extends "id" | Keys<T>>(key: K, value: K extends "id" ? string : T[K]): this {
		return { __proto__: Collection.prototype, ...this, query: this.query.lt(key, value) };
	}

	/**
	 * Filter results with a less than or equal query.
	 * @param key Either `id`, or the name of a key in the document containing numbers or strings.
	 * @param value Value to match the key against.
	 * @returns New instance with new query rules.
	 */
	lte<K extends "id" | Keys<T>>(key: K, value: K extends "id" ? string : T[K]): this {
		return { __proto__: Collection.prototype, ...this, query: this.query.lte(key, value) };
	}

	/**
	 * Filter results with a greater than query.
	 * @param key Either `id`, or the name of a key in the document containing numbers or strings.
	 * @param value Value to match the key against.
	 * @returns New instance with new query rules.
	 */
	gt<K extends "id" | Keys<T>>(key: K, value: K extends "id" ? string : T[K]): this {
		return { __proto__: Collection.prototype, ...this, query: this.query.gt(key, value) };
	}

	/**
	 * Filter results with a greater than or equal query.
	 * @param key Either `id`, or the name of a key in the document containing numbers or strings.
	 * @param value Value to match the key against.
	 * @returns New instance with new query rules.
	 */
	gte<K extends "id" | Keys<T>>(key: K, value: K extends "id" ? string : T[K]): this {
		return { __proto__: Collection.prototype, ...this, query: this.query.gte(key, value) };
	}

	/**
	 * Filter for documents with an array key containing a specified value.
	 * @param key Either `id`, or the name of a key in the document containing array of scalars.
	 * @param value Value to match the key against.
	 * @returns New instance with new query rules.
	 */
	contains<K extends Keys<T>>(key: K, value: T[K] extends ReadonlyArray ? ArrayType<T[K]> : never): this {
		return { __proto__: Collection.prototype, ...this, query: this.query.contains(key, value) };
	}

	/**
	 * Sort results by a field in ascending order.
	 * @param key Either `id`, or the name of a key in the document containing scalars.
	 * @returns New instance with new query rules.
	 */
	asc(key: "id" | Keys<T> = "id"): this {
		return { __proto__: Collection.prototype, ...this, query: this.query.asc(key) };
	}

	/**
	 * Sort results by a field in descending order.
	 * @param key Either `id`, or the name of a key in the document containing scalars.
	 * @returns New instance with new query rules.
	 */
	desc(key: "id" | Keys<T> = "id"): this {
		return { __proto__: Collection.prototype, ...this, query: this.query.desc(key) };
	}

	/**
	 * Limit result to the first X documents.
	 * @param limit How many documents to limit the result to.
	 * @returns New instance with new query rules.
	 */
	limit(limit: number | null): this {
		return { __proto__: Collection.prototype, ...this, query: this.query.limit(limit) };
	}

	// Implement iterator protocol.
	*[Symbol.iterator](): Generator<[string, T], void, undefined> {
		yield* Object.entries(this.provider.getCollection(this));
	}

	// Implement toString()
	toString(): string {
		return `${this.path}?${this.query}`;
	}
}
