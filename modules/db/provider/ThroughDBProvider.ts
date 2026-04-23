import type { Data } from "../../util/data.js";
import type { Identifier, Item, Items, ItemsSequence, OptionalItem, OptionalItemSequence } from "../../util/item.js";
import type { Query } from "../../util/query.js";
import type { Sourceable } from "../../util/source.js";
import type { Updates } from "../../util/update.js";
import type { Collection } from "../collection/Collection.js";
import type { DBProvider } from "./DBProvider.js";

/** A provider that passes through to an asynchronous source. */
export class ThroughDBProvider<I extends Identifier, T extends Data> implements DBProvider<I, T>, Sourceable<DBProvider<I, T>> {
	readonly source: DBProvider<I, T>;

	constructor(source: DBProvider<I, T>) {
		this.source = source;
	}

	getItem<II extends I, TT extends T>(collection: Collection<string, II, TT>, id: II): Promise<OptionalItem<II, TT>> {
		return this.source.getItem(collection, id);
	}

	requireItem<II extends I, TT extends T>(collection: Collection<string, II, TT>, id: II): Promise<Item<II, TT>> {
		return this.source.requireItem(collection, id);
	}

	getItemSequence<II extends I, TT extends T>(collection: Collection<string, II, TT>, id: II): OptionalItemSequence<II, TT> {
		return this.source.getItemSequence(collection, id);
	}

	addItem<II extends I, TT extends T>(collection: Collection<string, II, TT>, data: TT): Promise<II> {
		return this.source.addItem(collection, data);
	}

	setItem<II extends I, TT extends T>(collection: Collection<string, II, TT>, id: II, data: TT): Promise<void> {
		return this.source.setItem(collection, id, data);
	}

	updateItem<II extends I, TT extends T>(collection: Collection<string, II, TT>, id: II, updates: Updates<Item<II, TT>>): Promise<void> {
		return this.source.updateItem(collection, id, updates);
	}

	deleteItem<II extends I, TT extends T>(collection: Collection<string, II, TT>, id: II): Promise<void> {
		return this.source.deleteItem(collection, id);
	}

	countQuery<II extends I, TT extends T>(collection: Collection<string, II, TT>, query?: Query<Item<II, TT>>): Promise<number> {
		return this.source.countQuery(collection, query);
	}

	getQuery<II extends I, TT extends T>(collection: Collection<string, II, TT>, query?: Query<Item<II, TT>>): Promise<Items<II, TT>> {
		return this.source.getQuery(collection, query);
	}

	getQuerySequence<II extends I, TT extends T>(collection: Collection<string, II, TT>, query?: Query<Item<II, TT>>): ItemsSequence<II, TT> {
		return this.source.getQuerySequence(collection, query);
	}

	setQuery<II extends I, TT extends T>(collection: Collection<string, II, TT>, query: Query<Item<II, TT>>, data: TT): Promise<void> {
		return this.source.setQuery(collection, query, data);
	}

	updateQuery<II extends I, TT extends T>(
		collection: Collection<string, II, TT>,
		query: Query<Item<II, TT>>,
		updates: Updates<TT>,
	): Promise<void> {
		return this.source.updateQuery(collection, query, updates);
	}

	deleteQuery<II extends I, TT extends T>(collection: Collection<string, II, TT>, query: Query<Item<II, TT>>): Promise<void> {
		return this.source.deleteQuery(collection, query);
	}

	getFirst<II extends I, TT extends T>(collection: Collection<string, II, TT>, query: Query<Item<II, TT>>): Promise<OptionalItem<II, TT>> {
		return this.source.getFirst(collection, query);
	}

	requireFirst<II extends I, TT extends T>(collection: Collection<string, II, TT>, query: Query<Item<II, TT>>): Promise<Item<II, TT>> {
		return this.source.requireFirst(collection, query);
	}
}
