import type { Data } from "../../util/data.js";
import type { Identifier, Item, Items, ItemsSequence, OptionalItem, OptionalItemSequence } from "../../util/item.js";
import type { Query } from "../../util/query.js";
import type { Updates } from "../../util/update.js";
import type { Collection } from "../collection/Collection.js";
import { ThroughDBProvider } from "./ThroughDBProvider.js";

/** Provider that logs operations to the console. */
export class DebugDBProvider<I extends Identifier, T extends Data> extends ThroughDBProvider<I, T> {
	override async getItem<II extends I, TT extends T>(collection: Collection<string, II, TT>, id: II): Promise<OptionalItem<II, TT>> {
		try {
			console.debug("⋯ GET", collection.name, id);
			const item = await super.getItem(collection, id);
			console.debug("↩ GET", collection.name, id, item);
			return item;
		} catch (reason) {
			console.error("✘ GET", collection.name, id, reason);
			throw reason;
		}
	}

	override async *getItemSequence<II extends I, TT extends T>(
		collection: Collection<string, II, TT>,
		id: II,
	): OptionalItemSequence<II, TT> {
		try {
			console.debug("⋯ ITERATE", collection.name, id);
			for await (const item of super.getItemSequence(collection, id)) {
				console.debug("↩ ITERATE", collection.name, id, item);
				yield item;
			}
			console.debug("✔ ITERATE", collection.name, id);
		} catch (thrown) {
			console.error("✘ ITERATE", collection.name, id, thrown);
		}
	}

	override async addItem<II extends I, TT extends T>(collection: Collection<string, II, TT>, data: TT): Promise<II> {
		try {
			console.debug("⋯ ADD", collection.name, data);
			const id = await super.addItem(collection, data);
			console.debug("✔ ADD", collection.name, id, data);
			return id;
		} catch (reason) {
			console.error("✘ ADD", collection.name, data, reason);
			throw reason;
		}
	}

	override async setItem<II extends I, TT extends T>(collection: Collection<string, II, TT>, id: II, data: TT): Promise<void> {
		try {
			console.debug("⋯ SET", collection.name, id, data);
			await super.setItem(collection, id, data);
			console.debug("✔ SET", collection.name, id, data);
		} catch (reason) {
			console.error("✘ SET", collection.name, id, data, reason);
			throw reason;
		}
	}

	override async updateItem<II extends I, TT extends T>(
		collection: Collection<string, II, TT>,
		id: II,
		updates: Updates<Item<II, TT>>,
	): Promise<void> {
		try {
			console.debug("⋯ UPDATE", collection.name, id, updates);
			await super.updateItem(collection, id, updates);
			console.debug("✔ UPDATE", collection.name, id, updates);
		} catch (reason) {
			console.error("✘ UPDATE", collection.name, id, updates, reason);
			throw reason;
		}
	}

	override async deleteItem<II extends I, TT extends T>(collection: Collection<string, II, TT>, id: II): Promise<void> {
		try {
			console.debug("⋯ DELETE", collection.name, id);
			await super.deleteItem(collection, id);
			console.debug("✔ DELETE", collection.name, id);
		} catch (reason) {
			console.error("✘ DELETE", collection.name, id, reason);
			throw reason;
		}
	}

	override async countQuery<II extends I, TT extends T>(
		collection: Collection<string, II, TT>,
		query?: Query<Item<II, TT>>,
	): Promise<number> {
		try {
			console.debug("⋯ COUNT", collection.name, query);
			const count = await super.countQuery(collection, query);
			console.debug("✔ COUNT", collection.name, query, count);
			return count;
		} catch (reason) {
			console.error("✘ COUNT", collection.name, query, reason);
			throw reason;
		}
	}

	override async getQuery<II extends I, TT extends T>(
		collection: Collection<string, II, TT>,
		query?: Query<Item<II, TT>>,
	): Promise<Items<II, TT>> {
		try {
			console.debug("⋯ GET", collection.name, query);
			const items = await super.getQuery(collection, query);
			console.debug("✔ GET", collection.name, query, items);
			return items;
		} catch (reason) {
			console.error("✘ GET", collection.name, query, reason);
			throw reason;
		}
	}

	override async *getQuerySequence<II extends I, TT extends T>(
		collection: Collection<string, II, TT>,
		query?: Query<Item<II, TT>>,
	): ItemsSequence<II, TT> {
		try {
			console.debug("⋯ ITERATE", collection.name, query);
			for await (const items of super.getQuerySequence(collection, query)) {
				console.debug("↩ ITERATE", collection.name, query, items);
				yield items;
			}
			console.debug("✔ ITERATE", collection.name, query);
		} catch (thrown) {
			console.error("✘ ITERATE", collection.name, query, thrown);
		}
	}

	override async setQuery<II extends I, TT extends T>(
		collection: Collection<string, II, TT>,
		query: Query<Item<II, TT>>,
		data: TT,
	): Promise<void> {
		try {
			console.debug("⋯ SET", collection.name, query, data);
			await super.setQuery(collection, query, data);
			console.debug("✔ SET", collection.name, query, data);
		} catch (reason) {
			console.error("✘ SET", collection.name, query, data, reason);
			throw reason;
		}
	}

	override async updateQuery<II extends I, TT extends T>(
		collection: Collection<string, II, TT>,
		query: Query<Item<II, TT>>,
		updates: Updates<TT>,
	): Promise<void> {
		try {
			console.debug("⋯ UPDATE", collection.name, query, updates);
			await super.updateQuery(collection, query, updates);
			console.debug("✔ UPDATE", collection.name, query, updates);
		} catch (reason) {
			console.error("✘ UPDATE", collection.name, query, updates, reason);
			throw reason;
		}
	}

	override async deleteQuery<II extends I, TT extends T>(
		collection: Collection<string, II, TT>,
		query: Query<Item<II, TT>>,
	): Promise<void> {
		try {
			console.debug("⋯ DELETE", collection.name, query);
			await super.deleteQuery(collection, query);
			console.debug("✔ DELETE", collection.name, query);
		} catch (reason) {
			console.error("✘ DELETE", collection.name, query, reason);
			throw reason;
		}
	}
}
