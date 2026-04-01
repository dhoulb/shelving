import type { Data } from "../../util/data.js";
import type { Identifier, Items, OptionalItem } from "../../util/item.js";
import type { ItemQuery } from "../../util/query.js";
import type { Updates } from "../../util/update.js";
import type { Collection } from "../collection/Collection.js";
import { ThroughDBProvider } from "./ThroughDBProvider.js";

/** Provider that logs operations to the console. */
export class DebugDBProvider<I extends Identifier = Identifier> extends ThroughDBProvider<I> {
	override async getItem<T extends Data>(collection: Collection<string, I, T>, id: I): Promise<OptionalItem<I, T>> {
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

	override async *getItemSequence<T extends Data>(collection: Collection<string, I, T>, id: I): AsyncIterableIterator<OptionalItem<I, T>> {
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

	override async addItem<T extends Data>(collection: Collection<string, I, T>, data: T): Promise<I> {
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

	override async setItem<T extends Data>(collection: Collection<string, I, T>, id: I, data: T): Promise<void> {
		try {
			console.debug("⋯ SET", collection.name, id, data);
			await super.setItem(collection, id, data);
			console.debug("✔ SET", collection.name, id, data);
		} catch (reason) {
			console.error("✘ SET", collection.name, id, data, reason);
			throw reason;
		}
	}

	override async updateItem<T extends Data>(collection: Collection<string, I, T>, id: I, updates: Updates<T>): Promise<void> {
		try {
			console.debug("⋯ UPDATE", collection.name, id, updates);
			await super.updateItem(collection, id, updates);
			console.debug("✔ UPDATE", collection.name, id, updates);
		} catch (reason) {
			console.error("✘ UPDATE", collection.name, id, updates, reason);
			throw reason;
		}
	}

	override async deleteItem<T extends Data>(collection: Collection<string, I, T>, id: I): Promise<void> {
		try {
			console.debug("⋯ DELETE", collection.name, id);
			await super.deleteItem(collection, id);
			console.debug("✔ DELETE", collection.name, id);
		} catch (reason) {
			console.error("✘ DELETE", collection.name, id, reason);
			throw reason;
		}
	}

	override async countQuery<T extends Data>(collection: Collection<string, I, T>, query?: ItemQuery<I, T>): Promise<number> {
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

	override async getQuery<T extends Data>(collection: Collection<string, I, T>, query?: ItemQuery<I, T>): Promise<Items<I, T>> {
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

	override async *getQuerySequence<T extends Data>(
		collection: Collection<string, I, T>,
		query?: ItemQuery<I, T>,
	): AsyncIterableIterator<Items<I, T>> {
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

	override async setQuery<T extends Data>(collection: Collection<string, I, T>, query: ItemQuery<I, T>, data: T): Promise<void> {
		try {
			console.debug("⋯ SET", collection.name, query, data);
			await super.setQuery(collection, query, data);
			console.debug("✔ SET", collection.name, query, data);
		} catch (reason) {
			console.error("✘ SET", collection.name, query, data, reason);
			throw reason;
		}
	}

	override async updateQuery<T extends Data>(
		collection: Collection<string, I, T>,
		query: ItemQuery<I, T>,
		updates: Updates<T>,
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

	override async deleteQuery<T extends Data>(collection: Collection<string, I, T>, query: ItemQuery<I, T>): Promise<void> {
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
