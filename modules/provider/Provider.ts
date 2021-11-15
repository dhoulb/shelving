import type { Observer, Unsubscriber, Data, Result, Results, Transformer } from "../util/index.js";
import type { ModelDocument, ModelQuery } from "../db/Model.js";

/** Provides access to data (e.g. IndexedDB, Firebase, or in-memory cache providers). */
export abstract class Provider {
	/**
	 * Get the result of a document.
	 *
	 * @param ref Document reference specifying which document to get.
	 * @return The document object, or `undefined` if it doesn't exist.
	 */
	abstract get<T extends Data>(ref: ModelDocument<T>): Result<T> | Promise<Result<T>>;

	/**
	 * Subscribe to the result of a document.
	 * - `next()` is called once with the initial result, and again any time the result changes.
	 *
	 * @param ref Document reference specifying which document to subscribe to.
	 * @param observer Observer with `next`, `error`, or `complete` methods that the document result is reported back to.
	 *
	 * @return Function that ends the subscription.
	 */
	abstract subscribe<T extends Data>(ref: ModelDocument<T>, observer: Observer<Result<T>>): Unsubscriber;

	/**
	 * Create a new document with a random ID.
	 * - Created document is guaranteed to have a unique ID.
	 *
	 * @param ref Documents reference specifying which collection to add the document to.
	 * @param data Complete data to set the document to.
	 *
	 * @return String ID for the created document (possibly promised).
	 */
	abstract add<T extends Data>(ref: ModelQuery<T>, data: T): string | Promise<string>;

	/**
	 * Write to a document.
	 * - If the document exists, set the value of it.
	 * - If the document doesn't exist, set it at path.
	 *
	 * @param ref Document reference specifying which document to set.
	 * @param value Value to set the document to.
	 * - If an object is provided, set the document to the value.
	 * - If a `Transform` instance is provided, ensure the document exists and transform it.
	 * - If `undefined` is provided, delete the document.
	 *
	 * @return Nothing (possibly promised).
	 * @throws Error If a `Transform` was provided but the document does not exist (ideally a `RequiredError` but may be provider-specific).
	 */
	abstract write<T extends Data>(ref: ModelDocument<T>, value: T | Transformer<T> | undefined): void | Promise<void>;

	/**
	 * Get all matching documents.
	 *
	 * @param ref Documents reference specifying which collection to get documents from.
	 * @return Set of results in `id: data` format.
	 */
	abstract getQuery<T extends Data>(ref: ModelQuery<T>): Results<T> | Promise<Results<T>>;

	/**
	 * Subscribe to all matching documents.
	 * - `next()` is called once with the initial results, and again any time the results change.
	 *
	 * @param ref Documents reference specifying which collection to subscribe to.
	 * @param observer Observer with `next`, `error`, or `complete` methods that the document results are reported back to.
	 *
	 * @return Function that ends the subscription.
	 */
	abstract subscribeQuery<T extends Data>(ref: ModelQuery<T>, observer: Observer<Results<T>>): Unsubscriber;

	/**
	 * Write to all matching documents.
	 *
	 * @param ref Documents reference specifying which collection to set.
	 * @param value Value to set the document to.
	 * - If an object is provided, set the document to the value.
	 * - If a `Transform` instance is provided, ensure the document exists and transform it.
	 * - If `undefined` is provided, delete the document.
	 *
	 * @return Nothing (possibly promised).
	 */
	abstract writeQuery<T extends Data>(ref: ModelQuery<T>, value: T | Transformer<T> | undefined): void | Promise<void>;
}

/** Provider with a fully synchronous interface */
export interface SynchronousProvider extends Provider {
	get<T extends Data>(ref: ModelDocument<T>): Result<T>;
	add<T extends Data>(ref: ModelQuery<T>, data: T): string;
	write<T extends Data>(ref: ModelDocument<T>, value: T | Transformer<T> | undefined): void;
	getQuery<T extends Data>(ref: ModelQuery<T>): Results<T>;
	writeQuery<T extends Data>(ref: ModelQuery<T>, value: T | Transformer<T> | undefined): void;
}

/** Provider with a fully asynchronous interface */
export interface AsynchronousProvider extends Provider {
	get<T extends Data>(ref: ModelDocument<T>): Promise<Result<T>>;
	add<T extends Data>(ref: ModelQuery<T>, data: T): Promise<string>;
	write<T extends Data>(ref: ModelDocument<T>, value: T | Transformer<T> | undefined): Promise<void>;
	getQuery<T extends Data>(ref: ModelQuery<T>): Promise<Results<T>>;
	writeQuery<T extends Data>(ref: ModelQuery<T>, value: T | Transformer<T> | undefined): Promise<void>;
}
