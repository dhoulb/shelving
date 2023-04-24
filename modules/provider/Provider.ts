import type { Updates } from "../update/DataUpdate.js";
import type { Data } from "../util/data.js";
import type { ItemArray, ItemStatement, ItemValue } from "../db/Item.js";

/** Provides access to data (e.g. IndexedDB, Firebase, or in-memory cache providers). */
abstract class AbstractProvider {
	/**
	 * Get the value of a item.
	 *
	 * @return The item value, or `null` if it doesn't exist.
	 */
	abstract getItem(collection: string, id: string): ItemValue | PromiseLike<ItemValue>;

	/**
	 * Subscribe to the value of this item with an async iterator.
	 */
	abstract getItemSequence(collection: string, id: string): AsyncIterable<ItemValue>;

	/**
	 * Create a new item with a random ID.
	 * - Created item is guaranteed to have a unique ID.
	 *
	 * @param data Complete data to set the item to.
	 * @return String ID for the created item (possibly promised).
	 */
	abstract addItem(collection: string, data: Data): string | PromiseLike<string>;

	/**
	 * Set the data a item (whether it exists or not).
	 * @param data Data to set the item to.
	 */
	abstract setItem(collection: string, id: string, data: Data): void | PromiseLike<void>;

	/**
	 * Update the data an existing item.
	 *
	 * @param updates Set of property updates to apply to the item.
	 * @throws Error If the item does not exist (ideally a `RequiredError` but may be provider-specific).
	 */
	abstract updateItem(collection: string, id: string, updates: Updates): void | PromiseLike<void>;

	/**
	 * Delete a specified item.
	 */
	abstract deleteItem(collection: string, id: string): void | PromiseLike<void>;

	/**
	 * Get all matching items.
	 *
	 * @return Set of values in `id: data` format.
	 */
	abstract getQuery(collection: string, constraints: ItemStatement): ItemArray | PromiseLike<ItemArray>;

	/**
	 * Subscribe to all matching items with an async iterator.
	 */
	abstract getQuerySequence(collection: string, constraints: ItemStatement): AsyncIterable<ItemArray>;

	/**
	 * Set the data of all matching items.
	 *
	 * @param data Data to set matching items to.
	 * @return Number of items that were set.
	 */
	abstract setQuery(collection: string, constraints: ItemStatement, data: Data): number | PromiseLike<number>;

	/**
	 * Update the data of all matching items.
	 *
	 * @param updates Set of property updates to apply to matching items.
	 * @return Number of items that were updated.
	 */
	abstract updateQuery(collection: string, constraints: ItemStatement, updates: Updates): number | PromiseLike<number>;

	/**
	 * Delete all matching items.
	 * @return Number of items that were deleted.
	 */
	abstract deleteQuery(collection: string, constraints: ItemStatement): number | PromiseLike<number>;
}

/** Provider with a fully synchronous interface */
export abstract class Provider extends AbstractProvider {
	abstract override getItem(collection: string, id: string): ItemValue;
	abstract override addItem(collection: string, data: Data): string;
	abstract override setItem(collection: string, id: string, data: Data): void;
	abstract override updateItem(collection: string, id: string, updates: Updates): void;
	abstract override deleteItem(collection: string, id: string): void;
	abstract override getQuery(collection: string, constraints: ItemStatement): ItemArray;
	abstract override setQuery(collection: string, constraints: ItemStatement, data: Data): number;
	abstract override updateQuery(collection: string, constraints: ItemStatement, updates: Updates): number;
	abstract override deleteQuery(collection: string, constraints: ItemStatement): number;
}

/** Provider with a fully asynchronous interface */
export abstract class AsyncProvider extends AbstractProvider {
	abstract override getItem(collection: string, id: string): Promise<ItemValue>;
	abstract override addItem(collection: string, data: Data): Promise<string>;
	abstract override setItem(collection: string, id: string, data: Data): Promise<void>;
	abstract override updateItem(collection: string, id: string, updates: Updates): Promise<void>;
	abstract override deleteItem(collection: string, id: string): Promise<void>;
	abstract override getQuery(collection: string, constraints: ItemStatement): Promise<ItemArray>;
	abstract override setQuery(collection: string, constraints: ItemStatement, data: Data): Promise<number>;
	abstract override updateQuery(collection: string, constraints: ItemStatement, updates: Updates): Promise<number>;
	abstract override deleteQuery(collection: string, constraints: ItemStatement): Promise<number>;
}
