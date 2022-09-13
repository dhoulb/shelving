import type { Datas, DataKey } from "../util/data.js";
import type { Sourceable } from "../util/source.js";
import type { ItemArray, ItemConstraints, ItemValue } from "../db/Item.js";
import type { Updates } from "../update/DataUpdate.js";
import type { Provider, AsyncProvider } from "./Provider.js";

/** A provider that passes through to a synchronous source. */
export class ThroughProvider<T extends Datas = Datas> implements Provider<T>, Sourceable<Provider<T>> {
	readonly source: Provider<T>;
	constructor(source: Provider<T>) {
		this.source = source;
	}
	getItem<K extends DataKey<T>>(collection: K, id: string): ItemValue<T[K]> {
		return this.source.getItem(collection, id);
	}
	getItemSequence<K extends DataKey<T>>(collection: K, id: string): AsyncIterable<ItemValue<T[K]>> {
		return this.source.getItemSequence(collection, id);
	}
	addItem<K extends DataKey<T>>(collection: K, data: T[K]): string {
		return this.source.addItem(collection, data);
	}
	setItem<K extends DataKey<T>>(collection: K, id: string, data: T[K]): void {
		return this.source.setItem(collection, id, data);
	}
	updateItem<K extends DataKey<T>>(collection: K, id: string, update: Updates<T[K]>): void {
		return this.source.updateItem(collection, id, update);
	}
	deleteItem<K extends DataKey<T>>(collection: K, id: string): void {
		return this.source.deleteItem(collection, id);
	}
	getQuery<K extends DataKey<T>>(collection: K, constraints: ItemConstraints<T[K]>): ItemArray<T[K]> {
		return this.source.getQuery(collection, constraints);
	}
	getQuerySequence<K extends DataKey<T>>(collection: K, constraints: ItemConstraints<T[K]>): AsyncIterable<ItemArray<T[K]>> {
		return this.source.getQuerySequence(collection, constraints);
	}
	setQuery<K extends DataKey<T>>(collection: K, constraints: ItemConstraints<T[K]>, data: T[K]): number {
		return this.source.setQuery(collection, constraints, data);
	}
	updateQuery<K extends DataKey<T>>(collection: K, constraints: ItemConstraints<T[K]>, update: Updates<T[K]>): number {
		return this.source.updateQuery(collection, constraints, update);
	}
	deleteQuery<K extends DataKey<T>>(collection: K, constraints: ItemConstraints<T[K]>): number {
		return this.source.deleteQuery(collection, constraints);
	}
}

/** A provider that passes through to an asynchronous source. */
export class AsyncThroughProvider<T extends Datas = Datas> implements AsyncProvider<T>, Sourceable<AsyncProvider<T>> {
	readonly source: AsyncProvider<T>;
	constructor(source: AsyncProvider<T>) {
		this.source = source;
	}
	getItem<K extends DataKey<T>>(collection: K, id: string): Promise<ItemValue<T[K]>> {
		return this.source.getItem(collection, id);
	}
	getItemSequence<K extends DataKey<T>>(collection: K, id: string): AsyncIterable<ItemValue<T[K]>> {
		return this.source.getItemSequence(collection, id);
	}
	addItem<K extends DataKey<T>>(collection: K, data: T[K]): Promise<string> {
		return this.source.addItem(collection, data);
	}
	setItem<K extends DataKey<T>>(collection: K, id: string, data: T[K]): Promise<void> {
		return this.source.setItem(collection, id, data);
	}
	updateItem<K extends DataKey<T>>(collection: K, id: string, updates: Updates<T[K]>): Promise<void> {
		return this.source.updateItem(collection, id, updates);
	}
	deleteItem<K extends DataKey<T>>(collection: K, id: string): Promise<void> {
		return this.source.deleteItem(collection, id);
	}
	getQuery<K extends DataKey<T>>(collection: K, constraints: ItemConstraints<T[K]>): Promise<ItemArray<T[K]>> {
		return this.source.getQuery(collection, constraints);
	}
	getQuerySequence<K extends DataKey<T>>(collection: K, constraints: ItemConstraints<T[K]>): AsyncIterable<ItemArray<T[K]>> {
		return this.source.getQuerySequence(collection, constraints);
	}
	setQuery<K extends DataKey<T>>(collection: K, constraints: ItemConstraints<T[K]>, data: T[K]): Promise<number> {
		return this.source.setQuery(collection, constraints, data);
	}
	updateQuery<K extends DataKey<T>>(collection: K, constraints: ItemConstraints<T[K]>, updates: Updates<T[K]>): Promise<number> {
		return this.source.updateQuery(collection, constraints, updates);
	}
	deleteQuery<K extends DataKey<T>>(collection: K, constraints: ItemConstraints<T[K]>): Promise<number> {
		return this.source.deleteQuery(collection, constraints);
	}
}
