import type { Changes, Data, Change, Results } from "../data";
import type { DataSchemas, AnyDataSchema, DataSchema } from "../schema";
import type { AsyncDispatcher, ErrorDispatcher, UnsubscribeDispatcher } from "../dispatch";
import type { Entry } from "../entry";
import type { Queryable, Query } from "../query";
import { Cloneable } from "../clone";
import { ImmutableObject } from "../object";
import type { Document } from "./Document";

/** A generic collection whose generics are not known. */
export type AnyCollection = Collection<Data, DataSchemas, DataSchemas>;

/** Options that modify a delete operation. */
export type CollectionDeleteOptions = {
	/** Whether to delete this document and all its children (defaults to false). */
	deep?: boolean;
};

/** Get a `Collection` for a `DataSchema`. */
export type SchemaCollection<S extends AnyDataSchema> = Collection<S["type"], S["documents"], S["collections"]>;

/**
 * Collection reference: Allows a set of documents in a collection to be read or deleted from a database.
 */
export interface Collection<T extends Data, D extends DataSchemas = DataSchemas, C extends DataSchemas = DataSchemas> extends Queryable<T>, Cloneable {
	/** Data schema that validates this document. */
	readonly schema: DataSchema<T, D, C>;

	/** Full path to the data (e.g. `dogs/fido`) */
	readonly path: string;

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
	add(data: T): Promise<string>;

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
	set(results: Results<T>): Promise<void>;

	/**
	 * Apply a set of changes.
	 * - Change means 'merge' or 'delete'.
	 * - Any changes in the set of changes (indexed by their ID) will be updated or deleted.
	 * - e.g. `{ "abc": null }` will delete the record with key `abc`
	 * - e.g. `{ "abc": { title: "ABC" } }` will update the title of the record with key `abc`
	 * - Subscriptions are only fired once after all changes are made.
	 *
	 * @param changes An object indexed by ID containing either partial data to merge in, or `undefined` to indicate the document should be deleted.
	 * @returns The set of changes after validation.
	 */
	change(changes: Changes<T>): Promise<void>;

	/**
	 * Set a complete set of data on all matched documents.
	 * - All documents matched by the current query will have their data set to `data`
	 * - Subscriptions are only fired once after all changes are made.
	 */
	setAll(data: T): Promise<void>;

	/**
	 * Merge a single set of data into all matched documents.
	 * - All documents matched by the current query will have `partial` merged into their data.
	 * - Subscriptions are only fired once after all changes are made.
	 */
	mergeAll(change: Change<T>): Promise<void>;

	/**
	 * Delete all matched documents.
	 * - All documents matched by the current query will be deleted.
	 * - Subscriptions are only fired once after all changes are made.
	 * - Not called `delete()` so it's harder to delete everything.
	 */
	deleteAll(options?: CollectionDeleteOptions): Promise<void>;

	/**
	 * Validate unknown data and return valid data for this collection.
	 *
	 * @param data The (potentially invalid) input data.
	 * @returns Data object matching this reference's schema.
	 * - If the input data is already exactly valid, the exact same instance is returned.
	 * @throws InvalidError If the input data is not valid and cannot be fixed.
	 */
	validate(data: ImmutableObject): T;

	/**
	 * Validate an unknown value and return a valid change for this Collection.
	 *
	 * @param change The (potentially invalid) partial data, or `undefined` to indicate a deleted document.
	 * @returns Change matching this reference's schema.
	 * - If the input data is already exactly valid, the exact same instance is returned.
	 * @throws InvalidError If the input change is not valid and cannot be fixed.
	 */
	validateChange(change: ImmutableObject | undefined): Change<T>;

	/**
	 * Validate a set of results to this collection.
	 *
	 * @param results An object indexed by ID containing document data.
	 * @returns The set of results after validation.
	 */
	validateResults(results: ImmutableObject): Results<T>;

	/**
	 * Validate a set of changes to this collection.
	 *
	 * @param changes An object indexed by ID containing either partial values to merge in, or `undefined` to indicate the document should be deleted.
	 * @returns The set of changes after validation.
	 */
	validateChanges(changes: ImmutableObject): Changes<T>;

	// Must implement toString()
	toString(): string;

	// Must implement iterator protocol.
	[Symbol.iterator](): Generator<[string, T], void, undefined>;
}
