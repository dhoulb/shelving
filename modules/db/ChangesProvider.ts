import type { MutableArray } from "../util/array.js";
import type { DataKey, Database } from "../util/data.js";
import type { ItemQuery } from "../util/item.js";
import type { Updates } from "../util/update.js";
import type { DatabaseChange, DatabaseChanges } from "./Change.js";
import { AsyncThroughProvider, ThroughProvider } from "./ThroughProvider.js";

/** Synchronous provider that keeps a log of any written changes to its `.changes` property. */
export class ChangesProvider<T extends Database> extends ThroughProvider<T> {
	get changes(): DatabaseChanges<T> {
		return this._changes;
	}
	readonly _changes: MutableArray<DatabaseChange<T>> = [];
	override addItem<K extends DataKey<T>>(collection: K, data: T[K]): string {
		const id = super.addItem(collection, data);
		this._changes.push({ action: "set", collection, id, data });
		return id;
	}
	override setItem<K extends DataKey<T>>(collection: K, id: string, data: T[K]): void {
		super.setItem(collection, id, data);
		this._changes.push({ action: "set", collection, id, data });
	}
	override updateItem<K extends DataKey<T>>(collection: K, id: string, updates: Updates<T[K]>): void {
		super.updateItem(collection, id, updates);
		this._changes.push({ action: "update", collection, id, updates });
	}
	override deleteItem<K extends DataKey<T>>(collection: K, id: string): void {
		super.deleteItem(collection, id);
		this._changes.push({ action: "delete", collection, id });
	}
	override setQuery<K extends DataKey<T>>(collection: K, query: ItemQuery<T[K]>, data: T[K]): void {
		super.setQuery(collection, query, data);
		this._changes.push({ action: "set", collection, query, data });
	}
	override updateQuery<K extends DataKey<T>>(collection: K, query: ItemQuery<T[K]>, updates: Updates<T[K]>): void {
		super.updateQuery(collection, query, updates);
		this._changes.push({ action: "update", collection, query, updates });
	}
	override deleteQuery<K extends DataKey<T>>(collection: K, query: ItemQuery<T[K]>): void {
		super.deleteQuery(collection, query);
		this._changes.push({ action: "delete", collection, query });
	}
}

/** Asynchronous provider that keeps a log of any written changes to its `.written` property. */
export class AsyncLoggedProvider<T extends Database> extends AsyncThroughProvider<T> {
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
