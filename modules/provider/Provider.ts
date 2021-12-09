import type { Observer, Unsubscriber, Result, Results, Data } from "../util/index.js";
import type { DataDocument, DataQuery } from "../db/Database.js";
import type { Update } from "../update/index.js";

/** Provides access to data (e.g. IndexedDB, Firebase, or in-memory cache providers). */
export abstract class Provider {
	/**
	 * Get the result of a document.
	 *
	 * @param ref Document reference specifying which document to get.
	 * @return The document object, or `undefined` if it doesn't exist.
	 */
	abstract get<T extends Data>(ref: DataDocument<T>): Result<T> | PromiseLike<Result<T>>;

	/**
	 * Subscribe to the result of a document.
	 * - `next()` is called once with the initial result, and again any time the result changes.
	 *
	 * @param ref Document reference specifying which document to subscribe to.
	 * @param observer Observer with `next`, `error`, or `complete` methods that the document result is reported back to.
	 *
	 * @return Function that ends the subscription.
	 */
	abstract subscribe<T extends Data>(ref: DataDocument<T>, observer: Observer<Result<T>>): Unsubscriber;

	/**
	 * Create a new document with a random ID.
	 * - Created document is guaranteed to have a unique ID.
	 *
	 * @param ref Documents reference specifying which collection to add the document to.
	 * @param data Complete data to set the document to.
	 *
	 * @return String ID for the created document (possibly promised).
	 */
	abstract add<T extends Data>(ref: DataQuery<T>, data: T): string | PromiseLike<string>;

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
	abstract set<T extends Data>(ref: DataDocument<T>, value: T): void | PromiseLike<void>;

	/**
	 * Update the data an existing document.
	 *
	 * @param ref Document reference specifying which document to update.
	 * @param updates Update instance to set the document to.
	 *
	 * @throws Error If the document does not exist (ideally a `RequiredError` but may be provider-specific).
	 */
	abstract update<T extends Data>(ref: DataDocument<T>, updates: Update<T>): void | PromiseLike<void>;

	/**
	 * Delete a specified document.
	 * @param ref Document reference specifying which document to delete.
	 */
	abstract delete<T extends Data>(ref: DataDocument<T>): void | PromiseLike<void>;

	/**
	 * Get all matching documents.
	 *
	 * @param ref Documents reference specifying which collection to get documents from.
	 * @return Set of results in `id: data` format.
	 */
	abstract getQuery<T extends Data>(ref: DataQuery<T>): Results<T> | PromiseLike<Results<T>>;

	/**
	 * Subscribe to all matching documents.
	 * - `next()` is called once with the initial results, and again any time the results change.
	 *
	 * @param ref Documents reference specifying which collection to subscribe to.
	 * @param observer Observer with `next`, `error`, or `complete` methods that the document results are reported back to.
	 *
	 * @return Function that ends the subscription.
	 */
	abstract subscribeQuery<T extends Data>(ref: DataQuery<T>, observer: Observer<Results<T>>): Unsubscriber;

	/**
	 * Set the data of all matching documents.
	 *
	 * @param ref Documents reference specifying which collection to set.
	 * @param value Value to set the document to.
	 */
	abstract setQuery<T extends Data>(ref: DataQuery<T>, data: T): void | PromiseLike<void>;

	/**
	 * Update the data of all matching documents.
	 *
	 * @param ref Documents reference specifying which collection to set.
	 * @param updates Update instance to set the document to.
	 */
	abstract updateQuery<T extends Data>(ref: DataQuery<T>, updates: Update<T>): void | PromiseLike<void>;

	/**
	 * Delete all matching documents.
	 * @param ref Document reference specifying which document to delete.
	 */
	abstract deleteQuery<T extends Data>(ref: DataQuery<T>): void | PromiseLike<void>;
}

/** Provider with a fully synchronous interface */
export interface SynchronousProvider extends Provider {
	get<T extends Data>(ref: DataDocument<T>): Result<T>;
	add<T extends Data>(ref: DataQuery<T>, data: T): string;
	set<T extends Data>(ref: DataDocument<T>, value: T): void;
	update<T extends Data>(ref: DataDocument<T>, value: Update<T>): void;
	delete<T extends Data>(ref: DataDocument<T>): void;
	getQuery<T extends Data>(ref: DataQuery<T>): Results<T>;
	setQuery<T extends Data>(ref: DataQuery<T>, value: T): void;
	updateQuery<T extends Data>(ref: DataQuery<T>, updates: Update<T>): void;
	deleteQuery<T extends Data>(ref: DataQuery<T>): void;
}

/** Provider with a fully asynchronous interface */
export interface AsynchronousProvider extends Provider {
	get<T extends Data>(ref: DataDocument<T>): PromiseLike<Result<T>>;
	add<T extends Data>(ref: DataQuery<T>, data: T): PromiseLike<string>;
	set<T extends Data>(ref: DataDocument<T>, value: T): PromiseLike<void>;
	update<T extends Data>(ref: DataDocument<T>, updates: Update<T>): PromiseLike<void>;
	delete<T extends Data>(ref: DataDocument<T>): PromiseLike<void>;
	getQuery<T extends Data>(ref: DataQuery<T>): PromiseLike<Results<T>>;
	setQuery<T extends Data>(ref: DataQuery<T>, value: T): PromiseLike<void>;
	updateQuery<T extends Data>(ref: DataQuery<T>, updates: Update<T>): PromiseLike<void>;
	deleteQuery<T extends Data>(ref: DataQuery<T>): PromiseLike<void>;
}
