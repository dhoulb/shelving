import { ANSI_FAILURE, ANSI_LEFT, ANSI_RIGHT, ANSI_SUCCESS } from "../../util/ansi.js";
import type { Data } from "../../util/data.js";
import type { Identifier, Item, Items, ItemsSequence, OptionalItem, OptionalItemSequence } from "../../util/item.js";
import type { Query } from "../../util/query.js";
import type { Updates } from "../../util/update.js";
import type { Collection } from "../collection/Collection.js";
import { ThroughDBProvider } from "./ThroughDBProvider.js";

/**
 * Database provider that logs every operation it performs to the console for debugging.
 *
 * - Wraps a `source` provider and writes `console.debug` lines (with ANSI direction markers) before and after each call, and `console.error` on failure.
 * - Drop it into a provider chain while developing to trace database reads and writes; it changes no data.
 *
 * @example
 *  const provider = new DebugDBProvider(new MemoryDBProvider());
 *  await provider.getItem(users, 123); // Logs the call and its result.
 *
 * @see https://dhoulb.github.io/shelving/db/provider/DebugDBProvider/DebugDBProvider
 */
export class DebugDBProvider<I extends Identifier, T extends Data> extends ThroughDBProvider<I, T> {
	/**
	 * Get an item by its id, logging the call and result.
	 *
	 * @param collection Collection the item belongs to.
	 * @param id Identifier of the item to get.
	 * @returns The item, or `undefined` if no item exists with that id.
	 * @example await provider.getItem(users, 123) // Item or undefined.
	 * @see https://dhoulb.github.io/shelving/db/provider/DebugDBProvider/DebugDBProvider/getItem
	 */
	override async getItem<II extends I, TT extends T>(collection: Collection<string, II, TT>, id: II): Promise<OptionalItem<II, TT>> {
		try {
			console.debug(`${ANSI_RIGHT} GET ITEM`, collection.name, id);
			const item = await super.getItem(collection, id);
			console.debug(`${ANSI_LEFT} GET ITEM`, collection.name, id, item);
			return item;
		} catch (reason) {
			console.error(`${ANSI_FAILURE} GET ITEM`, collection.name, id, reason);
			throw reason;
		}
	}

	/**
	 * Subscribe to live changes for a single item, logging each emission.
	 *
	 * @param collection Collection the item belongs to.
	 * @param id Identifier of the item to subscribe to.
	 * @returns Async sequence yielding the item (or `undefined`) on every change.
	 * @example for await (const item of provider.getItemSequence(users, 123)) console.log(item);
	 * @see https://dhoulb.github.io/shelving/db/provider/DebugDBProvider/DebugDBProvider/getItemSequence
	 */
	override async *getItemSequence<II extends I, TT extends T>(
		collection: Collection<string, II, TT>,
		id: II,
	): OptionalItemSequence<II, TT> {
		try {
			console.debug(`${ANSI_RIGHT} SEQUENCE ITEM`, collection.name, id);
			for await (const item of super.getItemSequence(collection, id)) {
				console.debug(`${ANSI_LEFT} SEQUENCE ITEM`, collection.name, id, item);
				yield item;
			}
			console.debug(`${ANSI_SUCCESS} SEQUENCE ITEM`, collection.name, id);
		} catch (thrown) {
			console.error(`${ANSI_FAILURE} SEQUENCE ITEM`, collection.name, id, thrown);
		}
	}

	/**
	 * Add a new item, logging the call and generated id.
	 *
	 * @param collection Collection to add the item to.
	 * @param data Data for the new item.
	 * @returns The generated identifier for the new item.
	 * @example await provider.addItem(users, { name: "Dave" }) // 123
	 * @see https://dhoulb.github.io/shelving/db/provider/DebugDBProvider/DebugDBProvider/addItem
	 */
	override async addItem<II extends I, TT extends T>(collection: Collection<string, II, TT>, data: TT): Promise<II> {
		try {
			console.debug(`${ANSI_RIGHT} ADD ITEM`, collection.name, data);
			const id = await super.addItem(collection, data);
			console.debug(`${ANSI_SUCCESS} ADD ITEM`, collection.name, id, data);
			return id;
		} catch (reason) {
			console.error(`${ANSI_FAILURE} ADD ITEM`, collection.name, data, reason);
			throw reason;
		}
	}

	/**
	 * Set (insert or overwrite) an item by its id, logging the call.
	 *
	 * @param collection Collection the item belongs to.
	 * @param id Identifier of the item to set.
	 * @param data Full data to store for the item.
	 * @example await provider.setItem(users, 123, { name: "Dave" });
	 * @see https://dhoulb.github.io/shelving/db/provider/DebugDBProvider/DebugDBProvider/setItem
	 */
	override async setItem<II extends I, TT extends T>(collection: Collection<string, II, TT>, id: II, data: TT): Promise<void> {
		try {
			console.debug(`${ANSI_RIGHT} SET ITEM`, collection.name, id, data);
			await super.setItem(collection, id, data);
			console.debug(`${ANSI_SUCCESS} SET ITEM`, collection.name, id, data);
		} catch (reason) {
			console.error(`${ANSI_FAILURE} SET ITEM`, collection.name, id, data, reason);
			throw reason;
		}
	}

	/**
	 * Apply partial updates to an item by its id, logging the call.
	 *
	 * @param collection Collection the item belongs to.
	 * @param id Identifier of the item to update.
	 * @param updates Updates to apply to the item.
	 * @example await provider.updateItem(users, 123, { name: "Dave" });
	 * @see https://dhoulb.github.io/shelving/db/provider/DebugDBProvider/DebugDBProvider/updateItem
	 */
	override async updateItem<II extends I, TT extends T>(
		collection: Collection<string, II, TT>,
		id: II,
		updates: Updates<Item<II, TT>>,
	): Promise<void> {
		try {
			console.debug(`${ANSI_RIGHT} UPDATE ITEM`, collection.name, id, updates);
			await super.updateItem(collection, id, updates);
			console.debug(`${ANSI_SUCCESS} UPDATE ITEM`, collection.name, id, updates);
		} catch (reason) {
			console.error(`${ANSI_FAILURE} UPDATE ITEM`, collection.name, id, updates, reason);
			throw reason;
		}
	}

	/**
	 * Delete an item by its id, logging the call.
	 *
	 * @param collection Collection the item belongs to.
	 * @param id Identifier of the item to delete.
	 * @example await provider.deleteItem(users, 123);
	 * @see https://dhoulb.github.io/shelving/db/provider/DebugDBProvider/DebugDBProvider/deleteItem
	 */
	override async deleteItem<II extends I, TT extends T>(collection: Collection<string, II, TT>, id: II): Promise<void> {
		try {
			console.debug(`${ANSI_RIGHT} DELETE`, collection.name, id);
			await super.deleteItem(collection, id);
			console.debug(`${ANSI_SUCCESS} DELETE`, collection.name, id);
		} catch (reason) {
			console.error(`${ANSI_FAILURE} DELETE`, collection.name, id, reason);
			throw reason;
		}
	}

	/**
	 * Count the items matching an optional query, logging the call and result.
	 *
	 * @param collection Collection to count items in.
	 * @param query Query to filter the counted items (counts all items when omitted).
	 * @returns The number of matching items.
	 * @example await provider.countQuery(users, { age: 40 }) // 7
	 * @see https://dhoulb.github.io/shelving/db/provider/DebugDBProvider/DebugDBProvider/countQuery
	 */
	override async countQuery<II extends I, TT extends T>(
		collection: Collection<string, II, TT>,
		query?: Query<Item<II, TT>>,
	): Promise<number> {
		try {
			console.debug(`${ANSI_RIGHT} COUNT QUERY`, collection.name, query);
			const count = await super.countQuery(collection, query);
			console.debug(`${ANSI_LEFT} COUNT QUERY`, collection.name, query, count);
			return count;
		} catch (reason) {
			console.error(`${ANSI_FAILURE} COUNT QUERY`, collection.name, query, reason);
			throw reason;
		}
	}

	/**
	 * Get the items matching an optional query, logging the call and result.
	 *
	 * @param collection Collection to query.
	 * @param query Query to filter, sort, and limit the items (returns all items when omitted).
	 * @returns An array of matching items.
	 * @example await provider.getQuery(users, { age: 40, $order: "name" }) // Items.
	 * @see https://dhoulb.github.io/shelving/db/provider/DebugDBProvider/DebugDBProvider/getQuery
	 */
	override async getQuery<II extends I, TT extends T>(
		collection: Collection<string, II, TT>,
		query?: Query<Item<II, TT>>,
	): Promise<Items<II, TT>> {
		try {
			console.debug(`${ANSI_RIGHT} GET`, collection.name, query);
			const items = await super.getQuery(collection, query);
			console.debug(`${ANSI_LEFT} GET`, collection.name, query, items);
			return items;
		} catch (reason) {
			console.error(`${ANSI_FAILURE} GET`, collection.name, query, reason);
			throw reason;
		}
	}

	/**
	 * Subscribe to live changes for a query, logging each emission.
	 *
	 * @param collection Collection to query.
	 * @param query Query to filter, sort, and limit the items.
	 * @returns Async sequence yielding the matching items on every change.
	 * @example for await (const items of provider.getQuerySequence(users, { age: 40 })) console.log(items);
	 * @see https://dhoulb.github.io/shelving/db/provider/DebugDBProvider/DebugDBProvider/getQuerySequence
	 */
	override async *getQuerySequence<II extends I, TT extends T>(
		collection: Collection<string, II, TT>,
		query?: Query<Item<II, TT>>,
	): ItemsSequence<II, TT> {
		try {
			console.debug(`${ANSI_RIGHT} SEQUENCE QUERY`, collection.name, query);
			for await (const items of super.getQuerySequence(collection, query)) {
				console.debug(`${ANSI_LEFT} SEQUENCE QUERY`, collection.name, query, items);
				yield items;
			}
			console.debug(`${ANSI_SUCCESS} SEQUENCE QUERY`, collection.name, query);
		} catch (thrown) {
			console.error(`${ANSI_FAILURE} SEQUENCE QUERY`, collection.name, query, thrown);
		}
	}

	/**
	 * Set (overwrite) every item matching a query, logging the call.
	 *
	 * @param collection Collection to write to.
	 * @param query Query selecting the items to set.
	 * @param data Full data to store for each matching item.
	 * @example await provider.setQuery(users, { age: 40 }, { active: true });
	 * @see https://dhoulb.github.io/shelving/db/provider/DebugDBProvider/DebugDBProvider/setQuery
	 */
	override async setQuery<II extends I, TT extends T>(
		collection: Collection<string, II, TT>,
		query: Query<Item<II, TT>>,
		data: TT,
	): Promise<void> {
		try {
			console.debug(`${ANSI_RIGHT} SET QUERY`, collection.name, query, data);
			await super.setQuery(collection, query, data);
			console.debug(`${ANSI_SUCCESS} SET QUERY`, collection.name, query, data);
		} catch (reason) {
			console.error(`${ANSI_FAILURE} SET QUERY`, collection.name, query, data, reason);
			throw reason;
		}
	}

	/**
	 * Apply partial updates to every item matching a query, logging the call.
	 *
	 * @param collection Collection to write to.
	 * @param query Query selecting the items to update.
	 * @param updates Updates to apply to each matching item.
	 * @example await provider.updateQuery(users, { age: 40 }, { active: true });
	 * @see https://dhoulb.github.io/shelving/db/provider/DebugDBProvider/DebugDBProvider/updateQuery
	 */
	override async updateQuery<II extends I, TT extends T>(
		collection: Collection<string, II, TT>,
		query: Query<Item<II, TT>>,
		updates: Updates<TT>,
	): Promise<void> {
		try {
			console.debug(`${ANSI_RIGHT} UPDATE QUERY`, collection.name, query, updates);
			await super.updateQuery(collection, query, updates);
			console.debug(`${ANSI_SUCCESS} UPDATE QUERY`, collection.name, query, updates);
		} catch (reason) {
			console.error(`${ANSI_FAILURE} UPDATE QUERY`, collection.name, query, updates, reason);
			throw reason;
		}
	}

	/**
	 * Delete every item matching a query, logging the call.
	 *
	 * @param collection Collection to delete from.
	 * @param query Query selecting the items to delete.
	 * @example await provider.deleteQuery(users, { active: false });
	 * @see https://dhoulb.github.io/shelving/db/provider/DebugDBProvider/DebugDBProvider/deleteQuery
	 */
	override async deleteQuery<II extends I, TT extends T>(
		collection: Collection<string, II, TT>,
		query: Query<Item<II, TT>>,
	): Promise<void> {
		try {
			console.debug(`${ANSI_RIGHT} DELETE QUERY`, collection.name, query);
			await super.deleteQuery(collection, query);
			console.debug(`${ANSI_SUCCESS} DELETE QUERY`, collection.name, query);
		} catch (reason) {
			console.error(`${ANSI_FAILURE} DELETE QUERY`, collection.name, query, reason);
			throw reason;
		}
	}
}
