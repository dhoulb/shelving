import type { DataKey, Database } from "../util/data.js";
import type { Identifier, Item, Items, OptionalItem } from "../util/item.js";
import type { ItemQuery } from "../util/query.js";
import type { Sourceable } from "../util/source.js";
import type { Updates } from "../util/update.js";
import type { AsyncProvider, Provider } from "./Provider.js";

/** A provider that passes through to a synchronous source. */
export class ThroughProvider<I extends Identifier, T extends Database> implements Provider<I, T>, Sourceable<Provider<I, T>> {
	readonly source: Provider<I, T>;
	constructor(source: Provider<I, T>) {
		this.source = source;
	}
	getItem<K extends DataKey<T>>(collection: K, id: I): OptionalItem<I, T[K]> {
		return this.source.getItem(collection, id);
	}
	requireItem<K extends DataKey<T>>(collection: K, id: I): Item<I, T[K]> {
		return this.source.requireItem(collection, id);
	}
	getItemSequence<K extends DataKey<T>>(collection: K, id: I): AsyncIterable<OptionalItem<I, T[K]>> {
		return this.source.getItemSequence(collection, id);
	}
	addItem<K extends DataKey<T>>(collection: K, data: T[K]): I {
		return this.source.addItem(collection, data);
	}
	setItem<K extends DataKey<T>>(collection: K, id: I, data: T[K]): void {
		this.source.setItem(collection, id, data);
	}
	updateItem<K extends DataKey<T>>(collection: K, id: I, update: Updates<T[K]>): void {
		this.source.updateItem(collection, id, update);
	}
	deleteItem<K extends DataKey<T>>(collection: K, id: I): void {
		this.source.deleteItem(collection, id);
	}
	countQuery<K extends DataKey<T>>(collection: K, query?: ItemQuery<I, T[K]>): number {
		return this.source.countQuery(collection, query);
	}
	getQuery<K extends DataKey<T>>(collection: K, query?: ItemQuery<I, T[K]>): Items<I, T[K]> {
		return this.source.getQuery(collection, query);
	}
	getQuerySequence<K extends DataKey<T>>(collection: K, query?: ItemQuery<I, T[K]>): AsyncIterable<Items<I, T[K]>> {
		return this.source.getQuerySequence(collection, query);
	}
	setQuery<K extends DataKey<T>>(collection: K, query: ItemQuery<I, T[K]>, data: T[K]): void {
		this.source.setQuery(collection, query, data);
	}
	updateQuery<K extends DataKey<T>>(collection: K, query: ItemQuery<I, T[K]>, update: Updates<T[K]>): void {
		this.source.updateQuery(collection, query, update);
	}
	deleteQuery<K extends DataKey<T>>(collection: K, query: ItemQuery<I, T[K]>): void {
		this.source.deleteQuery(collection, query);
	}
	getFirst<K extends DataKey<T>>(collection: K, query: ItemQuery<I, T[K]>): OptionalItem<I, T[K]> {
		return this.source.getFirst(collection, query);
	}
	requireFirst<K extends DataKey<T>>(collection: K, query: ItemQuery<I, T[K]>): Item<I, T[K]> {
		return this.source.requireFirst(collection, query);
	}
}

/** A provider that passes through to an asynchronous source. */
export class AsyncThroughProvider<I extends Identifier, T extends Database>
	implements AsyncProvider<I, T>, Sourceable<AsyncProvider<I, T>>
{
	readonly source: AsyncProvider<I, T>;
	constructor(source: AsyncProvider<I, T>) {
		this.source = source;
	}
	getItem<K extends DataKey<T>>(collection: K, id: I): Promise<OptionalItem<I, T[K]>> {
		return this.source.getItem(collection, id);
	}
	requireItem<K extends DataKey<T>>(collection: K, id: I): Promise<Item<I, T[K]>> {
		return this.source.requireItem(collection, id);
	}
	getItemSequence<K extends DataKey<T>>(collection: K, id: I): AsyncIterable<OptionalItem<I, T[K]>> {
		return this.source.getItemSequence(collection, id);
	}
	addItem<K extends DataKey<T>>(collection: K, data: T[K]): Promise<I> {
		return this.source.addItem(collection, data);
	}
	setItem<K extends DataKey<T>>(collection: K, id: I, data: T[K]): Promise<void> {
		return this.source.setItem(collection, id, data);
	}
	updateItem<K extends DataKey<T>>(collection: K, id: I, updates: Updates<T[K]>): Promise<void> {
		return this.source.updateItem(collection, id, updates);
	}
	deleteItem<K extends DataKey<T>>(collection: K, id: I): Promise<void> {
		return this.source.deleteItem(collection, id);
	}
	countQuery<K extends DataKey<T>>(collection: K, query?: ItemQuery<I, T[K]>): Promise<number> {
		return this.source.countQuery(collection, query);
	}
	getQuery<K extends DataKey<T>>(collection: K, query?: ItemQuery<I, T[K]>): Promise<Items<I, T[K]>> {
		return this.source.getQuery(collection, query);
	}
	getQuerySequence<K extends DataKey<T>>(collection: K, query?: ItemQuery<I, T[K]>): AsyncIterable<Items<I, T[K]>> {
		return this.source.getQuerySequence(collection, query);
	}
	setQuery<K extends DataKey<T>>(collection: K, query: ItemQuery<I, T[K]>, data: T[K]): Promise<void> {
		return this.source.setQuery(collection, query, data);
	}
	updateQuery<K extends DataKey<T>>(collection: K, query: ItemQuery<I, T[K]>, updates: Updates<T[K]>): Promise<void> {
		return this.source.updateQuery(collection, query, updates);
	}
	deleteQuery<K extends DataKey<T>>(collection: K, query: ItemQuery<I, T[K]>): Promise<void> {
		return this.source.deleteQuery(collection, query);
	}
	getFirst<K extends DataKey<T>>(collection: K, query: ItemQuery<I, T[K]>): Promise<OptionalItem<I, T[K]>> {
		return this.source.getFirst(collection, query);
	}
	requireFirst<K extends DataKey<T>>(collection: K, query: ItemQuery<I, T[K]>): Promise<Item<I, T[K]>> {
		return this.source.requireFirst(collection, query);
	}
}
