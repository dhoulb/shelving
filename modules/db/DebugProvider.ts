import type { DataKey, Database } from "../util/data.js";
import type { ItemQuery, Items, OptionalItem } from "../util/item.js";
import type { Updates } from "../util/update.js";
import { AsyncThroughProvider, ThroughProvider } from "./ThroughProvider.js";

/** Provider that logs operations to a synchronous source provider to the console. */
export class DebugProvider<T extends Database> extends ThroughProvider<T> {
	override getItem<K extends DataKey<T>>(collection: K, id: string): OptionalItem<T[K]> {
		try {
			const item = super.getItem(collection, id);
			console.debug("↩ GET", collection, id, item);
			return item;
		} catch (reason) {
			console.error("✘ GET", collection, id, reason);
			throw reason;
		}
	}
	override async *getItemSequence<K extends DataKey<T>>(collection: K, id: string): AsyncIterableIterator<OptionalItem<T[K]>> {
		try {
			console.debug("⋯ ITERATE", collection, id);
			for await (const item of super.getItemSequence(collection, id)) {
				console.debug("↩ ITERATE", collection, id, item);
				yield item;
			}
			console.debug("✔ ITERATE", collection, id);
		} catch (thrown) {
			console.error("✘ ITERATE", collection, id, thrown);
		}
	}
	override addItem<K extends DataKey<T>>(collection: K, data: T[K]): string {
		try {
			const id = super.addItem(collection, data);
			console.debug("✔ ADD", collection, data, id);
			return id;
		} catch (reason) {
			console.error("✘ ADD", collection, data, reason);
			throw reason;
		}
	}
	override setItem<K extends DataKey<T>>(collection: K, id: string, data: T[K]): void {
		try {
			super.setItem(collection, id, data);
			console.debug("✔ SET", collection, id, data);
		} catch (reason) {
			console.error("✘ SET", collection, id, data, reason);
			throw reason;
		}
	}
	override updateItem<K extends DataKey<T>>(collection: K, id: string, updates: Updates): void {
		try {
			super.updateItem(collection, id, updates);
			console.debug("✔ UPDATE", collection, id, updates);
		} catch (reason) {
			console.error("✘ UPDATE", collection, id, updates, reason);
			throw reason;
		}
	}
	override deleteItem<K extends DataKey<T>>(collection: K, id: string): void {
		try {
			super.deleteItem(collection, id);
			console.debug("✔ DELETE", collection, id);
		} catch (reason) {
			console.error("✘ DELETE", collection, id, reason);
			throw reason;
		}
	}
	override countQuery<K extends DataKey<T>>(collection: K, query?: ItemQuery<T[K]>): number {
		try {
			const count = super.countQuery(collection, query);
			console.debug("✔ GET", collection, query, count);
			return count;
		} catch (reason) {
			console.error("✘ GET", collection, query, reason);
			throw reason;
		}
	}
	override getQuery<K extends DataKey<T>>(collection: K, query?: ItemQuery<T[K]>): Items<T[K]> {
		try {
			const items = super.getQuery(collection, query);
			console.debug("✔ GET", collection, query, items);
			return items;
		} catch (reason) {
			console.error("✘ GET", collection, query, reason);
			throw reason;
		}
	}
	override async *getQuerySequence<K extends DataKey<T>>(collection: K, query?: ItemQuery<T[K]>): AsyncIterableIterator<Items<T[K]>> {
		try {
			console.debug("⋯ ITERATE", collection, query);
			for await (const items of super.getQuerySequence(collection, query)) {
				console.debug("↩ ITERATE", collection, query, items);
				yield items;
			}
			console.debug("✔ ITERATE", collection, query);
		} catch (thrown) {
			console.error("✘ ITERATE", collection, query, thrown);
		}
	}
	override setQuery<K extends DataKey<T>>(collection: K, query: ItemQuery<T[K]>, data: T[K]): void {
		try {
			super.setQuery(collection, query, data);
			console.debug("✔ SET", collection, query, data);
		} catch (reason) {
			console.error("✘ SET", collection, query, data, reason);
			throw reason;
		}
	}
	override updateQuery<K extends DataKey<T>>(collection: K, query: ItemQuery<T[K]>, updates: Updates): void {
		try {
			super.updateQuery(collection, query, updates);
			console.debug("✔ UPDATE", collection, query, updates);
		} catch (reason) {
			console.error("✘ UPDATE", collection, query, updates, reason);
			throw reason;
		}
	}
	override deleteQuery<K extends DataKey<T>>(collection: K, query: ItemQuery<T[K]>): void {
		try {
			super.deleteQuery(collection, query);
			console.debug("✔ DELETE", collection, query);
		} catch (reason) {
			console.error("✘ DELETE", collection, query, reason);
			throw reason;
		}
	}
}

/** Provider that logs operations to a synchronous source provider to the console. */
export class AsyncDebugProvider<T extends Database> extends AsyncThroughProvider<T> {
	override async getItem<K extends DataKey<T>>(collection: K, id: string): Promise<OptionalItem<T[K]>> {
		try {
			console.debug("⋯ GET", collection, id);
			const item = await super.getItem(collection, id);
			console.debug("↩ GET", collection, id, item);
			return item;
		} catch (reason) {
			console.error("✘ GET", collection, id, reason);
			throw reason;
		}
	}
	override async *getItemSequence<K extends DataKey<T>>(collection: K, id: string): AsyncIterableIterator<OptionalItem<T[K]>> {
		try {
			console.debug("⋯ ITERATE", collection, id);
			for await (const item of super.getItemSequence(collection, id)) {
				console.debug("↩ ITERATE", collection, id, item);
				yield item;
			}
			console.debug("✔ ITERATE", collection, id);
		} catch (thrown) {
			console.error("✘ ITERATE", collection, id, thrown);
		}
	}
	override async addItem<K extends DataKey<T>>(collection: K, data: T[K]): Promise<string> {
		try {
			console.debug("⋯ ADD", collection, data);
			const id = await super.addItem(collection, data);
			console.debug("✔ ADD", collection, id, data);
			return id;
		} catch (reason) {
			console.error("✘ ADD", collection, data, reason);
			throw reason;
		}
	}
	override async setItem<K extends DataKey<T>>(collection: K, id: string, data: T[K]): Promise<void> {
		try {
			console.debug("⋯ SET", collection, id, data);
			await super.setItem(collection, id, data);
			console.debug("✔ SET", collection, id, data, 1);
		} catch (reason) {
			console.error("✘ SET", collection, id, data, reason);
			throw reason;
		}
	}
	override async updateItem<K extends DataKey<T>>(collection: K, id: string, updates: Updates): Promise<void> {
		try {
			console.debug("⋯ UPDATE", collection, id, updates);
			await super.updateItem(collection, id, updates);
			console.debug("✔ UPDATE", collection, id, updates, 1);
		} catch (reason) {
			console.error("✘ UPDATE", collection, id, updates, reason);
			throw reason;
		}
	}
	override async deleteItem<K extends DataKey<T>>(collection: K, id: string): Promise<void> {
		try {
			console.debug("⋯ DELETE", collection, id);
			await super.deleteItem(collection, id);
			console.debug("✔ DELETE", collection, id, 1);
		} catch (reason) {
			console.error("✘ DELETE", collection, id, reason);
			throw reason;
		}
	}
	override async countQuery<K extends DataKey<T>>(collection: K, query: ItemQuery<T[K]>): Promise<number> {
		try {
			console.debug("⋯ COUNT", collection, query);
			const count = await super.countQuery(collection, query);
			console.debug("✔ COUNT", collection, query, count);
			return count;
		} catch (reason) {
			console.error("✘ COUNT", collection, query, reason);
			throw reason;
		}
	}
	override async getQuery<K extends DataKey<T>>(collection: K, query: ItemQuery<T[K]>): Promise<Items<T[K]>> {
		try {
			console.debug("⋯ GET", collection, query);
			const items = await super.getQuery(collection, query);
			console.debug("✔ GET", collection, query, items);
			return items;
		} catch (reason) {
			console.error("✘ GET", collection, query, reason);
			throw reason;
		}
	}
	override async *getQuerySequence<K extends DataKey<T>>(collection: K, query?: ItemQuery<T[K]>): AsyncIterableIterator<Items<T[K]>> {
		try {
			console.debug("⋯ ITERATE", collection, query);
			for await (const items of super.getQuerySequence(collection, query)) {
				console.debug("↩ ITERATE", collection, query, items);
				yield items;
			}
			console.debug("✔ ITERATE", collection, query);
		} catch (thrown) {
			console.error("✘ ITERATE", collection, query, thrown);
		}
	}
	override async setQuery<K extends DataKey<T>>(collection: K, query: ItemQuery<T[K]>, data: T[K]): Promise<void> {
		try {
			console.debug("⋯ SET", collection, query, data);
			await super.setQuery(collection, query, data);
			console.debug("✔ SET", collection, query, data);
		} catch (reason) {
			console.error("✘ SET", collection, query, data, reason);
			throw reason;
		}
	}
	override async updateQuery<K extends DataKey<T>>(collection: K, query: ItemQuery<T[K]>, updates: Updates): Promise<void> {
		try {
			console.debug("⋯ UPDATE", collection, query, updates);
			await super.updateQuery(collection, query, updates);
			console.debug("✔ UPDATE", collection, query, updates);
		} catch (reason) {
			console.error("✘ UPDATE", collection, query, updates, reason);
			throw reason;
		}
	}
	override async deleteQuery<K extends DataKey<T>>(collection: K, query: ItemQuery<T[K]>): Promise<void> {
		try {
			console.debug("⋯ DELETE", collection, query);
			await super.deleteQuery(collection, query);
			console.debug("✔ DELETE", collection, query);
		} catch (reason) {
			console.error("✘ DELETE", collection, query, reason);
			throw reason;
		}
	}
}
