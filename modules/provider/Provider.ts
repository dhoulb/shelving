import type { Observer, Unsubscriber, Data, Result, Results, Transforms } from "../util/index.js";
import type { ModelDocument, ModelQuery } from "../db/Model.js";

/** Provides access to data (e.g. IndexedDB, Firebase, or in-memory cache providers). */
export interface Provider {
	/**
	 * Get the result of a document.
	 *
	 * @param ref Document reference specifying which document to get.
	 * @return The document object, or `undefined` if it doesn't exist.
	 */
	get<X extends Data>(ref: ModelDocument<X>): Result<X> | Promise<Result<X>>;

	/**
	 * Subscribe to the result of a document.
	 * - `next()` is called once with the initial result, and again any time the result changes.
	 *
	 * @param ref Document reference specifying which document to subscribe to.
	 * @param observer Observer with `next`, `error`, or `complete` methods that the document result is reported back to.
	 *
	 * @return Function that ends the subscription.
	 */
	subscribe<X extends Data>(ref: ModelDocument<X>, observer: Observer<Result<X>>): Unsubscriber;

	/**
	 * Create a new document with a random ID.
	 * - Created document is guaranteed to have a unique ID.
	 *
	 * @param ref Documents reference specifying which collection to add the document to.
	 * @param data Complete data to set the document to.
	 *
	 * @return String ID for the created document (possibly promised).
	 */
	add<X extends Data>(ref: ModelQuery<X>, data: X): string | Promise<string>;

	/**
	 * Set the complete data of a document.
	 * - If the document exists, set the value of it.
	 * - If the document doesn't exist, set it at path.
	 *
	 * @param ref Document reference specifying which document to set.
	 * @param data Complete data to set the document to.
	 *
	 * @return Nothing (possibly promised).
	 */
	set<X extends Data>(ref: ModelDocument<X>, data: X): void | Promise<void>;

	/**
	 * Update an existing document with partial data.
	 * - If the document exists, merge the partial data into it.
	 * - If the document doesn't exist, throw an error.
	 *
	 * @param ref Document reference specifying which document to merge into.
	 * @param transforms Set of transforms to apply to the existing document.
	 *
	 * @return Nothing (possibly promised).
	 * @throws Error If the document does not exist (ideally a `RequiredError` but may be provider-specific).
	 */
	update<X extends Data>(ref: ModelDocument<X>, transforms: Transforms<X>): void | Promise<void>;

	/**
	 * Delete an existing document.
	 * - Should not throw an error if the document doesn't exist.
	 *
	 * @param ref Document reference specifying which document to merge into.
	 *
	 * @return Nothing (possibly promised).
	 */
	delete<X extends Data>(ref: ModelDocument<X>): void | Promise<void>;

	/**
	 * Get all matching documents.
	 *
	 * @param ref Documents reference specifying which collection to get documents from.
	 * @return Set of results in `id: data` format.
	 */
	getQuery<X extends Data>(ref: ModelQuery<X>): Results<X> | Promise<Results<X>>;

	/**
	 * Subscribe to all matching documents.
	 * - `next()` is called once with the initial results, and again any time the results change.
	 *
	 * @param ref Documents reference specifying which collection to subscribe to.
	 * @param observer Observer with `next`, `error`, or `complete` methods that the document results are reported back to.
	 *
	 * @return Function that ends the subscription.
	 */
	subscribeQuery<X extends Data>(ref: ModelQuery<X>, observer: Observer<Results<X>>): Unsubscriber;

	/**
	 * Set all matching documents to the same exact value.
	 *
	 * @param ref Documents reference specifying which collection to set.
	 * @param data Complete data to set every matching document to.
	 *
	 * @return Nothing (possibly promised).
	 */
	setQuery<X extends Data>(ref: ModelQuery<X>, data: X): void | Promise<void>;

	/**
	 * Update all matching documents with the same partial value.
	 *
	 * @param ref Documents reference specifying which collection to update.
	 * @param transforms Set of transforms to apply to every matching document.
	 *
	 * @return Nothing (possibly promised).
	 */
	updateQuery<X extends Data>(ref: ModelQuery<X>, transforms: Transforms<X>): void | Promise<void>;

	/**
	 * Delete all matching documents.
	 *
	 * @param ref Documents reference specifying which collection to delete.
	 * @return Nothing (possibly promised).
	 */
	deleteQuery<X extends Data>(ref: ModelQuery<X>): void | Promise<void>;
}

/** Provider with a fully synchronous interface */
export interface SynchronousProvider extends Provider {
	get<X extends Data>(ref: ModelDocument<X>): Result<X>;
	add<X extends Data>(ref: ModelQuery<X>, data: X): string;
	set<X extends Data>(ref: ModelDocument<X>, data: X): void;
	update<X extends Data>(ref: ModelDocument<X>, transforms: Transforms<X>): void;
	delete<X extends Data>(ref: ModelDocument<X>): void;
	getQuery<X extends Data>(ref: ModelQuery<X>): Results<X>;
	setQuery<X extends Data>(ref: ModelQuery<X>, data: X): void;
	updateQuery<X extends Data>(ref: ModelQuery<X>, transforms: Transforms<X>): void;
	deleteQuery<X extends Data>(ref: ModelQuery<X>): void;
}

/** Provider with a fully asynchronous interface */
export interface AsynchronousProvider extends Provider {
	get<X extends Data>(ref: ModelDocument<X>): Promise<Result<X>>;
	add<X extends Data>(ref: ModelQuery<X>, data: X): Promise<string>;
	set<X extends Data>(ref: ModelDocument<X>, data: X): Promise<void>;
	update<X extends Data>(ref: ModelDocument<X>, transforms: Transforms<X>): Promise<void>;
	delete<X extends Data>(ref: ModelDocument<X>): Promise<void>;
	getQuery<X extends Data>(ref: ModelQuery<X>): Promise<Results<X>>;
	setQuery<X extends Data>(ref: ModelQuery<X>, data: X): Promise<void>;
	updateQuery<X extends Data>(ref: ModelQuery<X>, transforms: Transforms<X>): Promise<void>;
	deleteQuery<X extends Data>(ref: ModelQuery<X>): Promise<void>;
}
