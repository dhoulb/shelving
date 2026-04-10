import type { MutableArray } from "../../util/array.js";
import type { Data } from "../../util/data.js";
import type { Identifier, Item } from "../../util/item.js";
import type { Query } from "../../util/query.js";
import type { Updates } from "../../util/update.js";
import type { Collection } from "../collection/Collection.js";
import { ThroughDBProvider } from "./ThroughDBProvider.js";

/** A structured log entry for a database change. */
export type DBChange<I extends Identifier> = {
	readonly action: "add" | "set" | "update" | "delete";
	readonly collection: string;
	readonly id?: I | undefined;
	readonly query?: unknown;
	readonly data?: unknown;
	readonly updates?: unknown;
};

/** Asynchronous provider that keeps a log of any written changes to its `.changes` property. */
export class ChangesDBProvider<I extends Identifier, T extends Data> extends ThroughDBProvider<I, T> {
	get changes(): ReadonlyArray<DBChange<I>> {
		return this._changes;
	}
	readonly _changes: MutableArray<DBChange<I>> = [];

	override async addItem<II extends I, TT extends T>(collection: Collection<string, II, TT>, data: TT): Promise<II> {
		const id = await super.addItem(collection, data);
		this._changes.push({ action: "add", collection: collection.name, id, data });
		return id;
	}

	override async setItem<II extends I, TT extends T>(collection: Collection<string, II, TT>, id: II, data: TT): Promise<void> {
		await super.setItem(collection, id, data);
		this._changes.push({ action: "set", collection: collection.name, id, data });
	}

	override async updateItem<II extends I, TT extends T>(
		collection: Collection<string, II, TT>,
		id: II,
		updates: Updates<Item<II, TT>>,
	): Promise<void> {
		await super.updateItem(collection, id, updates);
		this._changes.push({ action: "update", collection: collection.name, id, updates });
	}

	override async deleteItem<II extends I, TT extends T>(collection: Collection<string, II, TT>, id: II): Promise<void> {
		await super.deleteItem(collection, id);
		this._changes.push({ action: "delete", collection: collection.name, id });
	}

	override async setQuery<II extends I, TT extends T>(
		collection: Collection<string, II, TT>,
		query: Query<Item<II, TT>>,
		data: TT,
	): Promise<void> {
		await super.setQuery(collection, query, data);
		this._changes.push({ action: "set", collection: collection.name, query, data });
	}

	override async updateQuery<II extends I, TT extends T>(
		collection: Collection<string, II, TT>,
		query: Query<Item<II, TT>>,
		updates: Updates<TT>,
	): Promise<void> {
		await super.updateQuery(collection, query, updates);
		this._changes.push({ action: "update", collection: collection.name, query, updates });
	}

	override async deleteQuery<II extends I, TT extends T>(
		collection: Collection<string, II, TT>,
		query: Query<Item<II, TT>>,
	): Promise<void> {
		await super.deleteQuery(collection, query);
		this._changes.push({ action: "delete", collection: collection.name, query });
	}
}
