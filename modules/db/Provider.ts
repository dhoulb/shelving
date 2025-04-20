import { NotFoundError } from "../error/request/NotFoundError.js";
import { countArray, getOptionalFirstItem } from "../util/array.js";
import type { DataKey, Database } from "../util/data.js";
import type { Item, ItemQuery, Items, OptionalItem } from "../util/item.js";
import type { Updates } from "../util/update.js";

/** Provides access to data (e.g. IndexedDB, Firebase, or in-memory cache providers). */
export interface AbstractProvider<T extends Database> {
	/**
	 * Get an item.
	 */
	getItem<K extends DataKey<T>>(collection: K, id: string): OptionalItem<T[K]> | PromiseLike<OptionalItem<T[K]>>;

	/**
	 * Require an item.
	 */
	requireItem<K extends DataKey<T>>(collection: K, id: string): Item<T[K]> | PromiseLike<Item<T[K]>>;

	/**
	 * Subscribe to the value of this item with an async iterator.
	 */
	getItemSequence<K extends DataKey<T>>(collection: K, id: string): AsyncIterable<OptionalItem<T[K]>>;

	/**
	 * Create a new item with a random ID.
	 * - Created item is guaranteed to have a unique ID.
	 *
	 * @param data Complete data to set the item to.
	 * @return String ID for the created item (possibly promised).
	 */
	addItem<K extends DataKey<T>>(collection: K, data: T[K]): string | PromiseLike<string>;

	/**
	 * Set an item.
	 *
	 * @param data Data to set the item to.
	 */
	setItem<K extends DataKey<T>>(collection: K, id: string, data: T[K]): void | PromiseLike<void>;

	/**
	 * Update an item.
	 * - Should not throw if the item doesn't exist.
	 *
	 * @param updates Set of property updates to apply to the item.
	 */
	updateItem<K extends DataKey<T>>(collection: K, id: string, updates: Updates<T[K]>): void | PromiseLike<void>;

	/**
	 * Delete a specified item.
	 * - Should not throw if the item doesn't exist.
	 */
	deleteItem<K extends DataKey<T>>(collection: K, id: string): void | PromiseLike<void>;

	/**
	 * Count number of items in a query.
	 *
	 * @return Number of items the query matches.
	 */
	countQuery<K extends DataKey<T>>(collection: K, query?: ItemQuery<T[K]>): number | PromiseLike<number>;

	/**
	 * Get all matching items.
	 *
	 * @return Set of values in `id: data` format.
	 */
	getQuery<K extends DataKey<T>>(collection: K, query?: ItemQuery<T[K]>): Items<T[K]> | PromiseLike<Items<T[K]>>;

	/**
	 * Subscribe to all matching items with an async iterator.
	 */
	getQuerySequence<K extends DataKey<T>>(collection: K, query?: ItemQuery<T[K]>): AsyncIterable<Items<T[K]>>;

	/**
	 * Set the data of all matching items.
	 *
	 * @param data Data to set matching items to.
	 * @return Number of items that were set.
	 */
	setQuery<K extends DataKey<T>>(collection: K, query: ItemQuery<T[K]>, data: T[K]): void | PromiseLike<void>;

	/**
	 * Update the data of all matching items.
	 *
	 * @param updates Set of property updates to apply to matching items.
	 * @return Number of items that were updated.
	 */
	updateQuery<K extends DataKey<T>>(collection: K, query: ItemQuery<T[K]>, updates: Updates<T[K]>): void | PromiseLike<void>;

	/**
	 * Delete all matching items.
	 * @return Number of items that were deleted.
	 */
	deleteQuery<K extends DataKey<T>>(collection: K, query: ItemQuery<T[K]>): void | PromiseLike<void>;

	/** Get the first matching item. */
	getFirst<K extends DataKey<T>>(collection: K, query: ItemQuery<T[K]>): OptionalItem<T[K]> | PromiseLike<OptionalItem<T[K]>>;

	/** Require the first matching item. */
	requireFirst<K extends DataKey<T>>(collection: K, query: ItemQuery<T[K]>): Item<T[K]> | PromiseLike<Item<T[K]>>;
}

/** Provider with a fully synchronous interface */
export abstract class Provider<T extends Database> implements AbstractProvider<T> {
	abstract getItem<K extends DataKey<T>>(collection: K, id: string): OptionalItem<T[K]>;
	requireItem<K extends DataKey<T>>(collection: K, id: string): Item<T[K]> {
		const item = this.getItem(collection, id);
		if (!item) throw new NotFoundError(`Item must exist in "${collection}"`, id);
		return item;
	}
	abstract getItemSequence<K extends DataKey<T>>(collection: K, id: string): AsyncIterable<OptionalItem<T[K]>>;
	abstract addItem<K extends DataKey<T>>(collection: K, data: T[K]): string;
	abstract setItem<K extends DataKey<T>>(collection: K, id: string, data: T[K]): void;
	abstract updateItem<K extends DataKey<T>>(collection: K, id: string, updates: Updates<T[K]>): void;
	abstract deleteItem<K extends DataKey<T>>(collection: K, id: string): void;
	abstract getQuery<K extends DataKey<T>>(collection: K, query?: ItemQuery<T[K]>): Items<T[K]>;
	countQuery<K extends DataKey<T>>(collection: K, query?: ItemQuery<T[K]>): number {
		return countArray(this.getQuery(collection, query));
	}
	abstract getQuerySequence<K extends DataKey<T>>(collection: K, query?: ItemQuery<T[K]>): AsyncIterable<Items<T[K]>>;
	abstract setQuery<K extends DataKey<T>>(collection: K, query: ItemQuery<T[K]>, data: T[K]): void;
	abstract updateQuery<K extends DataKey<T>>(collection: K, query: ItemQuery<T[K]>, updates: Updates<T[K]>): void;
	abstract deleteQuery<K extends DataKey<T>>(collection: K, query: ItemQuery<T[K]>): void;
	getFirst<K extends DataKey<T>>(collection: K, query: ItemQuery<T[K]>): OptionalItem<T[K]> {
		return getOptionalFirstItem(this.getQuery(collection, { ...query, $limit: 1 }));
	}
	requireFirst<K extends DataKey<T>>(collection: K, query: ItemQuery<T[K]>): Item<T[K]> {
		const first = this.getFirst(collection, query);
		if (!first) throw new NotFoundError(`First item must exist in "${collection}"`, query);
		return first;
	}
}

/** Provider with a fully asynchronous interface */
export abstract class AsyncProvider<T extends Database> implements AbstractProvider<T> {
	abstract getItem<K extends DataKey<T>>(collection: K, id: string): Promise<OptionalItem<T[K]>>;
	async requireItem<K extends DataKey<T>>(collection: K, id: string): Promise<Item<T[K]>> {
		const item = await this.getItem(collection, id);
		if (!item) throw new NotFoundError(`Item must exist in "${collection}"`, id);
		return item;
	}
	abstract getItemSequence<K extends DataKey<T>>(collection: K, id: string): AsyncIterable<OptionalItem<T[K]>>;
	abstract addItem<K extends DataKey<T>>(collection: K, data: T[K]): Promise<string>;
	abstract setItem<K extends DataKey<T>>(collection: K, id: string, data: T[K]): Promise<void>;
	abstract updateItem<K extends DataKey<T>>(collection: K, id: string, updates: Updates<T[K]>): Promise<void>;
	abstract deleteItem<K extends DataKey<T>>(collection: K, id: string): Promise<void>;
	abstract getQuery<K extends DataKey<T>>(collection: K, query?: ItemQuery<T[K]>): Promise<Items<T[K]>>;
	async countQuery<K extends DataKey<T>>(collection: K, query?: ItemQuery<T[K]>): Promise<number> {
		return countArray(await this.getQuery(collection, query));
	}
	abstract getQuerySequence<K extends DataKey<T>>(collection: K, query?: ItemQuery<T[K]>): AsyncIterable<Items<T[K]>>;
	abstract setQuery<K extends DataKey<T>>(collection: K, query: ItemQuery<T[K]>, data: T[K]): Promise<void>;
	abstract updateQuery<K extends DataKey<T>>(collection: K, query: ItemQuery<T[K]>, updates: Updates<T[K]>): Promise<void>;
	abstract deleteQuery<K extends DataKey<T>>(collection: K, query: ItemQuery<T[K]>): Promise<void>;
	async getFirst<K extends DataKey<T>>(collection: K, query: ItemQuery<T[K]>): Promise<OptionalItem<T[K]>> {
		return getOptionalFirstItem(await this.getQuery(collection, { ...query, $limit: 1 }));
	}
	async requireFirst<K extends DataKey<T>>(collection: K, query: ItemQuery<T[K]>): Promise<Item<T[K]>> {
		const first = await this.getFirst(collection, query);
		if (!first) throw new NotFoundError(`First item must exist in "${collection}"`, query);
		return first;
	}
}
