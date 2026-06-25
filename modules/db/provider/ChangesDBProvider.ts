import type { MutableArray } from "../../util/array.js";
import type { Data } from "../../util/data.js";
import type { Identifier, Item } from "../../util/item.js";
import type { Query } from "../../util/query.js";
import type { Updates } from "../../util/update.js";
import type { Collection } from "../collection/Collection.js";
import { ThroughDBProvider } from "./ThroughDBProvider.js";

/**
 * Structured log entry recording a single database write performed through a `ChangesDBProvider`.
 *
 * - `action` is the kind of write; `collection` is the collection name; `id`, `query`, `data`, and `updates` carry whichever fields apply to that write.
 *
 * @see https://shelving.cc/db/DBChange
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
 * - Wraps a `source` provider, delegates each write, then appends a `DBChange` entry describing what happened.
 * - Useful for building audit logging, change feeds, or assertions in tests; reads are passed straight through and not logged.
 *
 * @see https://shelving.cc/db/ChangesDBProvider
 */
export class ChangesDBProvider<I extends Identifier, T extends Data> extends ThroughDBProvider<I, T> {
	/**
	 * The log of writes performed through this provider, in the order they happened.
	 *
	 * @see https://shelving.cc/db/ChangesDBProvider/changes
	 */
	get changes(): ReadonlyArray<DBChange<I>> {
		return this._changes;
	}
	readonly _changes: MutableArray<DBChange<I>> = [];

	/** Log an `"add"` change after writing. */
	override async addItem<II extends I, TT extends T>(collection: Collection<string, II, TT>, data: TT): Promise<II> {
		const id = await super.addItem(collection, data);
		this._changes.push({ action: "add", collection: collection.name, id, data });
		return id;
	}

	/** Log a `"set"` change after writing. */
	override async setItem<II extends I, TT extends T>(collection: Collection<string, II, TT>, id: II, data: TT): Promise<void> {
		await super.setItem(collection, id, data);
		this._changes.push({ action: "set", collection: collection.name, id, data });
	}

	/** Log an `"update"` change after writing. */
	override async updateItem<II extends I, TT extends T>(
		collection: Collection<string, II, TT>,
		id: II,
		updates: Updates<Item<II, TT>>,
	): Promise<void> {
		await super.updateItem(collection, id, updates);
		this._changes.push({ action: "update", collection: collection.name, id, updates });
	}

	/** Log a `"delete"` change after writing. */
	override async deleteItem<II extends I, TT extends T>(collection: Collection<string, II, TT>, id: II): Promise<void> {
		await super.deleteItem(collection, id);
		this._changes.push({ action: "delete", collection: collection.name, id });
	}

	/** Log a `"set"` change after writing. */
	override async setQuery<II extends I, TT extends T>(
		collection: Collection<string, II, TT>,
		query: Query<Item<II, TT>>,
		data: TT,
	): Promise<void> {
		await super.setQuery(collection, query, data);
		this._changes.push({ action: "set", collection: collection.name, query, data });
	}

	/** Log an `"update"` change after writing. */
	override async updateQuery<II extends I, TT extends T>(
		collection: Collection<string, II, TT>,
		query: Query<Item<II, TT>>,
		updates: Updates<TT>,
	): Promise<void> {
		await super.updateQuery(collection, query, updates);
		this._changes.push({ action: "update", collection: collection.name, query, updates });
	}

	/** Log a `"delete"` change after writing. */
	override async deleteQuery<II extends I, TT extends T>(
		collection: Collection<string, II, TT>,
		query: Query<Item<II, TT>>,
	): Promise<void> {
		await super.deleteQuery(collection, query);
		this._changes.push({ action: "delete", collection: collection.name, query });
	}
}
