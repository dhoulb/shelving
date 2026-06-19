import { RequiredError } from "../../error/RequiredError.js";
import { countArray, getFirst } from "../../util/array.js";
import type { Data } from "../../util/data.js";
import { awaitDispose } from "../../util/dispose.js";
import type { Identifier, Item, Items, ItemsSequence, OptionalItem, OptionalItemSequence } from "../../util/item.js";
import type { Query } from "../../util/query.js";
import type { Updates } from "../../util/update.js";
import type { Collection } from "../collection/Collection.js";

/**
 * Provider with a fully asynchronous interface for database access.
 *
 * - Abstract base for every database provider; subclasses implement the storage backend (memory, SQL, remote, etc.).
 * - All operations are keyed by a `Collection`, which carries the name plus identifier and data schemas.
 * - Layered behaviour (caching, validation, logging) is added by wrapping a provider in a `Through*Provider`.
 *
 * @example
 *  const provider = new MemoryDBProvider();
 *  const id = await provider.addItem(users, { name: "Dave" });
 *
 * @see https://dhoulb.github.io/shelving/db/provider/DBProvider/DBProvider
 */
export abstract class DBProvider<I extends Identifier = Identifier, T extends Data = Data> implements AsyncDisposable {
	/**
	 * Get an item from a collection by its id, or `undefined` if it doesn't exist.
	 *
	 * @param collection Collection the item belongs to.
	 * @param id Identifier of the item to get.
	 * @returns The item, or `undefined` if no item exists with that id.
	 * @example await provider.getItem(users, 123) // Item or undefined.
	 * @see https://dhoulb.github.io/shelving/db/provider/DBProvider/DBProvider/getItem
	 */
	abstract getItem<II extends I, TT extends T>(collection: Collection<string, II, TT>, id: II): Promise<OptionalItem<II, TT>>;

	/**
	 * Get an item from a collection by its id, or throw if it doesn't exist.
	 *
	 * @param collection Collection the item belongs to.
	 * @param id Identifier of the item to get.
	 * @returns The item.
	 * @throws `RequiredError` if no item exists with that id.
	 * @example await provider.requireItem(users, 123) // Item (or throws).
	 * @see https://dhoulb.github.io/shelving/db/provider/DBProvider/DBProvider/requireItem
	 */
	async requireItem<II extends I, TT extends T>(collection: Collection<string, II, TT>, id: II): Promise<Item<II, TT>> {
		const item = await this.getItem(collection, id);
		if (!item)
			throw new RequiredError(`Item does not exist in collection "${collection.name}"`, {
				provider: this,
				collection,
				id,
				caller: this.requireItem,
			});
		return item;
	}

	/**
	 * Subscribe to live changes for a single item by its id.
	 *
	 * @param collection Collection the item belongs to.
	 * @param id Identifier of the item to subscribe to.
	 * @returns Async sequence yielding the item (or `undefined`) on every change.
	 * @example for await (const item of provider.getItemSequence(users, 123)) console.log(item);
	 * @see https://dhoulb.github.io/shelving/db/provider/DBProvider/DBProvider/getItemSequence
	 */
	abstract getItemSequence<II extends I, TT extends T>(collection: Collection<string, II, TT>, id: II): OptionalItemSequence<II, TT>;

	/**
	 * Add a new item to a collection and return its generated id.
	 *
	 * @param collection Collection to add the item to.
	 * @param data Data for the new item.
	 * @returns The generated identifier for the new item.
	 * @example await provider.addItem(users, { name: "Dave" }) // 123
	 * @see https://dhoulb.github.io/shelving/db/provider/DBProvider/DBProvider/addItem
	 */
	abstract addItem<II extends I, TT extends T>(collection: Collection<string, II, TT>, data: TT): Promise<II>;

	/**
	 * Set (insert or overwrite) the data for an item by its id.
	 *
	 * @param collection Collection the item belongs to.
	 * @param id Identifier of the item to set.
	 * @param data Full data to store for the item.
	 * @example await provider.setItem(users, 123, { name: "Dave" });
	 * @see https://dhoulb.github.io/shelving/db/provider/DBProvider/DBProvider/setItem
	 */
	abstract setItem<II extends I, TT extends T>(collection: Collection<string, II, TT>, id: II, data: TT): Promise<void>;

	/**
	 * Apply partial updates to an existing item by its id.
	 *
	 * @param collection Collection the item belongs to.
	 * @param id Identifier of the item to update.
	 * @param updates Updates to apply to the item.
	 * @example await provider.updateItem(users, 123, { name: "Dave" });
	 * @see https://dhoulb.github.io/shelving/db/provider/DBProvider/DBProvider/updateItem
	 */
	abstract updateItem<II extends I, TT extends T>(
		collection: Collection<string, II, TT>,
		id: II,
		updates: Updates<Item<II, TT>>,
	): Promise<void>;

	/**
	 * Delete an item from a collection by its id.
	 *
	 * @param collection Collection the item belongs to.
	 * @param id Identifier of the item to delete.
	 * @example await provider.deleteItem(users, 123);
	 * @see https://dhoulb.github.io/shelving/db/provider/DBProvider/DBProvider/deleteItem
	 */
	abstract deleteItem<II extends I, TT extends T>(collection: Collection<string, II, TT>, id: II): Promise<void>;

	/**
	 * Count the items in a collection matching an optional query.
	 *
	 * @param collection Collection to count items in.
	 * @param query Query to filter the counted items (counts all items when omitted).
	 * @returns The number of matching items.
	 * @example await provider.countQuery(users, { age: 40 }) // 7
	 * @see https://dhoulb.github.io/shelving/db/provider/DBProvider/DBProvider/countQuery
	 */
	async countQuery<II extends I, TT extends T>(collection: Collection<string, II, TT>, query?: Query<Item<II, TT>>): Promise<number> {
		return countArray(await this.getQuery(collection, query));
	}

	/**
	 * Get the items in a collection matching an optional query.
	 *
	 * @param collection Collection to query.
	 * @param query Query to filter, sort, and limit the items (returns all items when omitted).
	 * @returns An array of matching items.
	 * @example await provider.getQuery(users, { age: 40, $order: "name" }) // Items.
	 * @see https://dhoulb.github.io/shelving/db/provider/DBProvider/DBProvider/getQuery
	 */
	abstract getQuery<II extends I, TT extends T>(
		collection: Collection<string, II, TT>,
		query?: Query<Item<II, TT>>,
	): Promise<Items<II, TT>>;

	/**
	 * Subscribe to live changes for the result of a query.
	 *
	 * @param collection Collection to query.
	 * @param query Query to filter, sort, and limit the items.
	 * @returns Async sequence yielding the matching items on every change.
	 * @example for await (const items of provider.getQuerySequence(users, { age: 40 })) console.log(items);
	 * @see https://dhoulb.github.io/shelving/db/provider/DBProvider/DBProvider/getQuerySequence
	 */
	abstract getQuerySequence<II extends I, TT extends T>(
		collection: Collection<string, II, TT>,
		query?: Query<Item<II, TT>>,
	): ItemsSequence<II, TT>;

	/**
	 * Set (overwrite) the data for every item matching a query.
	 *
	 * @param collection Collection to write to.
	 * @param query Query selecting the items to set.
	 * @param data Full data to store for each matching item.
	 * @example await provider.setQuery(users, { age: 40 }, { active: true });
	 * @see https://dhoulb.github.io/shelving/db/provider/DBProvider/DBProvider/setQuery
	 */
	abstract setQuery<II extends I, TT extends T>(
		collection: Collection<string, II, TT>,
		query: Query<Item<II, TT>>,
		data: TT,
	): Promise<void>;

	/**
	 * Apply partial updates to every item matching a query.
	 *
	 * @param collection Collection to write to.
	 * @param query Query selecting the items to update.
	 * @param updates Updates to apply to each matching item.
	 * @example await provider.updateQuery(users, { age: 40 }, { active: true });
	 * @see https://dhoulb.github.io/shelving/db/provider/DBProvider/DBProvider/updateQuery
	 */
	abstract updateQuery<II extends I, TT extends T>(
		collection: Collection<string, II, TT>,
		query: Query<Item<II, TT>>,
		updates: Updates<TT>,
	): Promise<void>;

	/**
	 * Delete every item matching a query.
	 *
	 * @param collection Collection to delete from.
	 * @param query Query selecting the items to delete.
	 * @example await provider.deleteQuery(users, { active: false });
	 * @see https://dhoulb.github.io/shelving/db/provider/DBProvider/DBProvider/deleteQuery
	 */
	abstract deleteQuery<II extends I, TT extends T>(collection: Collection<string, II, TT>, query: Query<Item<II, TT>>): Promise<void>;

	/**
	 * Get the first item matching a query, or `undefined` if there are none.
	 *
	 * @param collection Collection to query.
	 * @param query Query to filter and sort the items.
	 * @returns The first matching item, or `undefined` if none match.
	 * @example await provider.getFirst(users, { $order: "name" }) // Item or undefined.
	 * @see https://dhoulb.github.io/shelving/db/provider/DBProvider/DBProvider/getFirst
	 */
	async getFirst<II extends I, TT extends T>(
		collection: Collection<string, II, TT>,
		query: Query<Item<II, TT>>,
	): Promise<OptionalItem<II, TT>> {
		return getFirst(await this.getQuery(collection, { ...query, $limit: 1 }));
	}

	/**
	 * Get the first item matching a query, or throw if there are none.
	 *
	 * @param collection Collection to query.
	 * @param query Query to filter and sort the items.
	 * @returns The first matching item.
	 * @throws `RequiredError` if no item matches the query.
	 * @example await provider.requireFirst(users, { $order: "name" }) // Item (or throws).
	 * @see https://dhoulb.github.io/shelving/db/provider/DBProvider/DBProvider/requireFirst
	 */
	async requireFirst<II extends I, TT extends T>(
		collection: Collection<string, II, TT>,
		query: Query<Item<II, TT>>,
	): Promise<Item<II, TT>> {
		const first = await this.getFirst(collection, query);
		if (!first)
			throw new RequiredError(`First item does not exist in collection "${collection.name}"`, {
				provider: this,
				collection,
				query,
				caller: this.requireFirst,
			});
		return first;
	}

	// Implement `AsyncDisposable`
	async [Symbol.asyncDispose]() {
		await awaitDispose(
			// Empty by default.
		);
	}
}
