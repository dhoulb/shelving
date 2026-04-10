import type { Data } from "../../util/data.js";
import type { Identifier, Item, Items, OptionalItem } from "../../util/item.js";
import type { Query } from "../../util/query.js";
import type { Updates } from "../../util/update.js";
import type { Collection } from "../collection/Collection.js";
import { MemoryDBProvider } from "./MemoryDBProvider.js";

/** A structured log entry emitted by `MockDBProvider` for one of its provider operations. */
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

/** Provider that logs database operations for testing purposes. */
export class MockDBProvider<I extends Identifier = Identifier, T extends Data = Data> extends MemoryDBProvider<I, T> {
	readonly calls: MockDBCall[] = [];

	override async getItem<II extends I, TT extends T>(collection: Collection<string, II, TT>, id: II): Promise<OptionalItem<II, TT>> {
		const result = await super.getItem(collection, id);
		this.calls.push({ type: "getItem", collection: collection.name, id, result });
		return result;
	}

	override async addItem<II extends I, TT extends T>(collection: Collection<string, II, TT>, data: TT): Promise<II> {
		const result = await super.addItem(collection, data);
		this.calls.push({ type: "addItem", collection: collection.name, data, result });
		return result;
	}

	override async setItem<II extends I, TT extends T>(collection: Collection<string, II, TT>, id: II, data: TT): Promise<void> {
		await super.setItem(collection, id, data);
		this.calls.push({ type: "setItem", collection: collection.name, id, data });
	}

	override async updateItem<II extends I, TT extends T>(
		collection: Collection<string, II, TT>,
		id: II,
		updates: Updates<Item<II, TT>>,
	): Promise<void> {
		await super.updateItem(collection, id, updates);
		this.calls.push({ type: "updateItem", collection: collection.name, id, updates });
	}

	override async deleteItem<II extends I, TT extends T>(collection: Collection<string, II, TT>, id: II): Promise<void> {
		await super.deleteItem(collection, id);
		this.calls.push({ type: "deleteItem", collection: collection.name, id });
	}

	override async countQuery<II extends I, TT extends T>(
		collection: Collection<string, II, TT>,
		query?: Query<Item<II, TT>>,
	): Promise<number> {
		const result = await super.countQuery(collection, query);
		this.calls.push({ type: "countQuery", collection: collection.name, query, result });
		return result;
	}

	override async getQuery<II extends I, TT extends T>(
		collection: Collection<string, II, TT>,
		query?: Query<Item<II, TT>>,
	): Promise<Items<II, TT>> {
		const result = await super.getQuery(collection, query);
		this.calls.push({ type: "getQuery", collection: collection.name, query, result });
		return result;
	}

	override async setQuery<II extends I, TT extends T>(
		collection: Collection<string, II, TT>,
		query: Query<Item<II, TT>>,
		data: TT,
	): Promise<void> {
		await super.setQuery(collection, query, data);
		this.calls.push({ type: "setQuery", collection: collection.name, query, data });
	}

	override async updateQuery<II extends I, TT extends T>(
		collection: Collection<string, II, TT>,
		query: Query<Item<II, TT>>,
		updates: Updates<TT>,
	): Promise<void> {
		await super.updateQuery(collection, query, updates);
		this.calls.push({ type: "updateQuery", collection: collection.name, query, updates });
	}

	override async deleteQuery<II extends I, TT extends T>(
		collection: Collection<string, II, TT>,
		query: Query<Item<II, TT>>,
	): Promise<void> {
		await super.deleteQuery(collection, query);
		this.calls.push({ type: "deleteQuery", collection: collection.name, query });
	}
}
