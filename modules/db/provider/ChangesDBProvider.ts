import type { MutableArray } from "../../util/array.js";
import type { Data } from "../../util/data.js";
import type { Identifier, Item } from "../../util/item.js";
import type { Query } from "../../util/query.js";
import type { Updates } from "../../util/update.js";
import type { Collection } from "../collection/Collection.js";
import { ThroughDBProvider } from "./ThroughDBProvider.js";

/**
 * Structured log entry recording a single database write performed through a [`ChangesDBProvider`](/db/ChangesDBProvider).
 *
 * - `action` is the kind of write; `collection` is the collection name; `id`, `query`, `data`, and `updates` carry whichever fields apply to that write.
 *
 * @see https://dhoulb.github.io/shelving/db/provider/ChangesDBProvider/DBChange
 */
export type DBChange<I extends Identifier> = {
	readonly action: "add" | "set" | "update" | "delete";
	readonly collection: string;
	readonly id?: I | undefined;
	readonly query?: unknown;
	readonly data?: unknown;
	readonly updates?: unknown;
};

/**
 * Database provider that records every write it performs to its `changes` log.
 *
 * - Wraps a `source` provider, delegates each write, then appends a [`DBChange`](/db/DBChange) entry describing what happened.
 * - Useful for building audit logging, change feeds, or assertions in tests; reads are passed straight through and not logged.
 *
 * @example
 *  const provider = new ChangesDBProvider(new MemoryDBProvider());
 *  await provider.addItem(users, { name: "Dave" });
 *  provider.changes; // [{ action: "add", collection: "users", id: 123, data: { name: "Dave" } }]
 *
 * @see https://dhoulb.github.io/shelving/db/provider/ChangesDBProvider/ChangesDBProvider
 */
export class ChangesDBProvider<I extends Identifier, T extends Data> extends ThroughDBProvider<I, T> {
	/**
	 * The log of writes performed through this provider, in the order they happened.
	 *
	 * @see https://dhoulb.github.io/shelving/db/provider/ChangesDBProvider/ChangesDBProvider/changes
	 */
	get changes(): ReadonlyArray<DBChange<I>> {
		return this._changes;
	}
	readonly _changes: MutableArray<DBChange<I>> = [];

	/**
	 * Add a new item, then log an `"add"` change.
	 *
	 * @param collection Collection to add the item to.
	 * @param data Data for the new item.
	 * @returns The generated identifier for the new item.
	 * @example await provider.addItem(users, { name: "Dave" }) // 123
	 * @see https://dhoulb.github.io/shelving/db/provider/ChangesDBProvider/ChangesDBProvider/addItem
	 */
	override async addItem<II extends I, TT extends T>(collection: Collection<string, II, TT>, data: TT): Promise<II> {
		const id = await super.addItem(collection, data);
		this._changes.push({ action: "add", collection: collection.name, id, data });
		return id;
	}

	/**
	 * Set (insert or overwrite) an item by its id, then log a `"set"` change.
	 *
	 * @param collection Collection the item belongs to.
	 * @param id Identifier of the item to set.
	 * @param data Full data to store for the item.
	 * @example await provider.setItem(users, 123, { name: "Dave" });
	 * @see https://dhoulb.github.io/shelving/db/provider/ChangesDBProvider/ChangesDBProvider/setItem
	 */
	override async setItem<II extends I, TT extends T>(collection: Collection<string, II, TT>, id: II, data: TT): Promise<void> {
		await super.setItem(collection, id, data);
		this._changes.push({ action: "set", collection: collection.name, id, data });
	}

	/**
	 * Apply partial updates to an item by its id, then log an `"update"` change.
	 *
	 * @param collection Collection the item belongs to.
	 * @param id Identifier of the item to update.
	 * @param updates Updates to apply to the item.
	 * @example await provider.updateItem(users, 123, { name: "Dave" });
	 * @see https://dhoulb.github.io/shelving/db/provider/ChangesDBProvider/ChangesDBProvider/updateItem
	 */
	override async updateItem<II extends I, TT extends T>(
		collection: Collection<string, II, TT>,
		id: II,
		updates: Updates<Item<II, TT>>,
	): Promise<void> {
		await super.updateItem(collection, id, updates);
		this._changes.push({ action: "update", collection: collection.name, id, updates });
	}

	/**
	 * Delete an item by its id, then log a `"delete"` change.
	 *
	 * @param collection Collection the item belongs to.
	 * @param id Identifier of the item to delete.
	 * @example await provider.deleteItem(users, 123);
	 * @see https://dhoulb.github.io/shelving/db/provider/ChangesDBProvider/ChangesDBProvider/deleteItem
	 */
	override async deleteItem<II extends I, TT extends T>(collection: Collection<string, II, TT>, id: II): Promise<void> {
		await super.deleteItem(collection, id);
		this._changes.push({ action: "delete", collection: collection.name, id });
	}

	/**
	 * Set (overwrite) every item matching a query, then log a `"set"` change.
	 *
	 * @param collection Collection to write to.
	 * @param query Query selecting the items to set.
	 * @param data Full data to store for each matching item.
	 * @example await provider.setQuery(users, { age: 40 }, { active: true });
	 * @see https://dhoulb.github.io/shelving/db/provider/ChangesDBProvider/ChangesDBProvider/setQuery
	 */
	override async setQuery<II extends I, TT extends T>(
		collection: Collection<string, II, TT>,
		query: Query<Item<II, TT>>,
		data: TT,
	): Promise<void> {
		await super.setQuery(collection, query, data);
		this._changes.push({ action: "set", collection: collection.name, query, data });
	}

	/**
	 * Apply partial updates to every item matching a query, then log an `"update"` change.
	 *
	 * @param collection Collection to write to.
	 * @param query Query selecting the items to update.
	 * @param updates Updates to apply to each matching item.
	 * @example await provider.updateQuery(users, { age: 40 }, { active: true });
	 * @see https://dhoulb.github.io/shelving/db/provider/ChangesDBProvider/ChangesDBProvider/updateQuery
	 */
	override async updateQuery<II extends I, TT extends T>(
		collection: Collection<string, II, TT>,
		query: Query<Item<II, TT>>,
		updates: Updates<TT>,
	): Promise<void> {
		await super.updateQuery(collection, query, updates);
		this._changes.push({ action: "update", collection: collection.name, query, updates });
	}

	/**
	 * Delete every item matching a query, then log a `"delete"` change.
	 *
	 * @param collection Collection to delete from.
	 * @param query Query selecting the items to delete.
	 * @example await provider.deleteQuery(users, { active: false });
	 * @see https://dhoulb.github.io/shelving/db/provider/ChangesDBProvider/ChangesDBProvider/deleteQuery
	 */
	override async deleteQuery<II extends I, TT extends T>(
		collection: Collection<string, II, TT>,
		query: Query<Item<II, TT>>,
	): Promise<void> {
		await super.deleteQuery(collection, query);
		this._changes.push({ action: "delete", collection: collection.name, query });
	}
}
