import type { Changes, Data, Change, Results } from "../data";
import type { DataSchemas, AnyDataSchema } from "../schema";
import type { AsyncDispatcher, ErrorDispatcher, UnsubscribeDispatcher } from "../dispatch";
import type { Entry } from "../entry";
import type { Queryable, Query } from "../query";
import type { Reference } from "./Reference";
import type { Document } from "./Document";

/** A generic collection whose generics are not known. */
export type AnyCollection = Collection<Data, DataSchemas, DataSchemas>;

/** Get the corresponding collection for a DataSchema. */
export type DataCollection<S extends AnyDataSchema> = Collection<S["DATA"], S["documents"], S["collections"]>;

/**
 * Collection reference: Allows a set of documents in a collection to be read or deleted from a database.
 */
export interface Collection<T extends Data, D extends DataSchemas = DataSchemas, C extends DataSchemas = DataSchemas> extends Reference<T>, Queryable<T> {
	/** Query that filters and sorts these documents. */
	readonly query: Query<T>;

	/**
	 * Get a `Document` instance for a document.
	 * @param id Document ID, e.g. `fido`
	 * @example `db.collection("dogs").doc("fido").get()`
	 */
	doc(id: string): Document<T, D, C>;

	/**
	 * Create a new document (with a random ID).
	 * Input data must be valid according's schema or error will be thrown.
	 */
	add(data: T): Promise<Entry<T>>;

	/**
	 * Get the set of results.
	 */
	get(): Promise<Results<T>>;

	/**
	 * Get the set of results.
	 * - Alternate syntax for `this.get()`
	 *
	 * @returns Document's data, or `undefined` if the document doesn't exist. Uses a `Promise` if the provider is async, or a non-promise otherwise.
	 */
	readonly results: Promise<Results<T>>;

	/**
	 * Count the result of this document.
	 * @returns Number of documents in the collection. Uses a `Promise` if the provider is async, or a non-promise otherwise.
	 */
	readonly count: Promise<number>;

	/**
	 * Get the IDs as an array of strings.
	 * @returns Array of strings representing the documents in the current collection. Uses a `Promise` if the provider is async, or a non-promise otherwise.
	 */
	readonly ids: Promise<string[]>;

	/**
	 * Subscribe to the results.
	 * - Called immediately with the current results, and again any time the results change.
	 */
	on(onNext: AsyncDispatcher<Results<T>>, onError?: ErrorDispatcher): UnsubscribeDispatcher;

	/** Get a pointer first result (i.e. an object containing `.id` and `.data`, or `undefined` if no documents match this collecton). */
	readonly first: Promise<Entry<T> | undefined>;

	/** Get a pointer last result (i.e. an object containing `.id` and `.data`, or `undefined` if no documents match this collecton). */
	readonly last: Promise<Entry<T> | undefined>;

	/**
	 * Add or update a set of documents.
	 * - Any data in the set of changes (indexed by their ID) will be updated or deleted.
	 * - Subscriptions are only fired once after all changes are made.
	 *
	 * @param results An object indexed by ID containing either partial data to merge in, or `undefined` to indicate the document should be deleted.
	 * @returns The set of changes after validation.
	 */
	set(results: Results<T>): Promise<Changes<T>>;

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
	change(changes: Changes<T>): Promise<Changes<T>>;

	/**
	 * Set a complete set of data on all matched documents.
	 * - All documents matched by the current query will have their data set to `data`
	 * - Subscriptions are only fired once after all changes are made.
	 */
	setAll(data: T): Promise<Changes<T>>;

	/**
	 * Merge a single set of data into all matched documents.
	 * - All documents matched by the current query will have `partial` merged into their data.
	 * - Subscriptions are only fired once after all changes are made.
	 */
	mergeAll(change: Change<T>): Promise<Changes<T>>;

	/**
	 * Delete all matched documents.
	 * - All documents matched by the current query will be deleted.
	 * - Subscriptions are only fired once after all changes are made.
	 * - Not called `delete()` because it's trying to be more clear.
	 */
	deleteAll(): Promise<Changes<T>>;

	// Must implement iterator protocol.
	[Symbol.iterator](): Generator<[string, T], void, undefined>;
}
