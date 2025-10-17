import { RequiredError } from "../error/RequiredError.js";
import { countArray, getFirst } from "../util/array.js";
import type { Database, DataKey } from "../util/data.js";
import type { Identifier, Item, Items, OptionalItem } from "../util/item.js";
import type { ItemQuery } from "../util/query.js";
import type { Updates } from "../util/update.js";

/** Provides access to data (e.g. IndexedDB, Firebase, or in-memory cache providers). */
export interface AbstractProvider<I extends Identifier, T extends Database> {
	/**
	 * Get an item.
	 */
	getItem<K extends DataKey<T>>(collection: K, id: I): OptionalItem<I, T[K]> | PromiseLike<OptionalItem<I, T[K]>>;

	/**
	 * Require an item.
	 */
	requireItem<K extends DataKey<T>>(collection: K, id: I): Item<I, T[K]> | PromiseLike<Item<I, T[K]>>;

	/**
	 * Subscribe to the value of this item with an async iterator.
	 */
	getItemSequence<K extends DataKey<T>>(collection: K, id: I): AsyncIterable<OptionalItem<I, T[K]>>;

	/**
	 * Create a new item with a random ID.
	 * - Created item is guaranteed to have a unique ID.
	 *
	 * @param data Complete data to set the item to.
	 * @return String ID for the created item (possibly promised).
	 */
	addItem<K extends DataKey<T>>(collection: K, data: T[K]): I | PromiseLike<I>;

	/**
	 * Set an item.
	 *
	 * @param data Data to set the item to.
	 */
	setItem<K extends DataKey<T>>(collection: K, id: I, data: T[K]): void | PromiseLike<void>;

	/**
	 * Update an item.
	 * - Should not throw if the item doesn't exist.
	 *
	 * @param updates Set of property updates to apply to the item.
	 */
	updateItem<K extends DataKey<T>>(collection: K, id: I, updates: Updates<T[K]>): void | PromiseLike<void>;

	/**
	 * Delete a specified item.
	 * - Should not throw if the item doesn't exist.
	 */
	deleteItem<K extends DataKey<T>>(collection: K, id: I): void | PromiseLike<void>;

	/**
	 * Count number of items in a query.
	 *
	 * @return Number of items the query matches.
	 */
	countQuery<K extends DataKey<T>>(collection: K, query?: ItemQuery<I, T[K]>): number | PromiseLike<number>;

	/**
	 * Get all matching items.
	 *
	 * @return Set of values in `id: data` format.
	 */
	getQuery<K extends DataKey<T>>(collection: K, query?: ItemQuery<I, T[K]>): Items<I, T[K]> | PromiseLike<Items<I, T[K]>>;

	/**
	 * Subscribe to all matching items with an async iterator.
	 */
	getQuerySequence<K extends DataKey<T>>(collection: K, query?: ItemQuery<I, T[K]>): AsyncIterable<Items<I, T[K]>>;

	/**
	 * Set the data of all matching items.
	 *
	 * @param data Data to set matching items to.
	 * @return Number of items that were set.
	 */
	setQuery<K extends DataKey<T>>(collection: K, query: ItemQuery<I, T[K]>, data: T[K]): void | PromiseLike<void>;

	/**
	 * Update the data of all matching items.
	 *
	 * @param updates Set of property updates to apply to matching items.
	 * @return Number of items that were updated.
	 */
	updateQuery<K extends DataKey<T>>(collection: K, query: ItemQuery<I, T[K]>, updates: Updates<T[K]>): void | PromiseLike<void>;

	/**
	 * Delete all matching items.
	 * @return Number of items that were deleted.
	 */
	deleteQuery<K extends DataKey<T>>(collection: K, query: ItemQuery<I, T[K]>): void | PromiseLike<void>;

	/** Get the first matching item. */
	getFirst<K extends DataKey<T>>(collection: K, query: ItemQuery<I, T[K]>): OptionalItem<I, T[K]> | PromiseLike<OptionalItem<I, T[K]>>;

	/** Require the first matching item. */
	requireFirst<K extends DataKey<T>>(collection: K, query: ItemQuery<I, T[K]>): Item<I, T[K]> | PromiseLike<Item<I, T[K]>>;
}

/** Provider with a fully synchronous interface */
export abstract class Provider<I extends Identifier, T extends Database> implements AbstractProvider<I, T> {
	abstract getItem<K extends DataKey<T>>(collection: K, id: I): OptionalItem<I, T[K]>;
	requireItem<K extends DataKey<T>>(collection: K, id: I): Item<I, T[K]> {
		const item = this.getItem(collection, id);
		if (!item)
			throw new RequiredError(`Item does not exist in collection "${collection}"`, {
				provider: this,
				collection,
				id,
				caller: this.getItem,
			});
		return item;
	}
	abstract getItemSequence<K extends DataKey<T>>(collection: K, id: I): AsyncIterable<OptionalItem<I, T[K]>>;
	abstract addItem<K extends DataKey<T>>(collection: K, data: T[K]): I;
	abstract setItem<K extends DataKey<T>>(collection: K, id: I, data: T[K]): void;
	abstract updateItem<K extends DataKey<T>>(collection: K, id: I, updates: Updates<T[K]>): void;
	abstract deleteItem<K extends DataKey<T>>(collection: K, id: I): void;
	abstract getQuery<K extends DataKey<T>>(collection: K, query?: ItemQuery<I, T[K]>): Items<I, T[K]>;
	countQuery<K extends DataKey<T>>(collection: K, query?: ItemQuery<I, T[K]>): number {
		return countArray(this.getQuery(collection, query));
	}
	abstract getQuerySequence<K extends DataKey<T>>(collection: K, query?: ItemQuery<I, T[K]>): AsyncIterable<Items<I, T[K]>>;
	abstract setQuery<K extends DataKey<T>>(collection: K, query: ItemQuery<I, T[K]>, data: T[K]): void;
	abstract updateQuery<K extends DataKey<T>>(collection: K, query: ItemQuery<I, T[K]>, updates: Updates<T[K]>): void;
	abstract deleteQuery<K extends DataKey<T>>(collection: K, query: ItemQuery<I, T[K]>): void;
	getFirst<K extends DataKey<T>>(collection: K, query: ItemQuery<I, T[K]>): OptionalItem<I, T[K]> {
		return getFirst(this.getQuery(collection, { ...query, $limit: 1 }));
	}
	requireFirst<K extends DataKey<T>>(collection: K, query: ItemQuery<I, T[K]>): Item<I, T[K]> {
		const first = this.getFirst(collection, query);
		if (!first)
			throw new RequiredError(`First item does not exist in collection "${collection}"`, {
				provider: this,
				collection,
				query,
				caller: this.requireFirst,
			});
		return first;
	}
}

/** Provider with a fully asynchronous interface */
export abstract class AsyncProvider<I extends Identifier, T extends Database> implements AbstractProvider<I, T> {
	abstract getItem<K extends DataKey<T>>(collection: K, id: I): Promise<OptionalItem<I, T[K]>>;
	async requireItem<K extends DataKey<T>>(collection: K, id: I): Promise<Item<I, T[K]>> {
		const item = await this.getItem(collection, id);
		if (!item)
			throw new RequiredError(`Item does not exist in collection "${collection}"`, {
				provider: this,
				collection,
				id,
				caller: this.requireItem,
			});
		return item;
	}
	abstract getItemSequence<K extends DataKey<T>>(collection: K, id: I): AsyncIterable<OptionalItem<I, T[K]>>;
	abstract addItem<K extends DataKey<T>>(collection: K, data: T[K]): Promise<I>;
	abstract setItem<K extends DataKey<T>>(collection: K, id: I, data: T[K]): Promise<void>;
	abstract updateItem<K extends DataKey<T>>(collection: K, id: I, updates: Updates<T[K]>): Promise<void>;
	abstract deleteItem<K extends DataKey<T>>(collection: K, id: I): Promise<void>;
	abstract getQuery<K extends DataKey<T>>(collection: K, query?: ItemQuery<I, T[K]>): Promise<Items<I, T[K]>>;
	async countQuery<K extends DataKey<T>>(collection: K, query?: ItemQuery<I, T[K]>): Promise<number> {
		return countArray(await this.getQuery(collection, query));
	}
	abstract getQuerySequence<K extends DataKey<T>>(collection: K, query?: ItemQuery<I, T[K]>): AsyncIterable<Items<I, T[K]>>;
	abstract setQuery<K extends DataKey<T>>(collection: K, query: ItemQuery<I, T[K]>, data: T[K]): Promise<void>;
	abstract updateQuery<K extends DataKey<T>>(collection: K, query: ItemQuery<I, T[K]>, updates: Updates<T[K]>): Promise<void>;
	abstract deleteQuery<K extends DataKey<T>>(collection: K, query: ItemQuery<I, T[K]>): Promise<void>;
	async getFirst<K extends DataKey<T>>(collection: K, query: ItemQuery<I, T[K]>): Promise<OptionalItem<I, T[K]>> {
		return getFirst(await this.getQuery(collection, { ...query, $limit: 1 }));
	}
	async requireFirst<K extends DataKey<T>>(collection: K, query: ItemQuery<I, T[K]>): Promise<Item<I, T[K]>> {
		const first = await this.getFirst(collection, query);
		if (!first)
			throw new RequiredError(`First item does not exist in collection "${collection}"`, {
				provider: this,
				collection,
				query,
				caller: this.requireFirst,
			});
		return first;
	}
}
