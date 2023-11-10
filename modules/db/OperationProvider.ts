import type { AsyncProvider, Provider } from "./Provider.js";
import type { MutableArray } from "../util/array.js";
import type { AsyncValueCallback, ValueCallback } from "../util/callback.js";
import type { DataKey, Database } from "../util/data.js";
import type { ItemQuery } from "../util/item.js";
import type { Updates } from "../util/update.js";
import { type DatabaseChange, type DatabaseChanges, writeAsyncChange, writeChange } from "../change/Change.js";
import { type Optional, notOptional } from "../util/optional.js";
import { AsyncThroughProvider, ThroughProvider } from "./ThroughProvider.js";

/** Synchronous callback that runs write operations on asynchronous provider. */
export type Operation<T extends Database> = ValueCallback<Provider<T>> | DatabaseChange<T>;

/** Write a set of operations or changes to a synchronous provider and return an array of the changes that were written. */
export function writeOperations<T extends Database>(provider: Provider<T>, ...operations: Optional<DatabaseChange<T> | Operation<T>>[]): DatabaseChanges<T> {
	const changed = operations.filter(notOptional).map(op => {
		if (typeof op === "function") {
			const db = new OperationProvider(provider);
			op(db);
			return db.written;
		} else {
			return writeChange(provider, op);
		}
	});
	return changed.flat();
}

/** Synchronous provider that keeps a log of any written changes to its `.written` property. */
export class OperationProvider<T extends Database> extends ThroughProvider<T> {
	get written(): DatabaseChanges<T> {
		return this._written;
	}
	readonly _written: MutableArray<DatabaseChange<T>> = [];
	override addItem<K extends DataKey<T>>(collection: K, data: T[K]): string {
		const id = super.addItem(collection, data);
		this._written.push({ action: "set", collection, id, data });
		return id;
	}
	override setItem<K extends DataKey<T>>(collection: K, id: string, data: T[K]): void {
		super.setItem(collection, id, data);
		this._written.push({ action: "set", collection, id, data });
	}
	override updateItem<K extends DataKey<T>>(collection: K, id: string, updates: Updates<T[K]>): void {
		super.updateItem(collection, id, updates);
		this._written.push({ action: "update", collection, id, updates });
	}
	override deleteItem<K extends DataKey<T>>(collection: K, id: string): void {
		super.deleteItem(collection, id);
		this._written.push({ action: "delete", collection, id });
	}
	override setQuery<K extends DataKey<T>>(collection: K, query: ItemQuery<T[K]>, data: T[K]): void {
		super.setQuery(collection, query, data);
		this._written.push({ action: "set", collection, query, data });
	}
	override updateQuery<K extends DataKey<T>>(collection: K, query: ItemQuery<T[K]>, updates: Updates<T[K]>): void {
		super.updateQuery(collection, query, updates);
		this._written.push({ action: "update", collection, query, updates });
	}
	override deleteQuery<K extends DataKey<T>>(collection: K, query: ItemQuery<T[K]>): void {
		super.deleteQuery(collection, query);
		this._written.push({ action: "delete", collection, query });
	}
}

/** Synchronous callback that runs write operations on asynchronous provider. */
export type AsyncOperation<T extends Database> = AsyncValueCallback<AsyncProvider<T>> | DatabaseChange<T>;

/** Write a set of operations or changes to an asynchronous provider and return an array of the changes that were written. */
export async function writeAsyncOperations<T extends Database>(provider: AsyncProvider<T>, ...operations: Optional<AsyncOperation<T>>[]): Promise<DatabaseChanges<T>> {
	const changed = await Promise.all(
		operations.filter(notOptional).map(async op => {
			if (typeof op === "function") {
				const db = new AsyncOperationProvider(provider);
				await op(db);
				return db.written;
			} else {
				return writeAsyncChange(provider, op);
			}
		}),
	);
	return changed.flat();
}

/** Asynchronous provider that keeps a log of any written changes to its `.written` property. */
export class AsyncOperationProvider<T extends Database> extends AsyncThroughProvider<T> {
	get written(): DatabaseChanges<T> {
		return this._written;
	}
	readonly _written: MutableArray<DatabaseChange<T>> = [];
	override async addItem<K extends DataKey<T>>(collection: K, data: T[K]): Promise<string> {
		const id = await super.addItem(collection, data);
		this._written.push({ action: "set", collection, id, data });
		return id;
	}
	override async setItem<K extends DataKey<T>>(collection: K, id: string, data: T[K]): Promise<void> {
		await super.setItem(collection, id, data);
		this._written.push({ action: "set", collection, id, data });
	}
	override async updateItem<K extends DataKey<T>>(collection: K, id: string, updates: Updates<T[K]>): Promise<void> {
		await super.updateItem(collection, id, updates);
		this._written.push({ action: "update", collection, id, updates });
	}
	override async deleteItem<K extends DataKey<T>>(collection: K, id: string): Promise<void> {
		await super.deleteItem(collection, id);
		this._written.push({ action: "delete", collection, id });
	}
	override async setQuery<K extends DataKey<T>>(collection: K, query: ItemQuery<T[K]>, data: T[K]): Promise<void> {
		await super.setQuery(collection, query, data);
		this._written.push({ action: "set", collection, query, data });
	}
	override async updateQuery<K extends DataKey<T>>(collection: K, query: ItemQuery<T[K]>, updates: Updates<T[K]>): Promise<void> {
		await super.updateQuery(collection, query, updates);
		this._written.push({ action: "update", collection, query, updates });
	}
	override async deleteQuery<K extends DataKey<T>>(collection: K, query: ItemQuery<T[K]>): Promise<void> {
		await super.deleteQuery(collection, query);
		this._written.push({ action: "delete", collection, query });
	}
}
