/* eslint-disable no-console */

import type { AsyncProvider, Provider } from "./Provider.js";
import type { AsyncThroughProvider, ThroughProvider } from "./ThroughProvider.js";
import type { ItemArray, ItemQuery, ItemValue } from "../db/ItemReference.js";
import type { Data } from "../util/data.js";
import type { Updates } from "../util/update.js";

/** Provider that logs operations to a source provider to the console. */
abstract class AbstractDebugProvider {
	abstract readonly source: Provider | AsyncProvider;
	async *getItemSequence(collection: string, id: string): AsyncIterableIterator<ItemValue> {
		try {
			console.debug("✔ ITERATE", collection, id);
			for await (const item of this.source.getItemSequence(collection, id)) {
				console.debug("✔ ITERATE", collection, id, "GOT", item);
				yield item;
			}
			console.debug("✔ ITERATE", collection, id);
		} catch (thrown) {
			console.error("✘ ITERATE", collection, id, thrown);
		}
	}
	async *getQuerySequence(collection: string, query: ItemQuery): AsyncIterableIterator<ItemArray> {
		try {
			console.debug("✔ ITERATE", collection, query);
			for await (const items of this.source.getQuerySequence(collection, query)) {
				console.debug("✔ ITERATE", collection, query, items);
				yield items;
			}
			console.debug("✔ ITERATE", collection, query);
		} catch (thrown) {
			console.error("✘ ITERATE", collection, query, thrown);
		}
	}
}

/** Provider that logs operations to a synchronous source provider to the console. */
export class DebugProvider extends AbstractDebugProvider implements ThroughProvider {
	readonly source: Provider;
	constructor(source: Provider) {
		super();
		this.source = source;
	}
	getItem(collection: string, id: string): ItemValue {
		try {
			const item = this.source.getItem(collection, id);
			console.debug("✔ GET", collection, id, "ITEM", item);
			return item;
		} catch (reason) {
			console.error("✘ GET", collection, id, reason);
			throw reason;
		}
	}
	addItem(collection: string, data: Data): string {
		try {
			const id = this.source.addItem(collection, data);
			console.debug("✔ ADD", collection, data, "ID", id);
			return id;
		} catch (reason) {
			console.error("✘ ADD", collection, data, reason);
			throw reason;
		}
	}
	setItem(collection: string, id: string, data: Data): void {
		try {
			this.source.setItem(collection, id, data);
			console.debug("✔ SET", collection, id, data);
		} catch (reason) {
			console.error("✘ SET", collection, id, data, reason);
			throw reason;
		}
	}
	updateItem(collection: string, id: string, updates: Updates): void {
		try {
			console.debug("✔ UPDATE", collection, id, updates);
			return this.source.updateItem(collection, id, updates);
		} catch (reason) {
			console.error("✘ UPDATE", collection, id, updates, reason);
			throw reason;
		}
	}
	deleteItem(collection: string, id: string): void {
		try {
			this.source.deleteItem(collection, id);
			console.debug("✔ DELETE", collection, id);
		} catch (reason) {
			console.error("✘ DELETE", collection, id, reason);
			throw reason;
		}
	}
	getQuery(collection: string, query: ItemQuery): ItemArray {
		try {
			const items = this.source.getQuery(collection, query);
			console.debug("✔ ✅ GET", collection, query, "ITEMS", items);
			return items;
		} catch (reason) {
			console.error("✘ GET", collection, query, reason);
			throw reason;
		}
	}
	setQuery(collection: string, query: ItemQuery, data: Data): number {
		try {
			const num = this.source.setQuery(collection, query, data);
			console.debug("✔ SET", collection, query, data, num);
			return num;
		} catch (reason) {
			console.error("✘ SET", collection, query, data, reason);
			throw reason;
		}
	}
	updateQuery(collection: string, query: ItemQuery, updates: Updates): number {
		try {
			const num = this.source.updateQuery(collection, query, updates);
			console.debug("✔ UPDATE", collection, query, updates, num);
			return num;
		} catch (reason) {
			console.error("✘ UPDATE", collection, query, updates, reason);
			throw reason;
		}
	}
	deleteQuery(collection: string, query: ItemQuery): number {
		try {
			const num = this.source.deleteQuery(collection, query);
			console.debug("✔ DELETE", collection, query, num);
			return num;
		} catch (reason) {
			console.error("✘ DELETE", collection, query, reason);
			throw reason;
		}
	}
}

/** Provider that logs operations to a synchronous source provider to the console. */
export class AsyncDebugProvider extends AbstractDebugProvider implements AsyncThroughProvider {
	readonly source: AsyncProvider;
	constructor(source: AsyncProvider) {
		super();
		this.source = source;
	}
	async getItem(collection: string, id: string): Promise<ItemValue> {
		try {
			console.debug("⋯ GET", collection, id);
			const item = await this.source.getItem(collection, id);
			console.debug("✔ GET", collection, id, "ITEM", item);
			return item;
		} catch (reason) {
			console.error("✘ GET", collection, id, reason);
			throw reason;
		}
	}
	async addItem(collection: string, data: Data): Promise<string> {
		try {
			console.debug("⋯ ADD", collection, data);
			const id = await this.source.addItem(collection, data);
			console.debug("✔ ADD", collection, id, data);
			return id;
		} catch (reason) {
			console.error("✘ ADD", collection, data, reason);
			throw reason;
		}
	}
	async setItem(collection: string, id: string, data: Data): Promise<void> {
		try {
			console.debug("⋯ SET", collection, id, data);
			await this.source.setItem(collection, id, data);
			console.debug("✔ SET", collection, id, data, 1);
		} catch (reason) {
			console.error("✘ SET", collection, id, data, reason);
			throw reason;
		}
	}
	async updateItem(collection: string, id: string, updates: Updates): Promise<void> {
		try {
			console.debug("⋯ UPDATE", collection, id, updates);
			await this.source.updateItem(collection, id, updates);
			console.debug("✔ UPDATE", collection, id, updates, 1);
		} catch (reason) {
			console.error("✘ UPDATE", collection, id, updates, reason);
			throw reason;
		}
	}
	async deleteItem(collection: string, id: string): Promise<void> {
		try {
			console.debug("⋯ DELETE", collection, id);
			await this.source.deleteItem(collection, id);
			console.debug("✔ DELETE", collection, id, 1);
		} catch (reason) {
			console.error("✘ DELETE", collection, id, reason);
			throw reason;
		}
	}
	async getQuery(collection: string, query: ItemQuery): Promise<ItemArray> {
		try {
			console.debug("⋯ GET", collection, query);
			const items = await this.source.getQuery(collection, query);
			console.debug("✔ GET", collection, query, "ITEMS", items);
			return items;
		} catch (reason) {
			console.error("✘ GET", collection, query, reason);
			throw reason;
		}
	}
	async setQuery(collection: string, query: ItemQuery, data: Data): Promise<number> {
		try {
			console.debug("⋯ SET", collection, query, data);
			const num = await this.source.setQuery(collection, query, data);
			console.debug("✔ SET", collection, query, data, num);
			return num;
		} catch (reason) {
			console.error("✘ SET", collection, query, data, reason);
			throw reason;
		}
	}
	async updateQuery(collection: string, query: ItemQuery, updates: Updates): Promise<number> {
		try {
			console.debug("⋯ UPDATE", collection, query, updates);
			const num = await this.source.updateQuery(collection, query, updates);
			console.debug("✔ UPDATE", collection, query, updates, num);
			return num;
		} catch (reason) {
			console.error("✘ UPDATE", collection, query, updates, reason);
			throw reason;
		}
	}
	async deleteQuery(collection: string, query: ItemQuery): Promise<number> {
		try {
			console.debug("⋯ DELETE", collection, query);
			const num = await this.source.deleteQuery(collection, query);
			console.debug("✔ DELETE", collection, query, num);
			return num;
		} catch (reason) {
			console.error("✘ DELETE", collection, query, reason);
			throw reason;
		}
	}
}
