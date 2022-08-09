import type { Unsubscribe } from "../observe/Observable.js";
import type { PartialObserver } from "../observe/Observer.js";
import { Query } from "../query/Query.js";
import type { DataUpdate } from "../update/DataUpdate.js";
import type { Datas, Entities, Entity, Key, OptionalEntity } from "../util/data.js";

/** Provides access to data (e.g. IndexedDB, Firebase, or in-memory cache providers). */
export abstract class AbstractProvider<T extends Datas> {
	/**
	 * Get the result of a document.
	 *
	 * @return The document object, or `undefined` if it doesn't exist.
	 */
	abstract getDocument<K extends Key<T>>(ref: ProviderDocument<T, K>): OptionalEntity<T[K]> | PromiseLike<OptionalEntity<T[K]>>;

	/**
	 * Subscribe to the result of a document.
	 * - `next()` is called once with the initial result, and again any time the result changes.
	 *
	 * @param observer Observer with `next`, `error`, or `complete` methods that the document result is reported back to.
	 *
	 * @return Function that ends the subscription.
	 */
	abstract subscribeDocument<K extends Key<T>>(ref: ProviderDocument<T, K>, observer: PartialObserver<OptionalEntity<T[K]>>): Unsubscribe;

	/**
	 * Create a new document with a random ID.
	 * - Created document is guaranteed to have a unique ID.
	 *
	 * @param data Complete data to set the document to.
	 * @return String ID for the created document (possibly promised).
	 */
	abstract addDocument<K extends Key<T>>(ref: ProviderCollection<T, K>, data: T[K]): string | PromiseLike<string>;

	/**
	 * Set the data a document.
	 * - If the document exists, set the value of it.
	 * - If the document doesn't exist, set it at path.
	 *
	 * @param data Data to set the document to.
	 * @throws Error If a `Update` was provided but the document does not exist (ideally a `RequiredError` but may be provider-specific).
	 */
	abstract setDocument<K extends Key<T>>(ref: ProviderDocument<T, K>, data: T[K]): void | PromiseLike<void>;

	/**
	 * Update the data an existing document.
	 *
	 * @param update Update instance to set the document to.
	 * @throws Error If the document does not exist (ideally a `RequiredError` but may be provider-specific).
	 */
	abstract updateDocument<K extends Key<T>>(ref: ProviderDocument<T, K>, update: DataUpdate<T[K]>): void | PromiseLike<void>;

	/**
	 * Delete a specified document.
	 */
	abstract deleteDocument<K extends Key<T>>(ref: ProviderDocument<T, K>): void | PromiseLike<void>;

	/**
	 * Get all matching documents.
	 *
	 * @return Set of results in `id: data` format.
	 */
	abstract getQuery<K extends Key<T>>(ref: ProviderQuery<T, K>): Entities<T[K]> | PromiseLike<Entities<T[K]>>;

	/**
	 * Subscribe to all matching documents.
	 * - `next()` is called once with the initial results, and again any time the results change.
	 *
	 * @param observer Observer with `next`, `error`, or `complete` methods that the document results are reported back to.
	 * @return Function that ends the subscription.
	 */
	abstract subscribeQuery<K extends Key<T>>(ref: ProviderQuery<T, K>, observer: PartialObserver<Entities<T[K]>>): Unsubscribe;

	/**
	 * Set the data of all matching documents.
	 *
	 * @param data Value to set the document to.
	 * @return Number of documents that were set.
	 */
	abstract setQuery<K extends Key<T>>(ref: ProviderQuery<T, K>, data: T[K]): number | PromiseLike<number>;

	/**
	 * Update the data of all matching documents.
	 *
	 * @param update Update instance to set the document to.
	 * @return Number of documents that were updated.
	 */
	abstract updateQuery<K extends Key<T>>(ref: ProviderQuery<T, K>, update: DataUpdate<T[K]>): number | PromiseLike<number>;

	/**
	 * Delete all matching documents.
	 * @return Number of documents that were deleted.
	 */
	abstract deleteQuery<K extends Key<T>>(ref: ProviderQuery<T, K>): number | PromiseLike<number>;
}

/** Provider with a fully synchronous interface */
export abstract class Provider<T extends Datas> extends AbstractProvider<T> {
	abstract override getDocument<K extends Key<T>>(ref: ProviderDocument<T, K>): OptionalEntity<T[K]>;
	abstract override addDocument<K extends Key<T>>(ref: ProviderCollection<T, K>, data: T[K]): string;
	abstract override setDocument<K extends Key<T>>(ref: ProviderDocument<T, K>, data: T[K]): void;
	abstract override updateDocument<K extends Key<T>>(ref: ProviderDocument<T, K>, update: DataUpdate<T[K]>): void;
	abstract override deleteDocument<K extends Key<T>>(ref: ProviderDocument<T, K>): void;
	abstract override getQuery<K extends Key<T>>(ref: ProviderQuery<T, K>): Entities<T[K]>;
	abstract override setQuery<K extends Key<T>>(ref: ProviderQuery<T, K>, data: T[K]): number;
	abstract override updateQuery<K extends Key<T>>(ref: ProviderQuery<T, K>, update: DataUpdate<T[K]>): number;
	abstract override deleteQuery<K extends Key<T>>(ref: ProviderQuery<T, K>): number;
}

/** Provider with a fully asynchronous interface */
export abstract class AsyncProvider<T extends Datas> extends AbstractProvider<T> {
	abstract override getDocument<K extends Key<T>>(ref: ProviderDocument<T, K>): Promise<OptionalEntity<T[K]>>;
	abstract override addDocument<K extends Key<T>>(ref: ProviderCollection<T, K>, data: T[K]): Promise<string>;
	abstract override setDocument<K extends Key<T>>(ref: ProviderDocument<T, K>, data: T[K]): Promise<void>;
	abstract override updateDocument<K extends Key<T>>(ref: ProviderDocument<T, K>, update: DataUpdate<T[K]>): Promise<void>;
	abstract override deleteDocument<K extends Key<T>>(ref: ProviderDocument<T, K>): Promise<void>;
	abstract override getQuery<K extends Key<T>>(ref: ProviderQuery<T, K>): Promise<Entities<T[K]>>;
	abstract override setQuery<K extends Key<T>>(ref: ProviderQuery<T, K>, data: T[K]): Promise<number>;
	abstract override updateQuery<K extends Key<T>>(ref: ProviderQuery<T, K>, update: DataUpdate<T[K]>): Promise<number>;
	abstract override deleteQuery<K extends Key<T>>(ref: ProviderQuery<T, K>): Promise<number>;
}

/** Object specifying a collection for a provider. */
export interface ProviderCollection<T extends Datas, K extends Key<T>> {
	readonly collection: K;
	toString(): string;
}

/** Object specifying a query on a collection for a provider. */
export interface ProviderQuery<T extends Datas, K extends Key<T>> extends Query<Entity<T[K]>>, ProviderCollection<T, K> {}

/** Object specifying a document in a collection for a provider. */
export interface ProviderDocument<T extends Datas, K extends Key<T>> extends ProviderCollection<T, K> {
	readonly id: string;
}
