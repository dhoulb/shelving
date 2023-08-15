/* eslint-disable no-console */

import type { AbstractProvider, AsyncProvider, Provider } from "./Provider.js";
import type { AsyncThroughProvider, ThroughProvider } from "./ThroughProvider.js";
import type { DataKey, Database } from "../util/data.js";
import type { ItemQuery, Items, OptionalItem } from "../util/item.js";
import type { Updates } from "../util/update.js";

/** Provider that logs operations to a source provider to the console. */
abstract class AbstractDebugProvider<T extends Database> {
	abstract readonly source: AbstractProvider<T>;
	async *getItemSequence<K extends DataKey<T>>(collection: K, id: string): AsyncIterableIterator<OptionalItem<T[K]>> {
		try {
			console.debug("⋯ ITERATE", collection, id);
			for await (const item of this.source.getItemSequence(collection, id)) {
				console.debug("↩ ITERATE", collection, id, item);
				yield item;
			}
			console.debug("✔ ITERATE", collection, id);
		} catch (thrown) {
			console.error("✘ ITERATE", collection, id, thrown);
		}
	}
	async *getQuerySequence<K extends DataKey<T>>(collection: K, query?: ItemQuery<T[K]>): AsyncIterableIterator<Items<T[K]>> {
		try {
			console.debug("⋯ ITERATE", collection, query);
			for await (const items of this.source.getQuerySequence(collection, query)) {
				console.debug("↩ ITERATE", collection, query, items);
				yield items;
			}
			console.debug("✔ ITERATE", collection, query);
		} catch (thrown) {
			console.error("✘ ITERATE", collection, query, thrown);
		}
	}
}

/** Provider that logs operations to a synchronous source provider to the console. */
export class DebugProvider<T extends Database> extends AbstractDebugProvider<T> implements ThroughProvider<T> {
	readonly source: Provider<T>;
	constructor(source: Provider<T>) {
		super();
		this.source = source;
	}
	getItem<K extends DataKey<T>>(collection: K, id: string): OptionalItem<T[K]> {
		try {
			const item = this.source.getItem(collection, id);
			console.debug("↩ GET", collection, id, item);
			return item;
		} catch (reason) {
			console.error("✘ GET", collection, id, reason);
			throw reason;
		}
	}
	addItem<K extends DataKey<T>>(collection: K, data: T[K]): string {
		try {
			const id = this.source.addItem(collection, data);
			console.debug("✔ ADD", collection, data, id);
			return id;
		} catch (reason) {
			console.error("✘ ADD", collection, data, reason);
			throw reason;
		}
	}
	setItem<K extends DataKey<T>>(collection: K, id: string, data: T[K]): void {
		try {
			this.source.setItem(collection, id, data);
			console.debug("✔ SET", collection, id, data);
		} catch (reason) {
			console.error("✘ SET", collection, id, data, reason);
			throw reason;
		}
	}
	updateItem<K extends DataKey<T>>(collection: K, id: string, updates: Updates): void {
		try {
			this.source.updateItem(collection, id, updates);
			console.debug("✔ UPDATE", collection, id, updates);
		} catch (reason) {
			console.error("✘ UPDATE", collection, id, updates, reason);
			throw reason;
		}
	}
	deleteItem<K extends DataKey<T>>(collection: K, id: string): void {
		try {
			this.source.deleteItem(collection, id);
			console.debug("✔ DELETE", collection, id);
		} catch (reason) {
			console.error("✘ DELETE", collection, id, reason);
			throw reason;
		}
	}
	countQuery<K extends DataKey<T>>(collection: K, query?: ItemQuery<T[K]>): number {
		try {
			const count = this.source.countQuery(collection, query);
			console.debug("✔ GET", collection, query, count);
			return count;
		} catch (reason) {
			console.error("✘ GET", collection, query, reason);
			throw reason;
		}
	}
	getQuery<K extends DataKey<T>>(collection: K, query?: ItemQuery<T[K]>): Items<T[K]> {
		try {
			const items = this.source.getQuery(collection, query);
			console.debug("✔ GET", collection, query, items);
			return items;
		} catch (reason) {
			console.error("✘ GET", collection, query, reason);
			throw reason;
		}
	}
	setQuery<K extends DataKey<T>>(collection: K, query: ItemQuery<T[K]>, data: T[K]): void {
		try {
			this.source.setQuery(collection, query, data);
			console.debug("✔ SET", collection, query, data);
		} catch (reason) {
			console.error("✘ SET", collection, query, data, reason);
			throw reason;
		}
	}
	updateQuery<K extends DataKey<T>>(collection: K, query: ItemQuery<T[K]>, updates: Updates): void {
		try {
			this.source.updateQuery(collection, query, updates);
			console.debug("✔ UPDATE", collection, query, updates);
		} catch (reason) {
			console.error("✘ UPDATE", collection, query, updates, reason);
			throw reason;
		}
	}
	deleteQuery<K extends DataKey<T>>(collection: K, query: ItemQuery<T[K]>): void {
		try {
			this.source.deleteQuery(collection, query);
			console.debug("✔ DELETE", collection, query);
		} catch (reason) {
			console.error("✘ DELETE", collection, query, reason);
			throw reason;
		}
	}
}

/** Provider that logs operations to a synchronous source provider to the console. */
export class AsyncDebugProvider<T extends Database> extends AbstractDebugProvider<T> implements AsyncThroughProvider<T> {
	readonly source: AsyncProvider<T>;
	constructor(source: AsyncProvider<T>) {
		super();
		this.source = source;
	}
	async getItem<K extends DataKey<T>>(collection: K, id: string): Promise<OptionalItem<T[K]>> {
		try {
			console.debug("⋯ GET", collection, id);
			const item = await this.source.getItem(collection, id);
			console.debug("↩ GET", collection, id, item);
			return item;
		} catch (reason) {
			console.error("✘ GET", collection, id, reason);
			throw reason;
		}
	}
	async addItem<K extends DataKey<T>>(collection: K, data: T[K]): Promise<string> {
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
	async setItem<K extends DataKey<T>>(collection: K, id: string, data: T[K]): Promise<void> {
		try {
			console.debug("⋯ SET", collection, id, data);
			await this.source.setItem(collection, id, data);
			console.debug("✔ SET", collection, id, data, 1);
		} catch (reason) {
			console.error("✘ SET", collection, id, data, reason);
			throw reason;
		}
	}
	async updateItem<K extends DataKey<T>>(collection: K, id: string, updates: Updates): Promise<void> {
		try {
			console.debug("⋯ UPDATE", collection, id, updates);
			await this.source.updateItem(collection, id, updates);
			console.debug("✔ UPDATE", collection, id, updates, 1);
		} catch (reason) {
			console.error("✘ UPDATE", collection, id, updates, reason);
			throw reason;
		}
	}
	async deleteItem<K extends DataKey<T>>(collection: K, id: string): Promise<void> {
		try {
			console.debug("⋯ DELETE", collection, id);
			await this.source.deleteItem(collection, id);
			console.debug("✔ DELETE", collection, id, 1);
		} catch (reason) {
			console.error("✘ DELETE", collection, id, reason);
			throw reason;
		}
	}
	async countQuery<K extends DataKey<T>>(collection: K, query: ItemQuery<T[K]>): Promise<number> {
		try {
			console.debug("⋯ COUNT", collection, query);
			const count = await this.source.countQuery(collection, query);
			console.debug("✔ COUNT", collection, query, count);
			return count;
		} catch (reason) {
			console.error("✘ COUNT", collection, query, reason);
			throw reason;
		}
	}
	async getQuery<K extends DataKey<T>>(collection: K, query: ItemQuery<T[K]>): Promise<Items<T[K]>> {
		try {
			console.debug("⋯ GET", collection, query);
			const items = await this.source.getQuery(collection, query);
			console.debug("✔ GET", collection, query, items);
			return items;
		} catch (reason) {
			console.error("✘ GET", collection, query, reason);
			throw reason;
		}
	}
	async setQuery<K extends DataKey<T>>(collection: K, query: ItemQuery<T[K]>, data: T[K]): Promise<void> {
		try {
			console.debug("⋯ SET", collection, query, data);
			await this.source.setQuery(collection, query, data);
			console.debug("✔ SET", collection, query, data);
		} catch (reason) {
			console.error("✘ SET", collection, query, data, reason);
			throw reason;
		}
	}
	async updateQuery<K extends DataKey<T>>(collection: K, query: ItemQuery<T[K]>, updates: Updates): Promise<void> {
		try {
			console.debug("⋯ UPDATE", collection, query, updates);
			await this.source.updateQuery(collection, query, updates);
			console.debug("✔ UPDATE", collection, query, updates);
		} catch (reason) {
			console.error("✘ UPDATE", collection, query, updates, reason);
			throw reason;
		}
	}
	async deleteQuery<K extends DataKey<T>>(collection: K, query: ItemQuery<T[K]>): Promise<void> {
		try {
			console.debug("⋯ DELETE", collection, query);
			await this.source.deleteQuery(collection, query);
			console.debug("✔ DELETE", collection, query);
		} catch (reason) {
			console.error("✘ DELETE", collection, query, reason);
			throw reason;
		}
	}
}
