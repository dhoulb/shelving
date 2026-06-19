import type { Data } from "../../util/data.js";
import { awaitDispose } from "../../util/dispose.js";
import type { Identifier, Item, Items, ItemsSequence, OptionalItem, OptionalItemSequence } from "../../util/item.js";
import type { Query } from "../../util/query.js";
import type { Sourceable } from "../../util/source.js";
import type { Updates } from "../../util/update.js";
import type { Collection } from "../collection/Collection.js";
import type { DBProvider } from "./DBProvider.js";

/**
 * Database provider that passes every operation straight through to a wrapped `source` provider.
 *
 * - Base for the layered `Through*Provider` family (validation, caching, logging, change tracking); subclasses override individual methods to add behaviour and call `super` to delegate.
 * - Exposes `source` and implements `Sourceable`, so wrapped providers can be discovered with `getSource()` / `requireSource()`.
 *
 * @example
 *  const provider = new ValidationDBProvider(new MemoryDBProvider());
 *
 * @see https://dhoulb.github.io/shelving/db/provider/ThroughDBProvider/ThroughDBProvider
 */
export class ThroughDBProvider<I extends Identifier, T extends Data> implements DBProvider<I, T>, Sourceable<DBProvider<I, T>> {
	/**
	 * The wrapped source provider that every operation is delegated to.
	 *
	 * @see https://dhoulb.github.io/shelving/db/provider/ThroughDBProvider/ThroughDBProvider/source
	 */
	readonly source: DBProvider<I, T>;

	/**
	 * Create a new `ThroughDBProvider` wrapping a source provider.
	 *
	 * @param source The provider to delegate all operations to.
	 */
	constructor(source: DBProvider<I, T>) {
		this.source = source;
	}

	/**
	 * Get an item from a collection by its id, or `undefined` if it doesn't exist.
	 *
	 * @param collection Collection the item belongs to.
	 * @param id Identifier of the item to get.
	 * @returns The item, or `undefined` if no item exists with that id.
	 * @example await provider.getItem(users, 123) // Item or undefined.
	 * @see https://dhoulb.github.io/shelving/db/provider/ThroughDBProvider/ThroughDBProvider/getItem
	 */
	getItem<II extends I, TT extends T>(collection: Collection<string, II, TT>, id: II): Promise<OptionalItem<II, TT>> {
		return this.source.getItem(collection, id);
	}

	/**
	 * Get an item from a collection by its id, or throw if it doesn't exist.
	 *
	 * @param collection Collection the item belongs to.
	 * @param id Identifier of the item to get.
	 * @returns The item.
	 * @throws `RequiredError` if no item exists with that id.
	 * @example await provider.requireItem(users, 123) // Item (or throws).
	 * @see https://dhoulb.github.io/shelving/db/provider/ThroughDBProvider/ThroughDBProvider/requireItem
	 */
	requireItem<II extends I, TT extends T>(collection: Collection<string, II, TT>, id: II): Promise<Item<II, TT>> {
		return this.source.requireItem(collection, id);
	}

	/**
	 * Subscribe to live changes for a single item by its id.
	 *
	 * @param collection Collection the item belongs to.
	 * @param id Identifier of the item to subscribe to.
	 * @returns Async sequence yielding the item (or `undefined`) on every change.
	 * @example for await (const item of provider.getItemSequence(users, 123)) console.log(item);
	 * @see https://dhoulb.github.io/shelving/db/provider/ThroughDBProvider/ThroughDBProvider/getItemSequence
	 */
	getItemSequence<II extends I, TT extends T>(collection: Collection<string, II, TT>, id: II): OptionalItemSequence<II, TT> {
		return this.source.getItemSequence(collection, id);
	}

	/**
	 * Add a new item to a collection and return its generated id.
	 *
	 * @param collection Collection to add the item to.
	 * @param data Data for the new item.
	 * @returns The generated identifier for the new item.
	 * @example await provider.addItem(users, { name: "Dave" }) // 123
	 * @see https://dhoulb.github.io/shelving/db/provider/ThroughDBProvider/ThroughDBProvider/addItem
	 */
	addItem<II extends I, TT extends T>(collection: Collection<string, II, TT>, data: TT): Promise<II> {
		return this.source.addItem(collection, data);
	}

	/**
	 * Set (insert or overwrite) the data for an item by its id.
	 *
	 * @param collection Collection the item belongs to.
	 * @param id Identifier of the item to set.
	 * @param data Full data to store for the item.
	 * @example await provider.setItem(users, 123, { name: "Dave" });
	 * @see https://dhoulb.github.io/shelving/db/provider/ThroughDBProvider/ThroughDBProvider/setItem
	 */
	setItem<II extends I, TT extends T>(collection: Collection<string, II, TT>, id: II, data: TT): Promise<void> {
		return this.source.setItem(collection, id, data);
	}

	/**
	 * Apply partial updates to an existing item by its id.
	 *
	 * @param collection Collection the item belongs to.
	 * @param id Identifier of the item to update.
	 * @param updates Updates to apply to the item.
	 * @example await provider.updateItem(users, 123, { name: "Dave" });
	 * @see https://dhoulb.github.io/shelving/db/provider/ThroughDBProvider/ThroughDBProvider/updateItem
	 */
	updateItem<II extends I, TT extends T>(collection: Collection<string, II, TT>, id: II, updates: Updates<Item<II, TT>>): Promise<void> {
		return this.source.updateItem(collection, id, updates);
	}

	/**
	 * Delete an item from a collection by its id.
	 *
	 * @param collection Collection the item belongs to.
	 * @param id Identifier of the item to delete.
	 * @example await provider.deleteItem(users, 123);
	 * @see https://dhoulb.github.io/shelving/db/provider/ThroughDBProvider/ThroughDBProvider/deleteItem
	 */
	deleteItem<II extends I, TT extends T>(collection: Collection<string, II, TT>, id: II): Promise<void> {
		return this.source.deleteItem(collection, id);
	}

	/**
	 * Count the items in a collection matching an optional query.
	 *
	 * @param collection Collection to count items in.
	 * @param query Query to filter the counted items (counts all items when omitted).
	 * @returns The number of matching items.
	 * @example await provider.countQuery(users, { age: 40 }) // 7
	 * @see https://dhoulb.github.io/shelving/db/provider/ThroughDBProvider/ThroughDBProvider/countQuery
	 */
	countQuery<II extends I, TT extends T>(collection: Collection<string, II, TT>, query?: Query<Item<II, TT>>): Promise<number> {
		return this.source.countQuery(collection, query);
	}

	/**
	 * Get the items in a collection matching an optional query.
	 *
	 * @param collection Collection to query.
	 * @param query Query to filter, sort, and limit the items (returns all items when omitted).
	 * @returns An array of matching items.
	 * @example await provider.getQuery(users, { age: 40, $order: "name" }) // Items.
	 * @see https://dhoulb.github.io/shelving/db/provider/ThroughDBProvider/ThroughDBProvider/getQuery
	 */
	getQuery<II extends I, TT extends T>(collection: Collection<string, II, TT>, query?: Query<Item<II, TT>>): Promise<Items<II, TT>> {
		return this.source.getQuery(collection, query);
	}

	/**
	 * Subscribe to live changes for the result of a query.
	 *
	 * @param collection Collection to query.
	 * @param query Query to filter, sort, and limit the items.
	 * @returns Async sequence yielding the matching items on every change.
	 * @example for await (const items of provider.getQuerySequence(users, { age: 40 })) console.log(items);
	 * @see https://dhoulb.github.io/shelving/db/provider/ThroughDBProvider/ThroughDBProvider/getQuerySequence
	 */
	getQuerySequence<II extends I, TT extends T>(collection: Collection<string, II, TT>, query?: Query<Item<II, TT>>): ItemsSequence<II, TT> {
		return this.source.getQuerySequence(collection, query);
	}

	/**
	 * Set (overwrite) the data for every item matching a query.
	 *
	 * @param collection Collection to write to.
	 * @param query Query selecting the items to set.
	 * @param data Full data to store for each matching item.
	 * @example await provider.setQuery(users, { age: 40 }, { active: true });
	 * @see https://dhoulb.github.io/shelving/db/provider/ThroughDBProvider/ThroughDBProvider/setQuery
	 */
	setQuery<II extends I, TT extends T>(collection: Collection<string, II, TT>, query: Query<Item<II, TT>>, data: TT): Promise<void> {
		return this.source.setQuery(collection, query, data);
	}

	/**
	 * Apply partial updates to every item matching a query.
	 *
	 * @param collection Collection to write to.
	 * @param query Query selecting the items to update.
	 * @param updates Updates to apply to each matching item.
	 * @example await provider.updateQuery(users, { age: 40 }, { active: true });
	 * @see https://dhoulb.github.io/shelving/db/provider/ThroughDBProvider/ThroughDBProvider/updateQuery
	 */
	updateQuery<II extends I, TT extends T>(
		collection: Collection<string, II, TT>,
		query: Query<Item<II, TT>>,
		updates: Updates<TT>,
	): Promise<void> {
		return this.source.updateQuery(collection, query, updates);
	}

	/**
	 * Delete every item matching a query.
	 *
	 * @param collection Collection to delete from.
	 * @param query Query selecting the items to delete.
	 * @example await provider.deleteQuery(users, { active: false });
	 * @see https://dhoulb.github.io/shelving/db/provider/ThroughDBProvider/ThroughDBProvider/deleteQuery
	 */
	deleteQuery<II extends I, TT extends T>(collection: Collection<string, II, TT>, query: Query<Item<II, TT>>): Promise<void> {
		return this.source.deleteQuery(collection, query);
	}

	/**
	 * Get the first item matching a query, or `undefined` if there are none.
	 *
	 * @param collection Collection to query.
	 * @param query Query to filter and sort the items.
	 * @returns The first matching item, or `undefined` if none match.
	 * @example await provider.getFirst(users, { $order: "name" }) // Item or undefined.
	 * @see https://dhoulb.github.io/shelving/db/provider/ThroughDBProvider/ThroughDBProvider/getFirst
	 */
	getFirst<II extends I, TT extends T>(collection: Collection<string, II, TT>, query: Query<Item<II, TT>>): Promise<OptionalItem<II, TT>> {
		return this.source.getFirst(collection, query);
	}

	/**
	 * Get the first item matching a query, or throw if there are none.
	 *
	 * @param collection Collection to query.
	 * @param query Query to filter and sort the items.
	 * @returns The first matching item.
	 * @throws `RequiredError` if no item matches the query.
	 * @example await provider.requireFirst(users, { $order: "name" }) // Item (or throws).
	 * @see https://dhoulb.github.io/shelving/db/provider/ThroughDBProvider/ThroughDBProvider/requireFirst
	 */
	requireFirst<II extends I, TT extends T>(collection: Collection<string, II, TT>, query: Query<Item<II, TT>>): Promise<Item<II, TT>> {
		return this.source.requireFirst(collection, query);
	}

	// Implement `AsyncDisposable`
	async [Symbol.asyncDispose]() {
		await awaitDispose(
			this.source, // Dispose the source API provider.
		);
	}
}
