import type { AsyncProvider, Provider } from "./Provider.js";
import type { DataKey, Database } from "../util/data.js";
import type { Item, ItemQuery, Items, OptionalItem } from "../util/item.js";
import type { Sourceable } from "../util/source.js";
import type { Updates } from "../util/update.js";

/** A provider that passes through to a synchronous source. */
export class ThroughProvider<T extends Database> implements Provider<T>, Sourceable<Provider<T>> {
	readonly source: Provider<T>;
	constructor(source: Provider<T>) {
		this.source = source;
	}
	getItem<K extends DataKey<T>>(collection: K, id: string): OptionalItem<T[K]> {
		return this.source.getItem(collection, id);
	}
	requireItem<K extends DataKey<T>>(collection: K, id: string): Item<T[K]> {
		return this.source.requireItem(collection, id);
	}
	getItemSequence<K extends DataKey<T>>(collection: K, id: string): AsyncIterable<OptionalItem<T[K]>> {
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
	countQuery<K extends DataKey<T>>(collection: K, query?: ItemQuery<T[K]>): number {
		return this.source.countQuery(collection, query);
	}
	getQuery<K extends DataKey<T>>(collection: K, query?: ItemQuery<T[K]>): Items<T[K]> {
		return this.source.getQuery(collection, query);
	}
	getQuerySequence<K extends DataKey<T>>(collection: K, query?: ItemQuery<T[K]>): AsyncIterable<Items<T[K]>> {
		return this.source.getQuerySequence(collection, query);
	}
	setQuery<K extends DataKey<T>>(collection: K, query: ItemQuery<T[K]>, data: T[K]): void {
		return this.source.setQuery(collection, query, data);
	}
	updateQuery<K extends DataKey<T>>(collection: K, query: ItemQuery<T[K]>, update: Updates<T[K]>): void {
		return this.source.updateQuery(collection, query, update);
	}
	deleteQuery<K extends DataKey<T>>(collection: K, query: ItemQuery<T[K]>): void {
		return this.source.deleteQuery(collection, query);
	}
	getFirst<K extends DataKey<T>>(collection: K, query: ItemQuery<T[K]>): OptionalItem<T[K]> {
		return this.source.getFirst(collection, query);
	}
	requireFirst<K extends DataKey<T>>(collection: K, query: ItemQuery<T[K]>): Item<T[K]> {
		return this.source.requireFirst(collection, query);
	}
}

/** A provider that passes through to an asynchronous source. */
export class AsyncThroughProvider<T extends Database> implements AsyncProvider<T>, Sourceable<AsyncProvider<T>> {
	readonly source: AsyncProvider<T>;
	constructor(source: AsyncProvider<T>) {
		this.source = source;
	}
	getItem<K extends DataKey<T>>(collection: K, id: string): Promise<OptionalItem<T[K]>> {
		return this.source.getItem(collection, id);
	}
	requireItem<K extends DataKey<T>>(collection: K, id: string): Promise<Item<T[K]>> {
		return this.source.requireItem(collection, id);
	}
	getItemSequence<K extends DataKey<T>>(collection: K, id: string): AsyncIterable<OptionalItem<T[K]>> {
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
	countQuery<K extends DataKey<T>>(collection: K, query?: ItemQuery<T[K]>): Promise<number> {
		return this.source.countQuery(collection, query);
	}
	getQuery<K extends DataKey<T>>(collection: K, query?: ItemQuery<T[K]>): Promise<Items<T[K]>> {
		return this.source.getQuery(collection, query);
	}
	getQuerySequence<K extends DataKey<T>>(collection: K, query?: ItemQuery<T[K]>): AsyncIterable<Items<T[K]>> {
		return this.source.getQuerySequence(collection, query);
	}
	setQuery<K extends DataKey<T>>(collection: K, query: ItemQuery<T[K]>, data: T[K]): Promise<void> {
		return this.source.setQuery(collection, query, data);
	}
	updateQuery<K extends DataKey<T>>(collection: K, query: ItemQuery<T[K]>, updates: Updates<T[K]>): Promise<void> {
		return this.source.updateQuery(collection, query, updates);
	}
	deleteQuery<K extends DataKey<T>>(collection: K, query: ItemQuery<T[K]>): Promise<void> {
		return this.source.deleteQuery(collection, query);
	}
	getFirst<K extends DataKey<T>>(collection: K, query: ItemQuery<T[K]>): Promise<OptionalItem<T[K]>> {
		return this.source.getFirst(collection, query);
	}
	requireFirst<K extends DataKey<T>>(collection: K, query: ItemQuery<T[K]>): Promise<Item<T[K]>> {
		return this.source.requireFirst(collection, query);
	}
}
