/* eslint-disable no-console */

import type { Datas, Key } from "../util/data.js";
import type { ItemArray, ItemConstraints, ItemValue } from "../db/Item.js";
import type { Updates } from "../update/DataUpdate.js";
import type { PartialObserver } from "../observe/Observer.js";
import type { Unsubscribe } from "../observe/Observable.js";
import { ThroughObserver } from "../observe/ThroughObserver.js";
import { QueryConstraints } from "../constraint/QueryConstraints.js";
import { Provider, AsyncProvider } from "./Provider.js";
import type { ThroughProvider, AsyncThroughProvider } from "./ThroughProvider.js";

/** Provider that logs operations to a source provider to the console. */
abstract class AbstractDebugProvider<T extends Datas> {
	abstract readonly source: Provider<T> | AsyncProvider<T>;
	subscribeItem<K extends Key<T>>(collection: K, id: string, observer: PartialObserver<ItemValue<T[K]>>): Unsubscribe {
		const key = _getItemKey(collection, id);
		console.log(`Subscribe: ${key}:`);
		return this.source.subscribeItem(collection, id, new _DebugObserver(key, observer));
	}
	subscribeQuery<K extends Key<T>>(collection: K, constraints: ItemConstraints<T[K]>, observer: PartialObserver<ItemArray<T[K]>>): Unsubscribe {
		const key = _getQueryKey(collection, constraints);
		console.log(`Subscribe: ${key}:`);
		return this.source.subscribeQuery(collection, constraints, new _DebugObserver(key, observer));
	}
}

/** Observer that wraps errors in subscriptions in `ReferenceReadError` */
class _DebugObserver<T> extends ThroughObserver<T> {
	private _key: string;
	constructor(ref: string, target: PartialObserver<T>) {
		super(target);
		this._key = ref;
	}
	override error(reason: Error | unknown): void {
		console.log(`Error: Subscribe: ${this._key}`, reason);
		super.error(reason);
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
		console.log(`Get: ${key}:`);
		try {
			return this.source.getItem(collection, id);
		} catch (reason) {
			console.error(`Error: Get: ${key}:`, reason);
			throw reason;
		}
	}
	addItem<K extends Key<T>>(collection: K, data: T[K]): string {
		const key = collection;
		console.log(`Add: ${key}:`, data);
		try {
			return this.source.addItem(collection, data);
		} catch (reason) {
			console.error(`Error: Add: ${key}:`, reason);
			throw reason;
		}
	}
	setItem<K extends Key<T>>(collection: K, id: string, data: T[K]): void {
		const key = _getItemKey(collection, id);
		console.log(`Set: ${key}:`, data);
		try {
			return this.source.setItem(collection, id, data);
		} catch (reason) {
			console.error(`Error: Set: ${key}:`, reason);
			throw reason;
		}
	}
	updateItem<K extends Key<T>>(collection: K, id: string, updates: Updates<T[K]>): void {
		const key = _getItemKey(collection, id);
		console.log(`Update: ${key}:`, updates.updates);
		try {
			return this.source.updateItem(collection, id, updates);
		} catch (reason) {
			console.error(`Error: Update: ${key}:`, reason);
			throw reason;
		}
	}
	deleteItem<K extends Key<T>>(collection: K, id: string): void {
		const key = _getItemKey(collection, id);
		console.log(`Delete: ${key}:`);
		try {
			return this.source.deleteItem(collection, id);
		} catch (reason) {
			console.error(`Error: Delete: ${key}:`, reason);
			throw reason;
		}
	}
	getQuery<K extends Key<T>>(collection: K, constraints: ItemConstraints<T[K]>): ItemArray<T[K]> {
		const key = _getQueryKey(collection, constraints);
		console.log(`Get: ${key}:`);
		try {
			return this.source.getQuery(collection, constraints);
		} catch (reason) {
			console.error(`Error: Get: ${key}:`, reason);
			throw reason;
		}
	}
	setQuery<K extends Key<T>>(collection: K, constraints: ItemConstraints<T[K]>, data: T[K]): number {
		const key = _getQueryKey(collection, constraints);
		console.log(`Set: ${key}:`, data);
		try {
			return this.source.setQuery(collection, constraints, data);
		} catch (reason) {
			console.error(`Error: Set: ${key}:`, reason);
			throw reason;
		}
	}
	updateQuery<K extends Key<T>>(collection: K, constraints: ItemConstraints<T[K]>, updates: Updates<T[K]>): number {
		const key = _getQueryKey(collection, constraints);
		console.log(`Update: ${key}:`, updates.updates);
		try {
			return this.source.updateQuery(collection, constraints, updates);
		} catch (reason) {
			console.error(`Error: Update: ${key}:`, reason);
			throw reason;
		}
	}
	deleteQuery<K extends Key<T>>(collection: K, constraints: ItemConstraints<T[K]>): number {
		const key = _getQueryKey(collection, constraints);
		console.log(`Delete: ${key}:`);
		try {
			return this.source.deleteQuery(collection, constraints);
		} catch (reason) {
			console.error(`Error: Delete: ${key}:`, reason);
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
		console.log(`Get: ${key}:`);
		try {
			return await this.source.getItem(collection, id);
		} catch (reason) {
			console.error(`Error: Get: ${key}:`, reason);
			throw reason;
		}
	}
	async addItem<K extends Key<T>>(collection: K, data: T[K]): Promise<string> {
		const key = collection;
		console.log(`Add: ${key}:`, data);
		try {
			return await this.source.addItem(collection, data);
		} catch (reason) {
			console.error(`Error: Add: ${key}:`, reason);
			throw reason;
		}
	}
	async setItem<K extends Key<T>>(collection: K, id: string, data: T[K]): Promise<void> {
		const key = _getItemKey(collection, id);
		console.log(`Set: ${key}:`, data);
		try {
			return await this.source.setItem(collection, id, data);
		} catch (reason) {
			console.error(`Error: Set: ${key}:`, reason);
			throw reason;
		}
	}
	async updateItem<K extends Key<T>>(collection: K, id: string, updates: Updates<T[K]>): Promise<void> {
		const key = _getItemKey(collection, id);
		console.log(`Update: ${key}:`, updates.updates);
		try {
			return await this.source.updateItem(collection, id, updates);
		} catch (reason) {
			console.error(`Error: Update: ${key}:`, reason);
			throw reason;
		}
	}
	async deleteItem<K extends Key<T>>(collection: K, id: string): Promise<void> {
		const key = _getItemKey(collection, id);
		console.log(`Delete: ${key}:`);
		try {
			return await this.source.deleteItem(collection, id);
		} catch (reason) {
			console.error(`Error: Delete: ${key}:`, reason);
			throw reason;
		}
	}
	async getQuery<K extends Key<T>>(collection: K, constraints: ItemConstraints<T[K]>): Promise<ItemArray<T[K]>> {
		const key = _getQueryKey(collection, constraints);
		console.log(`Get: ${key}:`);
		try {
			return await this.source.getQuery(collection, constraints);
		} catch (reason) {
			console.error(`Error: Get: ${key}:`, reason);
			throw reason;
		}
	}
	async setQuery<K extends Key<T>>(collection: K, constraints: ItemConstraints<T[K]>, data: T[K]): Promise<number> {
		const key = _getQueryKey(collection, constraints);
		console.log(`Set: ${key}:`, data);
		try {
			return await this.source.setQuery(collection, constraints, data);
		} catch (reason) {
			console.error(`Error: Set: ${key}:`, reason);
			throw reason;
		}
	}
	async updateQuery<K extends Key<T>>(collection: K, constraints: ItemConstraints<T[K]>, updates: Updates<T[K]>): Promise<number> {
		const key = _getQueryKey(collection, constraints);
		console.log(`Update: ${key}:`, updates.updates);
		try {
			return await this.source.updateQuery(collection, constraints, updates);
		} catch (reason) {
			console.error(`Error: Update: ${key}:`, reason);
			throw reason;
		}
	}
	async deleteQuery<K extends Key<T>>(collection: K, constraints: ItemConstraints<T[K]>): Promise<number> {
		const key = _getQueryKey(collection, constraints);
		console.log(`Delete: ${key}:`);
		try {
			return await this.source.deleteQuery(collection, constraints);
		} catch (reason) {
			console.error(`Error: Delete: ${key}:`, reason);
			throw reason;
		}
	}
}

const _getItemKey = (collection: string, id: string): string => `${collection}/${id}`;
const _getQueryKey = (collection: string, constraints: QueryConstraints): string => `${collection}?${QueryConstraints.prototype.toString.call(constraints)}`;
