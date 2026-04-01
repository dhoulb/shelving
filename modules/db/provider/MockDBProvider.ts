import type { Data } from "../../util/data.js";
import type { Identifier, Items, OptionalItem } from "../../util/item.js";
import type { ItemQuery } from "../../util/query.js";
import type { Updates } from "../../util/update.js";
import type { Collection } from "../collection/Collection.js";
import { MemoryDBProvider } from "./MemoryDBProvider.js";

/** A structured log entry emitted by `MockDBProvider` for one of its provider operations. */
export type MockDBCall<I extends Identifier = Identifier> = {
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
	readonly id?: I | undefined;
	readonly query?: unknown;
	readonly data?: unknown;
	readonly updates?: unknown;
	readonly result?: unknown;
};

/** Provider that logs database operations for testing purposes. */
export class MockDBProvider<I extends Identifier = Identifier> extends MemoryDBProvider<I> {
	readonly calls: MockDBCall<I>[] = [];

	override async getItem<T extends Data>(collection: Collection<string, I, T>, id: I): Promise<OptionalItem<I, T>> {
		const result = await super.getItem(collection, id);
		this.calls.push({ type: "getItem", collection: collection.name, id, result });
		return result;
	}

	override async addItem<T extends Data>(collection: Collection<string, I, T>, data: T): Promise<I> {
		const result = await super.addItem(collection, data);
		this.calls.push({ type: "addItem", collection: collection.name, data, result });
		return result;
	}

	override async setItem<T extends Data>(collection: Collection<string, I, T>, id: I, data: T): Promise<void> {
		await super.setItem(collection, id, data);
		this.calls.push({ type: "setItem", collection: collection.name, id, data });
	}

	override async updateItem<T extends Data>(collection: Collection<string, I, T>, id: I, updates: Updates<T>): Promise<void> {
		await super.updateItem(collection, id, updates);
		this.calls.push({ type: "updateItem", collection: collection.name, id, updates });
	}

	override async deleteItem<T extends Data>(collection: Collection<string, I, T>, id: I): Promise<void> {
		await super.deleteItem(collection, id);
		this.calls.push({ type: "deleteItem", collection: collection.name, id });
	}

	override async countQuery<T extends Data>(collection: Collection<string, I, T>, query?: ItemQuery<I, T>): Promise<number> {
		const result = await super.countQuery(collection, query);
		this.calls.push({ type: "countQuery", collection: collection.name, query, result });
		return result;
	}

	override async getQuery<T extends Data>(collection: Collection<string, I, T>, query?: ItemQuery<I, T>): Promise<Items<I, T>> {
		const result = await super.getQuery(collection, query);
		this.calls.push({ type: "getQuery", collection: collection.name, query, result });
		return result;
	}

	override async setQuery<T extends Data>(collection: Collection<string, I, T>, query: ItemQuery<I, T>, data: T): Promise<void> {
		await super.setQuery(collection, query, data);
		this.calls.push({ type: "setQuery", collection: collection.name, query, data });
	}

	override async updateQuery<T extends Data>(
		collection: Collection<string, I, T>,
		query: ItemQuery<I, T>,
		updates: Updates<T>,
	): Promise<void> {
		await super.updateQuery(collection, query, updates);
		this.calls.push({ type: "updateQuery", collection: collection.name, query, updates });
	}

	override async deleteQuery<T extends Data>(collection: Collection<string, I, T>, query: ItemQuery<I, T>): Promise<void> {
		await super.deleteQuery(collection, query);
		this.calls.push({ type: "deleteQuery", collection: collection.name, query });
	}
}
