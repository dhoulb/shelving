import type { Data } from "../../util/data.js";
import type { Identifier, Item, Items, OptionalItem } from "../../util/item.js";
import type { Query } from "../../util/query.js";
import type { Updates } from "../../util/update.js";
import type { Collection } from "../collection/Collection.js";
import { MemoryDBProvider } from "./MemoryDBProvider.js";

/**
 * Structured log entry recording one operation performed through a `MockDBProvider`.
 *
 * - `type` is the operation name; `collection` is the collection name; `id`, `query`, `data`, `updates`, and `result` carry whichever fields apply to that operation.
 *
 * @see https://shelving.cc/db/MockDBCall
 */
export type MockDBCall = {
	readonly type:
		| "getItem"
		| "addItem"
		| "setItem"
		| "updateItem"
		| "deleteItem"
		| "countQuery"
		| "getQuery"
		| "setQuery"
		| "updateQuery"
		| "deleteQuery";
	readonly collection: string;
	readonly id?: Identifier | undefined;
	readonly query?: unknown;
	readonly data?: Data;
	readonly updates?: unknown;
	readonly result?: unknown;
};

/**
 * In-memory database provider that records every operation to its `calls` log, for testing.
 *
 * - Extends `MemoryDBProvider`, so it stores data normally, then appends a `MockDBCall` entry (including the result) for each call.
 * - Assert against `calls` in tests to check which operations ran and with what arguments.
 *
 * @example
 *  const provider = new MockDBProvider();
 *  await provider.addItem(users, { name: "Dave" });
 *  provider.calls; // [{ type: "addItem", collection: "users", data: { name: "Dave" }, result: 123 }]
 *
 * @see https://shelving.cc/db/MockDBProvider
 */
export class MockDBProvider<I extends Identifier = Identifier, T extends Data = Data> extends MemoryDBProvider<I, T> {
	/**
	 * The log of operations performed through this provider, in the order they happened.
	 *
	 * @see https://shelving.cc/db/MockDBProvider/calls
	 */
	readonly calls: MockDBCall[] = [];

	/**
	 * Get an item by its id, then record a `"getItem"` call.
	 *
	 * @param collection Collection the item belongs to.
	 * @param id Identifier of the item to get.
	 * @returns The item, or `undefined` if no item exists with that id.
	 * @example await provider.getItem(users, 123) // Item or undefined.
	 * @see https://shelving.cc/db/MockDBProvider/getItem
	 */
	override async getItem<II extends I, TT extends T>(collection: Collection<string, II, TT>, id: II): Promise<OptionalItem<II, TT>> {
		const result = await super.getItem(collection, id);
		this.calls.push({ type: "getItem", collection: collection.name, id, result });
		return result;
	}

	/**
	 * Add a new item, then record an `"addItem"` call.
	 *
	 * @param collection Collection to add the item to.
	 * @param data Data for the new item.
	 * @returns The generated identifier for the new item.
	 * @example await provider.addItem(users, { name: "Dave" }) // 123
	 * @see https://shelving.cc/db/MockDBProvider/addItem
	 */
	override async addItem<II extends I, TT extends T>(collection: Collection<string, II, TT>, data: TT): Promise<II> {
		const result = await super.addItem(collection, data);
		this.calls.push({ type: "addItem", collection: collection.name, data, result });
		return result;
	}

	/**
	 * Set (insert or overwrite) an item by its id, then record a `"setItem"` call.
	 *
	 * @param collection Collection the item belongs to.
	 * @param id Identifier of the item to set.
	 * @param data Full data to store for the item.
	 * @example await provider.setItem(users, 123, { name: "Dave" });
	 * @see https://shelving.cc/db/MockDBProvider/setItem
	 */
	override async setItem<II extends I, TT extends T>(collection: Collection<string, II, TT>, id: II, data: TT): Promise<void> {
		await super.setItem(collection, id, data);
		this.calls.push({ type: "setItem", collection: collection.name, id, data });
	}

	/**
	 * Apply partial updates to an item by its id, then record an `"updateItem"` call.
	 *
	 * @param collection Collection the item belongs to.
	 * @param id Identifier of the item to update.
	 * @param updates Updates to apply to the item.
	 * @example await provider.updateItem(users, 123, { name: "Dave" });
	 * @see https://shelving.cc/db/MockDBProvider/updateItem
	 */
	override async updateItem<II extends I, TT extends T>(
		collection: Collection<string, II, TT>,
		id: II,
		updates: Updates<Item<II, TT>>,
	): Promise<void> {
		await super.updateItem(collection, id, updates);
		this.calls.push({ type: "updateItem", collection: collection.name, id, updates });
	}

	/**
	 * Delete an item by its id, then record a `"deleteItem"` call.
	 *
	 * @param collection Collection the item belongs to.
	 * @param id Identifier of the item to delete.
	 * @example await provider.deleteItem(users, 123);
	 * @see https://shelving.cc/db/MockDBProvider/deleteItem
	 */
	override async deleteItem<II extends I, TT extends T>(collection: Collection<string, II, TT>, id: II): Promise<void> {
		await super.deleteItem(collection, id);
		this.calls.push({ type: "deleteItem", collection: collection.name, id });
	}

	/**
	 * Count the items matching an optional query, then record a `"countQuery"` call.
	 *
	 * @param collection Collection to count items in.
	 * @param query Query to filter the counted items (counts all items when omitted).
	 * @returns The number of matching items.
	 * @example await provider.countQuery(users, { age: 40 }) // 7
	 * @see https://shelving.cc/db/MockDBProvider/countQuery
	 */
	override async countQuery<II extends I, TT extends T>(
		collection: Collection<string, II, TT>,
		query?: Query<Item<II, TT>>,
	): Promise<number> {
		const result = await super.countQuery(collection, query);
		this.calls.push({ type: "countQuery", collection: collection.name, query, result });
		return result;
	}

	/**
	 * Get the items matching an optional query, then record a `"getQuery"` call.
	 *
	 * @param collection Collection to query.
	 * @param query Query to filter, sort, and limit the items (returns all items when omitted).
	 * @returns An array of matching items.
	 * @example await provider.getQuery(users, { age: 40, $order: "name" }) // Items.
	 * @see https://shelving.cc/db/MockDBProvider/getQuery
	 */
	override async getQuery<II extends I, TT extends T>(
		collection: Collection<string, II, TT>,
		query?: Query<Item<II, TT>>,
	): Promise<Items<II, TT>> {
		const result = await super.getQuery(collection, query);
		this.calls.push({ type: "getQuery", collection: collection.name, query, result });
		return result;
	}

	/**
	 * Set (overwrite) every item matching a query, then record a `"setQuery"` call.
	 *
	 * @param collection Collection to write to.
	 * @param query Query selecting the items to set.
	 * @param data Full data to store for each matching item.
	 * @example await provider.setQuery(users, { age: 40 }, { active: true });
	 * @see https://shelving.cc/db/MockDBProvider/setQuery
	 */
	override async setQuery<II extends I, TT extends T>(
		collection: Collection<string, II, TT>,
		query: Query<Item<II, TT>>,
		data: TT,
	): Promise<void> {
		await super.setQuery(collection, query, data);
		this.calls.push({ type: "setQuery", collection: collection.name, query, data });
	}

	/**
	 * Apply partial updates to every item matching a query, then record an `"updateQuery"` call.
	 *
	 * @param collection Collection to write to.
	 * @param query Query selecting the items to update.
	 * @param updates Updates to apply to each matching item.
	 * @example await provider.updateQuery(users, { age: 40 }, { active: true });
	 * @see https://shelving.cc/db/MockDBProvider/updateQuery
	 */
	override async updateQuery<II extends I, TT extends T>(
		collection: Collection<string, II, TT>,
		query: Query<Item<II, TT>>,
		updates: Updates<TT>,
	): Promise<void> {
		await super.updateQuery(collection, query, updates);
		this.calls.push({ type: "updateQuery", collection: collection.name, query, updates });
	}

	/**
	 * Delete every item matching a query, then record a `"deleteQuery"` call.
	 *
	 * @param collection Collection to delete from.
	 * @param query Query selecting the items to delete.
	 * @example await provider.deleteQuery(users, { active: false });
	 * @see https://shelving.cc/db/MockDBProvider/deleteQuery
	 */
	override async deleteQuery<II extends I, TT extends T>(
		collection: Collection<string, II, TT>,
		query: Query<Item<II, TT>>,
	): Promise<void> {
		await super.deleteQuery(collection, query);
		this.calls.push({ type: "deleteQuery", collection: collection.name, query });
	}
}
