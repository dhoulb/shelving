/* eslint-disable no-console */

import type { Datas, Key } from "../util/data.js";
import type { ItemArray, ItemConstraints, ItemValue } from "../db/Item.js";
import type { Updates } from "../update/DataUpdate.js";
import { QueryConstraints } from "../constraint/QueryConstraints.js";
import { Provider, AsyncProvider } from "./Provider.js";
import type { ThroughProvider, AsyncThroughProvider } from "./ThroughProvider.js";

/** Provider that logs operations to a source provider to the console. */
abstract class AbstractDebugProvider<T extends Datas> {
	abstract readonly source: Provider<T> | AsyncProvider<T>;
	async *getItemSequence<K extends Key<T>>(collection: K, id: string): AsyncIterableIterator<ItemValue<T[K]>> {
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
	async *getQuerySequence<K extends Key<T>>(collection: K, constraints: ItemConstraints<T[K]>): AsyncIterableIterator<ItemArray<T[K]>> {
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
export class DebugProvider<T extends Datas> extends AbstractDebugProvider<T> implements ThroughProvider<T> {
	readonly source: Provider<T>;
	constructor(source: Provider<T>) {
		super();
		this.source = source;
	}
	getItem<K extends Key<T>>(collection: K, id: string): ItemValue<T[K]> {
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
	addItem<K extends Key<T>>(collection: K, data: T[K]): string {
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
	setItem<K extends Key<T>>(collection: K, id: string, data: T[K]): void {
		const key = _getItemKey(collection, id);
		try {
			this.source.setItem(collection, id, data);
			console.log("SET:", key, "DATA:", data);
		} catch (reason) {
			console.error("SET:", key, "DATA:", data, "ERROR:", reason);
			throw reason;
		}
	}
	updateItem<K extends Key<T>>(collection: K, id: string, updates: Updates<T[K]>): void {
		const key = _getItemKey(collection, id);
		try {
			console.log("UPDATE:", key, "UPDATES:", updates);
			return this.source.updateItem(collection, id, updates);
		} catch (reason) {
			console.error("UPDATE:", key, "UPDATES:", updates, "ERROR:", reason);
			throw reason;
		}
	}
	deleteItem<K extends Key<T>>(collection: K, id: string): void {
		const key = _getItemKey(collection, id);
		try {
			this.source.deleteItem(collection, id);
			console.log("DELETE:", key);
		} catch (reason) {
			console.error("DELETE:", key, "ERROR:", reason);
			throw reason;
		}
	}
	getQuery<K extends Key<T>>(collection: K, constraints: ItemConstraints<T[K]>): ItemArray<T[K]> {
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
	setQuery<K extends Key<T>>(collection: K, constraints: ItemConstraints<T[K]>, data: T[K]): number {
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
	updateQuery<K extends Key<T>>(collection: K, constraints: ItemConstraints<T[K]>, updates: Updates<T[K]>): number {
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
	deleteQuery<K extends Key<T>>(collection: K, constraints: ItemConstraints<T[K]>): number {
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
export class AsyncDebugProvider<T extends Datas> extends AbstractDebugProvider<T> implements AsyncThroughProvider<T> {
	readonly source: AsyncProvider<T>;
	constructor(source: AsyncProvider<T>) {
		super();
		this.source = source;
	}
	async getItem<K extends Key<T>>(collection: K, id: string): Promise<ItemValue<T[K]>> {
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
	async addItem<K extends Key<T>>(collection: K, data: T[K]): Promise<string> {
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
	async setItem<K extends Key<T>>(collection: K, id: string, data: T[K]): Promise<void> {
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
	async updateItem<K extends Key<T>>(collection: K, id: string, updates: Updates<T[K]>): Promise<void> {
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
	async deleteItem<K extends Key<T>>(collection: K, id: string): Promise<void> {
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
	async getQuery<K extends Key<T>>(collection: K, constraints: ItemConstraints<T[K]>): Promise<ItemArray<T[K]>> {
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
	async setQuery<K extends Key<T>>(collection: K, constraints: ItemConstraints<T[K]>, data: T[K]): Promise<number> {
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
	async updateQuery<K extends Key<T>>(collection: K, constraints: ItemConstraints<T[K]>, updates: Updates<T[K]>): Promise<number> {
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
	async deleteQuery<K extends Key<T>>(collection: K, constraints: ItemConstraints<T[K]>): Promise<number> {
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
const _getQueryKey = (collection: string, constraints: QueryConstraints): string => `${collection}?${QueryConstraints.prototype.toString.call(constraints)}`;
