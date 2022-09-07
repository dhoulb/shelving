import type { Updates } from "../update/DataUpdate.js";
import type { Datas, Key } from "../util/data.js";
import type { ItemArray, ItemConstraints, ItemValue } from "../db/Item.js";

/** Provides access to data (e.g. IndexedDB, Firebase, or in-memory cache providers). */
abstract class AbstractProvider<T extends Datas = Datas> {
	/**
	 * Get the value of a item.
	 *
	 * @return The item value, or `null` if it doesn't exist.
	 */
	abstract getItem<K extends Key<T>>(collection: K, id: string): ItemValue<T[K]> | PromiseLike<ItemValue<T[K]>>;

	/**
	 * Subscribe to the value of this item with an async iterator.
	 */
	abstract getItemSequence<K extends Key<T>>(collection: K, id: string): AsyncIterable<ItemValue<T[K]>>;

	/**
	 * Create a new item with a random ID.
	 * - Created item is guaranteed to have a unique ID.
	 *
	 * @param data Complete data to set the item to.
	 * @return String ID for the created item (possibly promised).
	 */
	abstract addItem<K extends Key<T>>(collection: K, data: T[K]): string | PromiseLike<string>;

	/**
	 * Set the data a item (whether it exists or not).
	 * @param data Data to set the item to.
	 */
	abstract setItem<K extends Key<T>>(collection: K, id: string, data: T[K]): void | PromiseLike<void>;

	/**
	 * Update the data an existing item.
	 *
	 * @param updates Set of property updates to apply to the item.
	 * @throws Error If the item does not exist (ideally a `RequiredError` but may be provider-specific).
	 */
	abstract updateItem<K extends Key<T>>(collection: K, id: string, updates: Updates<T[K]>): void | PromiseLike<void>;

	/**
	 * Delete a specified item.
	 */
	abstract deleteItem<K extends Key<T>>(collection: K, id: string): void | PromiseLike<void>;

	/**
	 * Get all matching items.
	 *
	 * @return Set of values in `id: data` format.
	 */
	abstract getQuery<K extends Key<T>>(collection: K, constraints: ItemConstraints<T[K]>): ItemArray<T[K]> | PromiseLike<ItemArray<T[K]>>;

	/**
	 * Subscribe to all matching items with an async iterator.
	 */
	abstract getQuerySequence<K extends Key<T>>(collection: K, constraints: ItemConstraints<T[K]>): AsyncIterable<ItemArray<T[K]>>;

	/**
	 * Set the data of all matching items.
	 *
	 * @param data Data to set matching items to.
	 * @return Number of items that were set.
	 */
	abstract setQuery<K extends Key<T>>(collection: K, constraints: ItemConstraints<T[K]>, data: T[K]): number | PromiseLike<number>;

	/**
	 * Update the data of all matching items.
	 *
	 * @param updates Set of property updates to apply to matching items.
	 * @return Number of items that were updated.
	 */
	abstract updateQuery<K extends Key<T>>(collection: K, constraints: ItemConstraints<T[K]>, updates: Updates<T[K]>): number | PromiseLike<number>;

	/**
	 * Delete all matching items.
	 * @return Number of items that were deleted.
	 */
	abstract deleteQuery<K extends Key<T>>(collection: K, constraints: ItemConstraints<T[K]>): number | PromiseLike<number>;
}

/** Provider with a fully synchronous interface */
export abstract class Provider<T extends Datas = Datas> extends AbstractProvider<T> {
	abstract override getItem<K extends Key<T>>(collection: K, id: string): ItemValue<T[K]>;
	abstract override addItem<K extends Key<T>>(collection: K, data: T[K]): string;
	abstract override setItem<K extends Key<T>>(collection: K, id: string, data: T[K]): void;
	abstract override updateItem<K extends Key<T>>(collection: K, id: string, updates: Updates<T[K]>): void;
	abstract override deleteItem<K extends Key<T>>(collection: K, id: string): void;
	abstract override getQuery<K extends Key<T>>(collection: K, constraints: ItemConstraints<T[K]>): ItemArray<T[K]>;
	abstract override setQuery<K extends Key<T>>(collection: K, constraints: ItemConstraints<T[K]>, data: T[K]): number;
	abstract override updateQuery<K extends Key<T>>(collection: K, constraints: ItemConstraints<T[K]>, updates: Updates<T[K]>): number;
	abstract override deleteQuery<K extends Key<T>>(collection: K, constraints: ItemConstraints<T[K]>): number;
}

/** Provider with a fully asynchronous interface */
export abstract class AsyncProvider<T extends Datas = Datas> extends AbstractProvider<T> {
	abstract override getItem<K extends Key<T>>(collection: K, id: string): Promise<ItemValue<T[K]>>;
	abstract override addItem<K extends Key<T>>(collection: K, data: T[K]): Promise<string>;
	abstract override setItem<K extends Key<T>>(collection: K, id: string, data: T[K]): Promise<void>;
	abstract override updateItem<K extends Key<T>>(collection: K, id: string, updates: Updates<T[K]>): Promise<void>;
	abstract override deleteItem<K extends Key<T>>(collection: K, id: string): Promise<void>;
	abstract override getQuery<K extends Key<T>>(collection: K, constraints: ItemConstraints<T[K]>): Promise<ItemArray<T[K]>>;
	abstract override setQuery<K extends Key<T>>(collection: K, constraints: ItemConstraints<T[K]>, data: T[K]): Promise<number>;
	abstract override updateQuery<K extends Key<T>>(collection: K, constraints: ItemConstraints<T[K]>, updates: Updates<T[K]>): Promise<number>;
	abstract override deleteQuery<K extends Key<T>>(collection: K, constraints: ItemConstraints<T[K]>): Promise<number>;
}
