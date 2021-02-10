import type { Data, Results } from "../data";
import type { DataSchemas, AnyDataSchema, DataSchema, Validator } from "../schema";
import type { AsyncDispatcher, ErrorDispatcher, UnsubscribeDispatcher } from "../dispatch";
import type { Entry } from "../entry";
import type { Queryable, Query } from "../query";
import type { Cloneable } from "../clone";
import { ImmutableObject } from "../object";
import type { Document } from "./Document";
import type { DeleteOptions, SetOptions } from "./options";

/** A generic collection whose generics are not known. */
export type AnyCollection = Collection<Data, DataSchemas, DataSchemas>;

/** Get a `Collection` for a `DataSchema`. */
export type SchemaCollection<S extends AnyDataSchema> = Collection<S["type"], S["documents"], S["collections"]>;

/**
 * Collection reference: Allows a set of documents in a collection to be read or deleted from a database.
 */
export interface Collection<T extends Data, D extends DataSchemas = DataSchemas, C extends DataSchemas = DataSchemas>
	extends Queryable<T>,
		Validator<T>,
		Cloneable {
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
	 * Set all matched documents with the specified partial data.
	 * - All documents matched by the current query will have their data set to `data`
	 */
	set(unsafeData: ImmutableObject, options: SetOptions & { validate: false }): Promise<void>;
	set(data: T, options?: SetOptions): Promise<void>;

	/**
	 * Update all matched documents with the specified partial data.
	 * - All documents matched by the current query will have `partial` merged into their data.
	 */
	update(unsafePartial: ImmutableObject, options?: SetOptions & { validate: false }): Promise<void>;
	update(partial: Partial<T>, options?: SetOptions): Promise<void>;

	/**
	 * Delete all matched documents.
	 * - All documents matched by the current query will be deleted.
	 * - Not called `delete()` so it's harder to delete everything.
	 */
	delete(options?: DeleteOptions): Promise<void>;

	// Must implement toString()
	toString(): string;

	// Must implement iterator protocol.
	[Symbol.iterator](): Generator<[string, T], void, undefined>;
}
