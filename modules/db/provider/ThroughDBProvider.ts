import type { Data } from "../../util/data.js";
import type { Identifier, Item, Items, OptionalItem } from "../../util/item.js";
import type { ItemQuery } from "../../util/query.js";
import type { Sourceable } from "../../util/source.js";
import type { Updates } from "../../util/update.js";
import type { Collection } from "../collection/Collection.js";
import type { DBProvider } from "./DBProvider.js";

/** A provider that passes through to an asynchronous source. */
export class ThroughDBProvider<I extends Identifier = Identifier> implements DBProvider<I>, Sourceable<DBProvider<I>> {
	readonly source: DBProvider<I>;

	constructor(source: DBProvider<I>) {
		this.source = source;
	}

	getItem<T extends Data>(collection: Collection<string, I, T>, id: I): Promise<OptionalItem<I, T>> {
		return this.source.getItem(collection, id);
	}

	requireItem<T extends Data>(collection: Collection<string, I, T>, id: I): Promise<Item<I, T>> {
		return this.source.requireItem(collection, id);
	}

	getItemSequence<T extends Data>(collection: Collection<string, I, T>, id: I): AsyncIterable<OptionalItem<I, T>> {
		return this.source.getItemSequence(collection, id);
	}

	addItem<T extends Data>(collection: Collection<string, I, T>, data: T): Promise<I> {
		return this.source.addItem(collection, data);
	}

	setItem<T extends Data>(collection: Collection<string, I, T>, id: I, data: T): Promise<void> {
		return this.source.setItem(collection, id, data);
	}

	updateItem<T extends Data>(collection: Collection<string, I, T>, id: I, updates: Updates<T>): Promise<void> {
		return this.source.updateItem(collection, id, updates);
	}

	deleteItem<T extends Data>(collection: Collection<string, I, T>, id: I): Promise<void> {
		return this.source.deleteItem(collection, id);
	}

	countQuery<T extends Data>(collection: Collection<string, I, T>, query?: ItemQuery<I, T>): Promise<number> {
		return this.source.countQuery(collection, query);
	}

	getQuery<T extends Data>(collection: Collection<string, I, T>, query?: ItemQuery<I, T>): Promise<Items<I, T>> {
		return this.source.getQuery(collection, query);
	}

	getQuerySequence<T extends Data>(collection: Collection<string, I, T>, query?: ItemQuery<I, T>): AsyncIterable<Items<I, T>> {
		return this.source.getQuerySequence(collection, query);
	}

	setQuery<T extends Data>(collection: Collection<string, I, T>, query: ItemQuery<I, T>, data: T): Promise<void> {
		return this.source.setQuery(collection, query, data);
	}

	updateQuery<T extends Data>(collection: Collection<string, I, T>, query: ItemQuery<I, T>, updates: Updates<T>): Promise<void> {
		return this.source.updateQuery(collection, query, updates);
	}

	deleteQuery<T extends Data>(collection: Collection<string, I, T>, query: ItemQuery<I, T>): Promise<void> {
		return this.source.deleteQuery(collection, query);
	}

	getFirst<T extends Data>(collection: Collection<string, I, T>, query: ItemQuery<I, T>): Promise<OptionalItem<I, T>> {
		return this.source.getFirst(collection, query);
	}

	requireFirst<T extends Data>(collection: Collection<string, I, T>, query: ItemQuery<I, T>): Promise<Item<I, T>> {
		return this.source.requireFirst(collection, query);
	}
}
