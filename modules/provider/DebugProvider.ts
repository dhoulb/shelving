/* eslint-disable no-console */

import type { Data } from "../util/data.js";
import type { ItemArray, ItemStatement, ItemValue } from "../db/Item.js";
import type { Updates } from "../update/DataUpdate.js";
import { Statement } from "../constraint/Statement.js";
import { Provider, AsyncProvider } from "./Provider.js";
import type { ThroughProvider, AsyncThroughProvider } from "./ThroughProvider.js";

/** Provider that logs operations to a source provider to the console. */
abstract class AbstractDebugProvider {
	abstract readonly source: Provider | AsyncProvider;
	async *getItemSequence(collection: string, id: string): AsyncIterableIterator<ItemValue> {
		const key = _getItemKey(collection, id);
		try {
			console.log("ITERATE", key, "DATA:");
			for await (const item of this.source.getItemSequence(collection, id)) {
				console.log("ITERATE", key, "GOT:", item);
				yield item;
			}
			console.log("ITERATE", key, "DONE");
		} catch (thrown) {
			console.error("ITERATE", key, thrown);
		}
	}
	async *getQuerySequence(collection: string, constraints: ItemStatement): AsyncIterableIterator<ItemArray> {
		const key = _getQueryKey(collection, constraints);
		try {
			console.log("ITERATE", key, "DATA:");
			for await (const items of this.source.getQuerySequence(collection, constraints)) {
				console.log("ITERATE", key, "ITEMS:", items);
				yield items;
			}
			console.log("ITERATE", key, "DONE");
		} catch (thrown) {
			console.error("ITERATE", key, thrown);
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
		const key = _getItemKey(collection, id);
		try {
			const item = this.source.getItem(collection, id);
			console.log("GET:", key, "ITEM:", item);
			return item;
		} catch (reason) {
			console.error("GET:", key, "ERROR:", reason);
			throw reason;
		}
	}
	addItem(collection: string, data: Data): string {
		const key = collection;
		try {
			const id = this.source.addItem(collection, data);
			console.log("ADD", key, "DATA:", data, "ID", id);
			return id;
		} catch (reason) {
			console.error("ADD", key, "DATA:", data, "ERROR:", reason);
			throw reason;
		}
	}
	setItem(collection: string, id: string, data: Data): void {
		const key = _getItemKey(collection, id);
		try {
			this.source.setItem(collection, id, data);
			console.log("SET:", key, "DATA:", data);
		} catch (reason) {
			console.error("SET:", key, "DATA:", data, "ERROR:", reason);
			throw reason;
		}
	}
	updateItem(collection: string, id: string, updates: Updates): void {
		const key = _getItemKey(collection, id);
		try {
			console.log("UPDATE:", key, "UPDATES:", updates);
			return this.source.updateItem(collection, id, updates);
		} catch (reason) {
			console.error("UPDATE:", key, "UPDATES:", updates, "ERROR:", reason);
			throw reason;
		}
	}
	deleteItem(collection: string, id: string): void {
		const key = _getItemKey(collection, id);
		try {
			this.source.deleteItem(collection, id);
			console.log("DELETE:", key);
		} catch (reason) {
			console.error("DELETE:", key, "ERROR:", reason);
			throw reason;
		}
	}
	getQuery(collection: string, constraints: ItemStatement): ItemArray {
		const key = _getQueryKey(collection, constraints);
		try {
			const items = this.source.getQuery(collection, constraints);
			console.log("GET:", key, "ITEMS:", items);
			return items;
		} catch (reason) {
			console.error("GET:", key, "ERROR:", reason);
			throw reason;
		}
	}
	setQuery(collection: string, constraints: ItemStatement, data: Data): number {
		const key = _getQueryKey(collection, constraints);
		try {
			const num = this.source.setQuery(collection, constraints, data);
			console.log("SET:", key, "DATA:", data, "DONE:", num);
			return num;
		} catch (reason) {
			console.error("SET:", key, "DATA:", data, "ERROR:", reason);
			throw reason;
		}
	}
	updateQuery(collection: string, constraints: ItemStatement, updates: Updates): number {
		const key = _getQueryKey(collection, constraints);
		try {
			const num = this.source.updateQuery(collection, constraints, updates);
			console.log("UPDATE:", key, "UPDATES:", updates, "DONE:", num);
			return num;
		} catch (reason) {
			console.error("UPDATE:", key, "UPDATES:", updates, "ERROR:", reason);
			throw reason;
		}
	}
	deleteQuery(collection: string, constraints: ItemStatement): number {
		const key = _getQueryKey(collection, constraints);
		try {
			const num = this.source.deleteQuery(collection, constraints);
			console.log("DELETE:", key, "DONE:", num);
			return num;
		} catch (reason) {
			console.error("DELETE:", key, "ERROR:", reason);
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
		const key = _getItemKey(collection, id);
		try {
			console.log("GET:", key);
			const item = await this.source.getItem(collection, id);
			console.log("GET:", key, "ITEM:", item);
			return item;
		} catch (reason) {
			console.error("GET:", key, "ERROR:", reason);
			throw reason;
		}
	}
	async addItem(collection: string, data: Data): Promise<string> {
		const key = collection;
		try {
			console.log("ADD", key, "DATA:", data);
			const id = await this.source.addItem(collection, data);
			console.log("ADD", key, "DATA:", data, "ID:", id);
			return id;
		} catch (reason) {
			console.error("ADD", key, "DATA:", data, "ERROR:", reason);
			throw reason;
		}
	}
	async setItem(collection: string, id: string, data: Data): Promise<void> {
		const key = _getItemKey(collection, id);
		try {
			console.log("SET:", key, "DATA:", data);
			await this.source.setItem(collection, id, data);
			console.log("SET:", key, "DATA:", data, "DONE:", 1);
		} catch (reason) {
			console.error("SET:", key, "DATA:", data, "ERROR:", reason);
			throw reason;
		}
	}
	async updateItem(collection: string, id: string, updates: Updates): Promise<void> {
		const key = _getItemKey(collection, id);
		try {
			console.log("UPDATE:", key, "UPDATES:", updates);
			await this.source.updateItem(collection, id, updates);
			console.log("UPDATE:", key, "UPDATES:", updates, "DONE:", 1);
		} catch (reason) {
			console.error("UPDATE:", key, "UPDATES:", updates, "ERROR:", reason);
			throw reason;
		}
	}
	async deleteItem(collection: string, id: string): Promise<void> {
		const key = _getItemKey(collection, id);
		try {
			console.log("DELETE:", key);
			await this.source.deleteItem(collection, id);
			console.log("DELETE:", key, "DONE:", 1);
		} catch (reason) {
			console.error("DELETE:", key, "ERROR:", reason);
			throw reason;
		}
	}
	async getQuery(collection: string, constraints: ItemStatement): Promise<ItemArray> {
		const key = _getQueryKey(collection, constraints);
		try {
			console.log("GET:", key);
			const items = await this.source.getQuery(collection, constraints);
			console.log("GET:", key, "ITEMS:", items);
			return items;
		} catch (reason) {
			console.error("GET:", key, "ERROR:", reason);
			throw reason;
		}
	}
	async setQuery(collection: string, constraints: ItemStatement, data: Data): Promise<number> {
		const key = _getQueryKey(collection, constraints);
		try {
			console.log("SET:", key, "DATA:", data);
			const num = await this.source.setQuery(collection, constraints, data);
			console.log("SET:", key, "DATA:", data, "DONE:", num);
			return num;
		} catch (reason) {
			console.error("SET:", key, "DATA:", data, "ERROR:", reason);
			throw reason;
		}
	}
	async updateQuery(collection: string, constraints: ItemStatement, updates: Updates): Promise<number> {
		const key = _getQueryKey(collection, constraints);
		try {
			console.log("UPDATE:", key, "UPDATES:", updates);
			const num = await this.source.updateQuery(collection, constraints, updates);
			console.log("UPDATE:", key, "UPDATES:", updates, "DONE:", num);
			return num;
		} catch (reason) {
			console.error("UPDATE:", key, "UPDATES:", updates, "ERROR:", reason);
			throw reason;
		}
	}
	async deleteQuery(collection: string, constraints: ItemStatement): Promise<number> {
		const key = _getQueryKey(collection, constraints);
		try {
			console.log("DELETE:", key);
			const num = await this.source.deleteQuery(collection, constraints);
			console.log("DELETE:", key, "DONE:", num);
			return num;
		} catch (reason) {
			console.error("DELETE:", key, "ERROR:", reason);
			throw reason;
		}
	}
}

const _getItemKey = (collection: string, id: string): string => `${collection}/${id}`;
const _getQueryKey = (collection: string, statement: Statement): string => `${collection}?${Statement.prototype.toString.call(statement)}`;
