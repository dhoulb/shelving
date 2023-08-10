import type { Data } from "../util/data.js";
import type { ItemArray, ItemQuery, ItemValue } from "../util/item.js";
import type { Updates } from "../util/update.js";

/** Provides access to data (e.g. IndexedDB, Firebase, or in-memory cache providers). */
export abstract class AbstractProvider {
	/**
	 * Get the value of a item.
	 *
	 * @return The item value, or `null` if it doesn't exist.
	 */
	abstract getItem<T extends Data>(collection: string, id: string): ItemValue<T> | PromiseLike<ItemValue<T>>;
	abstract getItem(collection: string, id: string): ItemValue | PromiseLike<ItemValue>;

	/**
	 * Subscribe to the value of this item with an async iterator.
	 */
	abstract getItemSequence<T extends Data>(collection: string, id: string): AsyncIterable<ItemValue<T>>;
	abstract getItemSequence(collection: string, id: string): AsyncIterable<ItemValue>;

	/**
	 * Create a new item with a random ID.
	 * - Created item is guaranteed to have a unique ID.
	 *
	 * @param data Complete data to set the item to.
	 * @return String ID for the created item (possibly promised).
	 */
	abstract addItem<T extends Data>(collection: string, data: T): string | PromiseLike<string>;
	abstract addItem(collection: string, data: Data): string | PromiseLike<string>;

	/**
	 * Set the data a item (whether it exists or not).
	 * @param data Data to set the item to.
	 */
	abstract setItem<T extends Data>(collection: string, id: string, data: T): void | PromiseLike<void>;
	abstract setItem(collection: string, id: string, data: Data): void | PromiseLike<void>;

	/**
	 * Update the data an existing item.
	 *
	 * @param updates Set of property updates to apply to the item.
	 * @throws Error If the item does not exist (ideally a `RequiredError` but may be provider-specific).
	 */
	abstract updateItem<T extends Data>(collection: string, id: string, updates: Updates<T>): void | PromiseLike<void>;
	abstract updateItem(collection: string, id: string, updates: Updates): void | PromiseLike<void>;

	/**
	 * Delete a specified item.
	 */
	abstract deleteItem<T extends Data>(collection: string, id: string): void | PromiseLike<void>; // eslint-disable-line @typescript-eslint/no-unused-vars
	abstract deleteItem(collection: string, id: string): void | PromiseLike<void>;

	/**
	 * Get all matching items.
	 *
	 * @return Set of values in `id: data` format.
	 */
	abstract getQuery<T extends Data>(collection: string, query: ItemQuery<T>): ItemArray<T> | PromiseLike<ItemArray<T>>;
	abstract getQuery(collection: string, query: ItemQuery): ItemArray | PromiseLike<ItemArray>;

	/**
	 * Subscribe to all matching items with an async iterator.
	 */
	abstract getQuerySequence<T extends Data>(collection: string, query: ItemQuery<T>): AsyncIterable<ItemArray<T>>;
	abstract getQuerySequence(collection: string, query: ItemQuery): AsyncIterable<ItemArray>;

	/**
	 * Set the data of all matching items.
	 *
	 * @param data Data to set matching items to.
	 * @return Number of items that were set.
	 */
	abstract setQuery<T extends Data>(collection: string, query: ItemQuery<T>, data: T): number | PromiseLike<number>;
	abstract setQuery(collection: string, query: ItemQuery, data: Data): number | PromiseLike<number>;

	/**
	 * Update the data of all matching items.
	 *
	 * @param updates Set of property updates to apply to matching items.
	 * @return Number of items that were updated.
	 */
	abstract updateQuery<T extends Data>(collection: string, query: ItemQuery<T>, updates: Updates<T>): number | PromiseLike<number>;
	abstract updateQuery(collection: string, query: ItemQuery, updates: Updates): number | PromiseLike<number>;

	/**
	 * Delete all matching items.
	 * @return Number of items that were deleted.
	 */
	abstract deleteQuery<T extends Data>(collection: string, query: ItemQuery<T>): number | PromiseLike<number>;
	abstract deleteQuery(collection: string, query: ItemQuery): number | PromiseLike<number>;
}

/** Provider with a fully synchronous interface */
export abstract class Provider extends AbstractProvider {
	abstract override getItem<T extends Data>(collection: string, id: string): ItemValue<T>;
	abstract override getItem(collection: string, id: string): ItemValue;
	abstract override addItem<T extends Data>(collection: string, data: T): string;
	abstract override addItem(collection: string, data: Data): string;
	abstract override setItem<T extends Data>(collection: string, id: string, data: T): void;
	abstract override setItem(collection: string, id: string, data: Data): void;
	abstract override updateItem<T extends Data>(collection: string, id: string, updates: Updates<T>): void;
	abstract override updateItem(collection: string, id: string, updates: Updates): void;
	abstract override deleteItem<T extends Data>(collection: string, id: string): void; // eslint-disable-line @typescript-eslint/no-unused-vars
	abstract override deleteItem(collection: string, id: string): void;
	abstract override getQuery<T extends Data>(collection: string, query: ItemQuery<T>): ItemArray<T>;
	abstract override getQuery(collection: string, query: ItemQuery): ItemArray;
	abstract override setQuery<T extends Data>(collection: string, query: ItemQuery<T>, data: T): number;
	abstract override setQuery(collection: string, query: ItemQuery, data: Data): number;
	abstract override updateQuery<T extends Data>(collection: string, query: ItemQuery<T>, updates: Updates<T>): number;
	abstract override updateQuery(collection: string, query: ItemQuery, updates: Updates): number;
	abstract override deleteQuery<T extends Data>(collection: string, query: ItemQuery<T>): number;
	abstract override deleteQuery(collection: string, query: ItemQuery): number;
}

/** Provider with a fully asynchronous interface */
export abstract class AsyncProvider extends AbstractProvider {
	abstract override getItem<T extends Data>(collection: string, id: string): Promise<ItemValue<T>>;
	abstract override getItem(collection: string, id: string): Promise<ItemValue>;
	abstract override addItem<T extends Data>(collection: string, data: T): Promise<string>;
	abstract override addItem(collection: string, data: Data): Promise<string>;
	abstract override setItem<T extends Data>(collection: string, id: string, data: T): Promise<void>;
	abstract override setItem(collection: string, id: string, data: Data): Promise<void>;
	abstract override updateItem<T extends Data>(collection: string, id: string, updates: Updates<T>): Promise<void>;
	abstract override updateItem(collection: string, id: string, updates: Updates): Promise<void>;
	abstract override deleteItem<T extends Data>(collection: string, id: string): Promise<void>; // eslint-disable-line @typescript-eslint/no-unused-vars
	abstract override deleteItem(collection: string, id: string): Promise<void>;
	abstract override getQuery<T extends Data>(collection: string, query: ItemQuery<T>): Promise<ItemArray<T>>;
	abstract override getQuery(collection: string, query: ItemQuery): Promise<ItemArray>;
	abstract override setQuery<T extends Data>(collection: string, query: ItemQuery<T>, data: T): Promise<number>;
	abstract override setQuery(collection: string, query: ItemQuery, data: Data): Promise<number>;
	abstract override updateQuery<T extends Data>(collection: string, query: ItemQuery<T>, updates: Updates<T>): Promise<number>;
	abstract override updateQuery(collection: string, query: ItemQuery, updates: Updates): Promise<number>;
	abstract override deleteQuery<T extends Data>(collection: string, query: ItemQuery<T>): Promise<number>;
	abstract override deleteQuery(collection: string, query: ItemQuery): Promise<number>;
}
