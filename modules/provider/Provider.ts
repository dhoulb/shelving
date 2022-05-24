import type { DocumentReference, QueryReference } from "../db/Reference.js";
import type { DataUpdate } from "../update/DataUpdate.js";
import type { Data, Result } from "../util/data.js";
import type { Entries } from "../util/entry.js";
import type { Observer, Unsubscriber } from "../util/observe.js";

/** Provides access to data (e.g. IndexedDB, Firebase, or in-memory cache providers). */
export abstract class Provider {
	/**
	 * Get the result of a document.
	 *
	 * @param ref Document reference specifying which document to get.
	 * @return The document object, or `undefined` if it doesn't exist.
	 */
	abstract get<T extends Data>(ref: DocumentReference<T>): Result<T> | PromiseLike<Result<T>>;

	/**
	 * Subscribe to the result of a document.
	 * - `next()` is called once with the initial result, and again any time the result changes.
	 *
	 * @param ref Document reference specifying which document to subscribe to.
	 * @param observer Observer with `next`, `error`, or `complete` methods that the document result is reported back to.
	 *
	 * @return Function that ends the subscription.
	 */
	abstract subscribe<T extends Data>(ref: DocumentReference<T>, observer: Observer<Result<T>>): Unsubscriber;

	/**
	 * Create a new document with a random ID.
	 * - Created document is guaranteed to have a unique ID.
	 *
	 * @param ref Documents reference specifying which collection to add the document to.
	 * @param data Complete data to set the document to.
	 *
	 * @return String ID for the created document (possibly promised).
	 */
	abstract add<T extends Data>(ref: QueryReference<T>, data: T): string | PromiseLike<string>;

	/**
	 * Set the data a document.
	 * - If the document exists, set the value of it.
	 * - If the document doesn't exist, set it at path.
	 *
	 * @param ref Document reference specifying which document to set.
	 * @param data Data to set the document to.
	 *
	 * @throws Error If a `Update` was provided but the document does not exist (ideally a `RequiredError` but may be provider-specific).
	 */
	abstract set<T extends Data>(ref: DocumentReference<T>, data: T): void | PromiseLike<void>;

	/**
	 * Update the data an existing document.
	 *
	 * @param ref Document reference specifying which document to update.
	 * @param update Update instance to set the document to.
	 *
	 * @throws Error If the document does not exist (ideally a `RequiredError` but may be provider-specific).
	 */
	abstract update<T extends Data>(ref: DocumentReference<T>, update: DataUpdate<T>): void | PromiseLike<void>;

	/**
	 * Delete a specified document.
	 * @param ref Document reference specifying which document to delete.
	 */
	abstract delete<T extends Data>(ref: DocumentReference<T>): void | PromiseLike<void>;

	/**
	 * Get all matching documents.
	 *
	 * @param ref Documents reference specifying which collection to get documents from.
	 * @return Set of results in `id: data` format.
	 */
	abstract getQuery<T extends Data>(ref: QueryReference<T>): Entries<T> | PromiseLike<Entries<T>>;

	/**
	 * Subscribe to all matching documents.
	 * - `next()` is called once with the initial results, and again any time the results change.
	 *
	 * @param ref Documents reference specifying which collection to subscribe to.
	 * @param observer Observer with `next`, `error`, or `complete` methods that the document results are reported back to.
	 *
	 * @return Function that ends the subscription.
	 */
	abstract subscribeQuery<T extends Data>(ref: QueryReference<T>, observer: Observer<Entries<T>>): Unsubscriber;

	/**
	 * Set the data of all matching documents.
	 *
	 * @param ref Documents reference specifying which collection to set.
	 * @param value Value to set the document to.
	 * @return Number of documents that were set.
	 */
	abstract setQuery<T extends Data>(ref: QueryReference<T>, data: T): number | PromiseLike<number>;

	/**
	 * Update the data of all matching documents.
	 *
	 * @param ref Documents reference specifying which collection to set.
	 * @param update Update instance to set the document to.
	 * @return Number of documents that were updated.
	 */
	abstract updateQuery<T extends Data>(ref: QueryReference<T>, update: DataUpdate<T>): number | PromiseLike<number>;

	/**
	 * Delete all matching documents.
	 * @param ref Document reference specifying which document to delete.
	 * @return Number of documents that were deleted.
	 */
	abstract deleteQuery<T extends Data>(ref: QueryReference<T>): number | PromiseLike<number>;
}

/** Provider with a fully synchronous interface */
export interface SynchronousProvider extends Provider {
	get<T extends Data>(ref: DocumentReference<T>): Result<T>;
	add<T extends Data>(ref: QueryReference<T>, data: T): string;
	set<T extends Data>(ref: DocumentReference<T>, value: T): void;
	update<T extends Data>(ref: DocumentReference<T>, update: DataUpdate<T>): void;
	delete<T extends Data>(ref: DocumentReference<T>): void;
	getQuery<T extends Data>(ref: QueryReference<T>): Entries<T>;
	setQuery<T extends Data>(ref: QueryReference<T>, value: T): number;
	updateQuery<T extends Data>(ref: QueryReference<T>, update: DataUpdate<T>): number;
	deleteQuery<T extends Data>(ref: QueryReference<T>): number;
}

/** Provider with a fully asynchronous interface */
export interface AsynchronousProvider extends Provider {
	get<T extends Data>(ref: DocumentReference<T>): PromiseLike<Result<T>>;
	add<T extends Data>(ref: QueryReference<T>, data: T): PromiseLike<string>;
	set<T extends Data>(ref: DocumentReference<T>, value: T): PromiseLike<void>;
	update<T extends Data>(ref: DocumentReference<T>, update: DataUpdate<T>): PromiseLike<void>;
	delete<T extends Data>(ref: DocumentReference<T>): PromiseLike<void>;
	getQuery<T extends Data>(ref: QueryReference<T>): PromiseLike<Entries<T>>;
	setQuery<T extends Data>(ref: QueryReference<T>, value: T): PromiseLike<number>;
	updateQuery<T extends Data>(ref: QueryReference<T>, update: DataUpdate<T>): PromiseLike<number>;
	deleteQuery<T extends Data>(ref: QueryReference<T>): PromiseLike<number>;
}
