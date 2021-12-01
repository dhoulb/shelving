import type { Observer, Unsubscriber, Result, Datas, Key, Results } from "../util/index.js";
import type { DatabaseDocument, DatabaseQuery } from "../db/Database.js";
import type { Transform } from "../transform/index.js";

/** Provides access to data (e.g. IndexedDB, Firebase, or in-memory cache providers). */
export abstract class Provider<D extends Datas = Datas> {
	/**
	 * Get the result of a document.
	 *
	 * @param ref Document reference specifying which document to get.
	 * @return The document object, or `undefined` if it doesn't exist.
	 */
	abstract get<C extends Key<D>>(ref: DatabaseDocument<C, D>): Result<D[C]> | PromiseLike<Result<D[C]>>;

	/**
	 * Subscribe to the result of a document.
	 * - `next()` is called once with the initial result, and again any time the result changes.
	 *
	 * @param ref Document reference specifying which document to subscribe to.
	 * @param observer Observer with `next`, `error`, or `complete` methods that the document result is reported back to.
	 *
	 * @return Function that ends the subscription.
	 */
	abstract subscribe<C extends Key<D>>(ref: DatabaseDocument<C, D>, observer: Observer<Result<D[C]>>): Unsubscriber;

	/**
	 * Create a new document with a random ID.
	 * - Created document is guaranteed to have a unique ID.
	 *
	 * @param ref Documents reference specifying which collection to add the document to.
	 * @param data Complete data to set the document to.
	 *
	 * @return String ID for the created document (possibly promised).
	 */
	abstract add<C extends Key<D>>(ref: DatabaseQuery<C, D>, data: D[C]): string | PromiseLike<string>;

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
	abstract write<C extends Key<D>>(ref: DatabaseDocument<C, D>, value: D[C] | Transform<D[C]> | undefined): void | PromiseLike<void>;

	/**
	 * Get all matching documents.
	 *
	 * @param ref Documents reference specifying which collection to get documents from.
	 * @return Set of results in `id: data` format.
	 */
	abstract getQuery<C extends Key<D>>(ref: DatabaseQuery<C, D>): Results<D[C]> | PromiseLike<Results<D[C]>>;

	/**
	 * Subscribe to all matching documents.
	 * - `next()` is called once with the initial results, and again any time the results change.
	 *
	 * @param ref Documents reference specifying which collection to subscribe to.
	 * @param observer Observer with `next`, `error`, or `complete` methods that the document results are reported back to.
	 *
	 * @return Function that ends the subscription.
	 */
	abstract subscribeQuery<C extends Key<D>>(ref: DatabaseQuery<C, D>, observer: Observer<Results<D[C]>>): Unsubscriber;

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
	abstract writeQuery<C extends Key<D>>(ref: DatabaseQuery<C, D>, value: D[C] | Transform<D[C]> | undefined): void | PromiseLike<void>;
}

/** Provider with a fully synchronous interface */
export interface SynchronousProvider<D extends Datas> extends Provider<D> {
	get<C extends Key<D>>(ref: DatabaseDocument<C, D>): Result<D[C]>;
	add<C extends Key<D>>(ref: DatabaseQuery<C, D>, data: D[C]): string;
	write<C extends Key<D>>(ref: DatabaseDocument<C, D>, value: D[C] | Transform<D[C]> | undefined): void;
	getQuery<C extends Key<D>>(ref: DatabaseQuery<C, D>): Results<D[C]>;
	writeQuery<C extends Key<D>>(ref: DatabaseQuery<C, D>, value: D[C] | Transform<D[C]> | undefined): void;
}

/** Provider with a fully asynchronous interface */
export interface AsynchronousProvider<D extends Datas> extends Provider<D> {
	get<C extends Key<D>>(ref: DatabaseDocument<C, D>): PromiseLike<Result<D[C]>>;
	add<C extends Key<D>>(ref: DatabaseQuery<C, D>, data: D[C]): PromiseLike<string>;
	write<C extends Key<D>>(ref: DatabaseDocument<C, D>, value: D[C] | Transform<D[C]> | undefined): PromiseLike<void>;
	getQuery<C extends Key<D>>(ref: DatabaseQuery<C, D>): PromiseLike<Results<D[C]>>;
	writeQuery<C extends Key<D>>(ref: DatabaseQuery<C, D>, value: D[C] | Transform<D[C]> | undefined): PromiseLike<void>;
}
