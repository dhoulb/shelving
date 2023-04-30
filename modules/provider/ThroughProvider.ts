import type { AsyncProvider, Provider } from "./Provider.js";
import type { ItemArray, ItemQuery, ItemValue } from "../db/ItemReference.js";
import type { Data } from "../util/data.js";
import type { Sourceable } from "../util/source.js";
import type { Updates } from "../util/update.js";

/** A provider that passes through to a synchronous source. */
export class ThroughProvider implements Provider, Sourceable<Provider> {
	readonly source: Provider;
	constructor(source: Provider) {
		this.source = source;
	}
	getItem(collection: string, id: string): ItemValue {
		return this.source.getItem(collection, id);
	}
	getItemSequence(collection: string, id: string): AsyncIterable<ItemValue> {
		return this.source.getItemSequence(collection, id);
	}
	addItem(collection: string, data: Data): string {
		return this.source.addItem(collection, data);
	}
	setItem(collection: string, id: string, data: Data): void {
		return this.source.setItem(collection, id, data);
	}
	updateItem(collection: string, id: string, update: Updates): void {
		return this.source.updateItem(collection, id, update);
	}
	deleteItem(collection: string, id: string): void {
		return this.source.deleteItem(collection, id);
	}
	getQuery(collection: string, query: ItemQuery): ItemArray {
		return this.source.getQuery(collection, query);
	}
	getQuerySequence(collection: string, query: ItemQuery): AsyncIterable<ItemArray> {
		return this.source.getQuerySequence(collection, query);
	}
	setQuery(collection: string, query: ItemQuery, data: Data): number {
		return this.source.setQuery(collection, query, data);
	}
	updateQuery(collection: string, query: ItemQuery, update: Updates): number {
		return this.source.updateQuery(collection, query, update);
	}
	deleteQuery(collection: string, query: ItemQuery): number {
		return this.source.deleteQuery(collection, query);
	}
}

/** A provider that passes through to an asynchronous source. */
export class AsyncThroughProvider implements AsyncProvider, Sourceable<AsyncProvider> {
	readonly source: AsyncProvider;
	constructor(source: AsyncProvider) {
		this.source = source;
	}
	getItem(collection: string, id: string): Promise<ItemValue> {
		return this.source.getItem(collection, id);
	}
	getItemSequence(collection: string, id: string): AsyncIterable<ItemValue> {
		return this.source.getItemSequence(collection, id);
	}
	addItem(collection: string, data: Data): Promise<string> {
		return this.source.addItem(collection, data);
	}
	setItem(collection: string, id: string, data: Data): Promise<void> {
		return this.source.setItem(collection, id, data);
	}
	updateItem(collection: string, id: string, updates: Updates): Promise<void> {
		return this.source.updateItem(collection, id, updates);
	}
	deleteItem(collection: string, id: string): Promise<void> {
		return this.source.deleteItem(collection, id);
	}
	getQuery(collection: string, query: ItemQuery): Promise<ItemArray> {
		return this.source.getQuery(collection, query);
	}
	getQuerySequence(collection: string, query: ItemQuery): AsyncIterable<ItemArray> {
		return this.source.getQuerySequence(collection, query);
	}
	setQuery(collection: string, query: ItemQuery, data: Data): Promise<number> {
		return this.source.setQuery(collection, query, data);
	}
	updateQuery(collection: string, query: ItemQuery, updates: Updates): Promise<number> {
		return this.source.updateQuery(collection, query, updates);
	}
	deleteQuery(collection: string, query: ItemQuery): Promise<number> {
		return this.source.deleteQuery(collection, query);
	}
}
