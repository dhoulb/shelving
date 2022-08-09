/* eslint-disable no-console */

import type { Datas, Entities, Key, OptionalEntity } from "../util/data.js";
import type { DataUpdate } from "../update/DataUpdate.js";
import type { PartialObserver } from "../observe/Observer.js";
import type { Unsubscribe } from "../observe/Observable.js";
import { ThroughObserver } from "../observe/ThroughObserver.js";
import { AbstractProvider, Provider, AsyncProvider, ProviderDocument, ProviderCollection, ProviderQuery } from "./Provider.js";
import type { ThroughProvider, AsyncThroughProvider } from "./ThroughProvider.js";

/** Provider that logs operations to a source provider to the console. */
export abstract class AbstractDebugProvider<T extends Datas> extends AbstractProvider<T> {
	abstract readonly source: AbstractProvider<T>;
	subscribeDocument<K extends Key<T>>(ref: ProviderDocument<T, K>, observer: PartialObserver<OptionalEntity<T[K]>>): Unsubscribe {
		console.log(`Subscribe: ${ref}:`);
		return this.source.subscribeDocument(ref, new _DebugObserver(ref, observer));
	}
	subscribeQuery<K extends Key<T>>(ref: ProviderQuery<T, K>, observer: PartialObserver<Entities<T[K]>>): Unsubscribe {
		console.log(`Subscribe: ${ref}:`);
		return this.source.subscribeQuery(ref, new _DebugObserver(ref, observer));
	}
}

/** Observer that wraps errors in subscriptions in `ReferenceReadError` */
class _DebugObserver<T> extends ThroughObserver<T> {
	private _ref: ProviderCollection<Datas, string>;
	constructor(ref: ProviderCollection<Datas, string>, target: PartialObserver<T>) {
		super(target);
		this._ref = ref;
	}
	override error(reason: Error | unknown): void {
		console.log(`Error: Subscribe: ${this._ref}`, reason);
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
	getDocument<K extends Key<T>>(ref: ProviderDocument<T, K>): OptionalEntity<T[K]> {
		console.log(`Get: ${ref}:`);
		try {
			return this.source.getDocument(ref);
		} catch (reason) {
			console.error(`Error: Get: ${ref}:`, reason);
			throw reason;
		}
	}
	addDocument<K extends Key<T>>(ref: ProviderCollection<T, K>, data: T[K]): string {
		console.log(`Add: ${ref}:`, data);
		try {
			return this.source.addDocument(ref, data);
		} catch (reason) {
			console.error(`Error: Add: ${ref}:`, reason);
			throw reason;
		}
	}
	setDocument<K extends Key<T>>(ref: ProviderDocument<T, K>, data: T[K]): void {
		console.log(`Set: ${ref}:`, data);
		try {
			return this.source.setDocument(ref, data);
		} catch (reason) {
			console.error(`Error: Set: ${ref}:`, reason);
			throw reason;
		}
	}
	updateDocument<K extends Key<T>>(ref: ProviderDocument<T, K>, update: DataUpdate<T[K]>): void {
		console.log(`Update: ${ref}:`, update.updates);
		try {
			return this.source.updateDocument(ref, update);
		} catch (reason) {
			console.error(`Error: Update: ${ref}:`, reason);
			throw reason;
		}
	}
	deleteDocument<K extends Key<T>>(ref: ProviderDocument<T, K>): void {
		console.log(`Delete: ${ref}:`);
		try {
			return this.source.deleteDocument(ref);
		} catch (reason) {
			console.error(`Error: Delete: ${ref}:`, reason);
			throw reason;
		}
	}
	getQuery<K extends Key<T>>(ref: ProviderQuery<T, K>): Entities<T[K]> {
		console.log(`Get: ${ref}:`);
		try {
			return this.source.getQuery(ref);
		} catch (reason) {
			console.error(`Error: Get: ${ref}:`, reason);
			throw reason;
		}
	}
	setQuery<K extends Key<T>>(ref: ProviderQuery<T, K>, data: T[K]): number {
		console.log(`Set: ${ref}:`, data);
		try {
			return this.source.setQuery(ref, data);
		} catch (reason) {
			console.error(`Error: Set: ${ref}:`, reason);
			throw reason;
		}
	}
	updateQuery<K extends Key<T>>(ref: ProviderQuery<T, K>, update: DataUpdate<T[K]>): number {
		console.log(`Update: ${ref}:`, update.updates);
		try {
			return this.source.updateQuery(ref, update);
		} catch (reason) {
			console.error(`Error: Update: ${ref}:`, reason);
			throw reason;
		}
	}
	deleteQuery<K extends Key<T>>(ref: ProviderQuery<T, K>): number {
		console.log(`Delete: ${ref}:`);
		try {
			return this.source.deleteQuery(ref);
		} catch (reason) {
			console.error(`Error: Delete: ${ref}:`, reason);
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
	async getDocument<K extends Key<T>>(ref: ProviderDocument<T, K>): Promise<OptionalEntity<T[K]>> {
		console.log(`Get: ${ref}:`);
		try {
			return await this.source.getDocument(ref);
		} catch (reason) {
			console.error(`Error: Get: ${ref}:`, reason);
			throw reason;
		}
	}
	async addDocument<K extends Key<T>>(ref: ProviderQuery<T, K>, data: T[K]): Promise<string> {
		console.log(`Add: ${ref}:`, data);
		try {
			return await this.source.addDocument(ref, data);
		} catch (reason) {
			console.error(`Error: Add: ${ref}:`, reason);
			throw reason;
		}
	}
	async setDocument<K extends Key<T>>(ref: ProviderDocument<T, K>, data: T[K]): Promise<void> {
		console.log(`Set: ${ref}:`, data);
		try {
			return await this.source.setDocument(ref, data);
		} catch (reason) {
			console.error(`Error: Set: ${ref}:`, reason);
			throw reason;
		}
	}
	async updateDocument<K extends Key<T>>(ref: ProviderDocument<T, K>, update: DataUpdate<T[K]>): Promise<void> {
		console.log(`Update: ${ref}:`, update.updates);
		try {
			return await this.source.updateDocument(ref, update);
		} catch (reason) {
			console.error(`Error: Update: ${ref}:`, reason);
			throw reason;
		}
	}
	async deleteDocument<K extends Key<T>>(ref: ProviderDocument<T, K>): Promise<void> {
		console.log(`Delete: ${ref}:`);
		try {
			return await this.source.deleteDocument(ref);
		} catch (reason) {
			console.error(`Error: Delete: ${ref}:`, reason);
			throw reason;
		}
	}
	async getQuery<K extends Key<T>>(ref: ProviderQuery<T, K>): Promise<Entities<T[K]>> {
		console.log(`Get: ${ref}:`);
		try {
			return await this.source.getQuery(ref);
		} catch (reason) {
			console.error(`Error: Get: ${ref}:`, reason);
			throw reason;
		}
	}
	async setQuery<K extends Key<T>>(ref: ProviderQuery<T, K>, data: T[K]): Promise<number> {
		console.log(`Set: ${ref}:`, data);
		try {
			return await this.source.setQuery(ref, data);
		} catch (reason) {
			console.error(`Error: Set: ${ref}:`, reason);
			throw reason;
		}
	}
	async updateQuery<K extends Key<T>>(ref: ProviderQuery<T, K>, update: DataUpdate<T[K]>): Promise<number> {
		console.log(`Update: ${ref}:`, update.updates);
		try {
			return await this.source.updateQuery(ref, update);
		} catch (reason) {
			console.error(`Error: Update: ${ref}:`, reason);
			throw reason;
		}
	}
	async deleteQuery<K extends Key<T>>(ref: ProviderQuery<T, K>): Promise<number> {
		console.log(`Delete: ${ref}:`);
		try {
			return await this.source.deleteQuery(ref);
		} catch (reason) {
			console.error(`Error: Delete: ${ref}:`, reason);
			throw reason;
		}
	}
}
