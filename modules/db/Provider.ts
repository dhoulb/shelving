import type { DataKey, Database } from "../util/data.js";
import type { ItemQuery, Items, OptionalItem } from "../util/item.js";
import type { Updates } from "../util/update.js";

/** Provides access to data (e.g. IndexedDB, Firebase, or in-memory cache providers). */
export abstract class AbstractProvider<T extends Database> {
	/**
	 * Get an item.
	 */
	abstract getItem<K extends DataKey<T>>(collection: K, id: string): OptionalItem<T[K]> | PromiseLike<OptionalItem<T[K]>>;

	/**
	 * Subscribe to the value of this item with an async iterator.
	 */
	abstract getItemSequence<K extends DataKey<T>>(collection: K, id: string): AsyncIterable<OptionalItem<T[K]>>;

	/**
	 * Create a new item with a random ID.
	 * - Created item is guaranteed to have a unique ID.
	 *
	 * @param data Complete data to set the item to.
	 * @return String ID for the created item (possibly promised).
	 */
	abstract addItem<K extends DataKey<T>>(collection: K, data: T[K]): string | PromiseLike<string>;

	/**
	 * Set an item.
	 *
	 * @param data Data to set the item to.
	 */
	abstract setItem<K extends DataKey<T>>(collection: K, id: string, data: T[K]): void | PromiseLike<void>;

	/**
	 * Update an item.
	 * - Should not throw if the item doesn't exist.
	 *
	 * @param updates Set of property updates to apply to the item.
	 */
	abstract updateItem<K extends DataKey<T>>(collection: K, id: string, updates: Updates<T[K]>): void | PromiseLike<void>;

	/**
	 * Delete a specified item.
	 * - Should not throw if the item doesn't exist.
	 */
	abstract deleteItem<K extends DataKey<T>>(collection: K, id: string): void | PromiseLike<void>; // eslint-disable-line @typescript-eslint/no-unused-vars

	/**
	 * Count number of items in a query.
	 *
	 * @return Number of items the query matches.
	 */
	abstract countQuery<K extends DataKey<T>>(collection: K, query?: ItemQuery<T[K]>): number | PromiseLike<number>;

	/**
	 * Get all matching items.
	 *
	 * @return Set of values in `id: data` format.
	 */
	abstract getQuery<K extends DataKey<T>>(collection: K, query?: ItemQuery<T[K]>): Items<T[K]> | PromiseLike<Items<T[K]>>;

	/**
	 * Subscribe to all matching items with an async iterator.
	 */
	abstract getQuerySequence<K extends DataKey<T>>(collection: K, query?: ItemQuery<T[K]>): AsyncIterable<Items<T[K]>>;

	/**
	 * Set the data of all matching items.
	 *
	 * @param data Data to set matching items to.
	 * @return Number of items that were set.
	 */
	abstract setQuery<K extends DataKey<T>>(collection: K, query: ItemQuery<T[K]>, data: T[K]): void | PromiseLike<void>;

	/**
	 * Update the data of all matching items.
	 *
	 * @param updates Set of property updates to apply to matching items.
	 * @return Number of items that were updated.
	 */
	abstract updateQuery<K extends DataKey<T>>(collection: K, query: ItemQuery<T[K]>, updates: Updates<T[K]>): void | PromiseLike<void>;

	/**
	 * Delete all matching items.
	 * @return Number of items that were deleted.
	 */
	abstract deleteQuery<K extends DataKey<T>>(collection: K, query: ItemQuery<T[K]>): void | PromiseLike<void>;
}

/** Provider with a fully synchronous interface */
export abstract class Provider<T extends Database> extends AbstractProvider<T> {
	abstract override getItem<K extends DataKey<T>>(collection: K, id: string): OptionalItem<T[K]>;
	abstract override addItem<K extends DataKey<T>>(collection: K, data: T[K]): string;
	abstract override setItem<K extends DataKey<T>>(collection: K, id: string, data: T[K]): void;
	abstract override updateItem<K extends DataKey<T>>(collection: K, id: string, updates: Updates<T[K]>): void;
	abstract override deleteItem<K extends DataKey<T>>(collection: K, id: string): void; // eslint-disable-line @typescript-eslint/no-unused-vars
	abstract override countQuery<K extends DataKey<T>>(collection: K, query?: ItemQuery<T[K]>): number;
	abstract override getQuery<K extends DataKey<T>>(collection: K, query?: ItemQuery<T[K]>): Items<T[K]>;
	abstract override setQuery<K extends DataKey<T>>(collection: K, query: ItemQuery<T[K]>, data: T[K]): void;
	abstract override updateQuery<K extends DataKey<T>>(collection: K, query: ItemQuery<T[K]>, updates: Updates<T[K]>): void;
	abstract override deleteQuery<K extends DataKey<T>>(collection: K, query: ItemQuery<T[K]>): void;
}

/** Provider with a fully asynchronous interface */
export abstract class AsyncProvider<T extends Database> extends AbstractProvider<T> {
	abstract override getItem<K extends DataKey<T>>(collection: K, id: string): Promise<OptionalItem<T[K]>>;
	abstract override addItem<K extends DataKey<T>>(collection: K, data: T[K]): Promise<string>;
	abstract override setItem<K extends DataKey<T>>(collection: K, id: string, data: T[K]): Promise<void>;
	abstract override updateItem<K extends DataKey<T>>(collection: K, id: string, updates: Updates<T[K]>): Promise<void>;
	abstract override deleteItem<K extends DataKey<T>>(collection: K, id: string): Promise<void>; // eslint-disable-line @typescript-eslint/no-unused-vars
	abstract override countQuery<K extends DataKey<T>>(collection: K, query?: ItemQuery<T[K]>): Promise<number>;
	abstract override getQuery<K extends DataKey<T>>(collection: K, query?: ItemQuery<T[K]>): Promise<Items<T[K]>>;
	abstract override setQuery<K extends DataKey<T>>(collection: K, query: ItemQuery<T[K]>, data: T[K]): Promise<void>;
	abstract override updateQuery<K extends DataKey<T>>(collection: K, query: ItemQuery<T[K]>, updates: Updates<T[K]>): Promise<void>;
	abstract override deleteQuery<K extends DataKey<T>>(collection: K, query: ItemQuery<T[K]>): Promise<void>;
}
