import type { MutableArray } from "../../util/array.js";
import type { Data } from "../../util/data.js";
import type { Identifier } from "../../util/item.js";
import type { ItemQuery } from "../../util/query.js";
import type { Updates } from "../../util/update.js";
import type { Collection } from "../collection/Collection.js";
import { ThroughDBProvider } from "./ThroughDBProvider.js";

/** A structured log entry for a database change. */
export type DBChange<I extends Identifier = Identifier> = {
	readonly action: "add" | "set" | "update" | "delete";
	readonly collection: string;
	readonly id?: I | undefined;
	readonly query?: unknown;
	readonly data?: unknown;
	readonly updates?: unknown;
};

/** Asynchronous provider that keeps a log of any written changes to its `.changes` property. */
export class ChangesDBProvider<I extends Identifier = Identifier> extends ThroughDBProvider<I> {
	get changes(): ReadonlyArray<DBChange<I>> {
		return this._changes;
	}
	readonly _changes: MutableArray<DBChange<I>> = [];

	override async addItem<T extends Data>(collection: Collection<string, I, T>, data: T): Promise<I> {
		const id = await super.addItem(collection, data);
		this._changes.push({ action: "set", collection: collection.name, id, data });
		return id;
	}

	override async setItem<T extends Data>(collection: Collection<string, I, T>, id: I, data: T): Promise<void> {
		await super.setItem(collection, id, data);
		this._changes.push({ action: "set", collection: collection.name, id, data });
	}

	override async updateItem<T extends Data>(collection: Collection<string, I, T>, id: I, updates: Updates<T>): Promise<void> {
		await super.updateItem(collection, id, updates);
		this._changes.push({ action: "update", collection: collection.name, id, updates });
	}

	override async deleteItem<T extends Data>(collection: Collection<string, I, T>, id: I): Promise<void> {
		await super.deleteItem(collection, id);
		this._changes.push({ action: "delete", collection: collection.name, id });
	}

	override async setQuery<T extends Data>(collection: Collection<string, I, T>, query: ItemQuery<I, T>, data: T): Promise<void> {
		await super.setQuery(collection, query, data);
		this._changes.push({ action: "set", collection: collection.name, query, data });
	}

	override async updateQuery<T extends Data>(
		collection: Collection<string, I, T>,
		query: ItemQuery<I, T>,
		updates: Updates<T>,
	): Promise<void> {
		await super.updateQuery(collection, query, updates);
		this._changes.push({ action: "update", collection: collection.name, query, updates });
	}

	override async deleteQuery<T extends Data>(collection: Collection<string, I, T>, query: ItemQuery<I, T>): Promise<void> {
		await super.deleteQuery(collection, query);
		this._changes.push({ action: "delete", collection: collection.name, query });
	}
}
