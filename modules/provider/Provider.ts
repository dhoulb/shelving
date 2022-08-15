import type { Unsubscribe } from "../observe/Observable.js";
import type { PartialObserver } from "../observe/Observer.js";
import type { Updates } from "../update/DataUpdate.js";
import type { Datas, Key } from "../util/data.js";
import type { ItemArray, ItemConstraints, ItemValue } from "../db/Item.js";

/** Provides access to data (e.g. IndexedDB, Firebase, or in-memory cache providers). */
abstract class AbstractProvider<T extends Datas = Datas> {
	/**
	 * Get the result of a document.
	 *
	 * @return The document object, or `undefined` if it doesn't exist.
	 */
	abstract getItem<K extends Key<T>>(collection: K, id: string): ItemValue<T[K]> | PromiseLike<ItemValue<T[K]>>;

	/**
	 * Subscribe to the result of a document.
	 * - `next()` is called once with the initial result, and again any time the result changes.
	 *
	 * @param observer Observer with `next`, `error`, or `complete` methods that the document result is reported back to.
	 *
	 * @return Function that ends the subscription.
	 */
	abstract subscribeItem<K extends Key<T>>(collection: K, id: string, observer: PartialObserver<ItemValue<T[K]>>): Unsubscribe;

	/**
	 * Create a new document with a random ID.
	 * - Created document is guaranteed to have a unique ID.
	 *
	 * @param data Complete data to set the document to.
	 * @return String ID for the created document (possibly promised).
	 */
	abstract addItem<K extends Key<T>>(collection: K, data: T[K]): string | PromiseLike<string>;

	/**
	 * Set the data a document.
	 * - If the document exists, set the value of it.
	 * - If the document doesn't exist, set it at path.
	 *
	 * @param data Data to set the document to.
	 * @throws Error If a `Update` was provided but the document does not exist (ideally a `RequiredError` but may be provider-specific).
	 */
	abstract setItem<K extends Key<T>>(collection: K, id: string, data: T[K]): void | PromiseLike<void>;

	/**
	 * Update the data an existing document.
	 *
	 * @param update Update instance to set the document to.
	 * @throws Error If the document does not exist (ideally a `RequiredError` but may be provider-specific).
	 */
	abstract updateItem<K extends Key<T>>(collection: K, id: string, updates: Updates<T[K]>): void | PromiseLike<void>;

	/**
	 * Delete a specified document.
	 */
	abstract deleteItem<K extends Key<T>>(collection: K, id: string): void | PromiseLike<void>;

	/**
	 * Get all matching documents.
	 *
	 * @return Set of results in `id: data` format.
	 */
	abstract getQuery<K extends Key<T>>(collection: K, constraints: ItemConstraints<T[K]>): ItemArray<T[K]> | PromiseLike<ItemArray<T[K]>>;

	/**
	 * Subscribe to all matching documents.
	 * - `next()` is called once with the initial results, and again any time the results change.
	 *
	 * @param observer Observer with `next`, `error`, or `complete` methods that the document results are reported back to.
	 * @return Function that ends the subscription.
	 */
	abstract subscribeQuery<K extends Key<T>>(collection: K, constraints: ItemConstraints<T[K]>, observer: PartialObserver<ItemArray<T[K]>>): Unsubscribe;

	/**
	 * Set the data of all matching documents.
	 *
	 * @param data Value to set the document to.
	 * @return Number of documents that were set.
	 */
	abstract setQuery<K extends Key<T>>(collection: K, constraints: ItemConstraints<T[K]>, data: T[K]): number | PromiseLike<number>;

	/**
	 * Update the data of all matching documents.
	 *
	 * @param update Update instance to set the document to.
	 * @return Number of documents that were updated.
	 */
	abstract updateQuery<K extends Key<T>>(collection: K, constraints: ItemConstraints<T[K]>, updates: Updates<T[K]>): number | PromiseLike<number>;

	/**
	 * Delete all matching documents.
	 * @return Number of documents that were deleted.
	 */
	abstract deleteQuery<K extends Key<T>>(collection: K, constraints: ItemConstraints<T[K]>): number | PromiseLike<number>;
}

/** Provider with a fully synchronous interface */
export abstract class Provider<T extends Datas = Datas> extends AbstractProvider<T> {
	abstract override getItem<K extends Key<T>>(collection: K, id: string): ItemValue<T[K]>;
	abstract override subscribeItem<K extends Key<T>>(collection: K, id: string, observer: PartialObserver<ItemValue<T[K]>>): Unsubscribe;
	abstract override addItem<K extends Key<T>>(collection: K, data: T[K]): string;
	abstract override setItem<K extends Key<T>>(collection: K, id: string, data: T[K]): void;
	abstract override updateItem<K extends Key<T>>(collection: K, id: string, updates: Updates<T[K]>): void;
	abstract override deleteItem<K extends Key<T>>(collection: K, id: string): void;
	abstract override getQuery<K extends Key<T>>(collection: K, constraints: ItemConstraints<T[K]>): ItemArray<T[K]>;
	abstract override subscribeQuery<K extends Key<T>>(collection: K, constraints: ItemConstraints<T[K]>, observer: PartialObserver<ItemArray<T[K]>>): Unsubscribe;
	abstract override setQuery<K extends Key<T>>(collection: K, constraints: ItemConstraints<T[K]>, data: T[K]): number;
	abstract override updateQuery<K extends Key<T>>(collection: K, constraints: ItemConstraints<T[K]>, updates: Updates<T[K]>): number;
	abstract override deleteQuery<K extends Key<T>>(collection: K, constraints: ItemConstraints<T[K]>): number;
}

/** Provider with a fully asynchronous interface */
export abstract class AsyncProvider<T extends Datas = Datas> extends AbstractProvider<T> {
	abstract override getItem<K extends Key<T>>(collection: K, id: string): Promise<ItemValue<T[K]>>;
	abstract override subscribeItem<K extends Key<T>>(collection: K, id: string, observer: PartialObserver<ItemValue<T[K]>>): Unsubscribe;
	abstract override addItem<K extends Key<T>>(collection: K, data: T[K]): Promise<string>;
	abstract override setItem<K extends Key<T>>(collection: K, id: string, data: T[K]): Promise<void>;
	abstract override updateItem<K extends Key<T>>(collection: K, id: string, updates: Updates<T[K]>): Promise<void>;
	abstract override deleteItem<K extends Key<T>>(collection: K, id: string): Promise<void>;
	abstract override getQuery<K extends Key<T>>(collection: K, constraints: ItemConstraints<T[K]>): Promise<ItemArray<T[K]>>;
	abstract override subscribeQuery<K extends Key<T>>(collection: K, constraints: ItemConstraints<T[K]>, observer: PartialObserver<ItemArray<T[K]>>): Unsubscribe;
	abstract override setQuery<K extends Key<T>>(collection: K, constraints: ItemConstraints<T[K]>, data: T[K]): Promise<number>;
	abstract override updateQuery<K extends Key<T>>(collection: K, constraints: ItemConstraints<T[K]>, updates: Updates<T[K]>): Promise<number>;
	abstract override deleteQuery<K extends Key<T>>(collection: K, constraints: ItemConstraints<T[K]>): Promise<number>;
}
