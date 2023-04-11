import type { Data } from "../util/data.js";
import type { Sourceable } from "../util/source.js";
import type { ItemArray, ItemConstraints, ItemValue } from "../db/Item.js";
import type { Updates } from "../update/DataUpdate.js";
import type { Provider, AsyncProvider } from "./Provider.js";

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
	getQuery(collection: string, constraints: ItemConstraints): ItemArray {
		return this.source.getQuery(collection, constraints);
	}
	getQuerySequence(collection: string, constraints: ItemConstraints): AsyncIterable<ItemArray> {
		return this.source.getQuerySequence(collection, constraints);
	}
	setQuery(collection: string, constraints: ItemConstraints, data: Data): number {
		return this.source.setQuery(collection, constraints, data);
	}
	updateQuery(collection: string, constraints: ItemConstraints, update: Updates): number {
		return this.source.updateQuery(collection, constraints, update);
	}
	deleteQuery(collection: string, constraints: ItemConstraints): number {
		return this.source.deleteQuery(collection, constraints);
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
	getQuery(collection: string, constraints: ItemConstraints): Promise<ItemArray> {
		return this.source.getQuery(collection, constraints);
	}
	getQuerySequence(collection: string, constraints: ItemConstraints): AsyncIterable<ItemArray> {
		return this.source.getQuerySequence(collection, constraints);
	}
	setQuery(collection: string, constraints: ItemConstraints, data: Data): Promise<number> {
		return this.source.setQuery(collection, constraints, data);
	}
	updateQuery(collection: string, constraints: ItemConstraints, updates: Updates): Promise<number> {
		return this.source.updateQuery(collection, constraints, updates);
	}
	deleteQuery(collection: string, constraints: ItemConstraints): Promise<number> {
		return this.source.deleteQuery(collection, constraints);
	}
}
