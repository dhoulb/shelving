import { RequiredError } from "../../error/RequiredError.js";
import { countArray, getFirst } from "../../util/array.js";
import type { Data } from "../../util/data.js";
import type { Identifier, Item, Items, ItemsSequence, OptionalItem, OptionalItemSequence } from "../../util/item.js";
import type { Query } from "../../util/query.js";
import type { Updates } from "../../util/update.js";
import type { Collection } from "../collection/Collection.js";

/** Provider with a fully asynchronous interface for database access. */
export abstract class DBProvider<I extends Identifier = Identifier, T extends Data = Data> {
	abstract getItem<II extends I, TT extends T>(collection: Collection<string, II, TT>, id: II): Promise<OptionalItem<II, TT>>;

	async requireItem<II extends I, TT extends T>(collection: Collection<string, II, TT>, id: II): Promise<Item<II, TT>> {
		const item = await this.getItem(collection, id);
		if (!item)
			throw new RequiredError(`Item does not exist in collection "${collection.name}"`, {
				provider: this,
				collection,
				id,
				caller: this.requireItem,
			});
		return item;
	}

	abstract getItemSequence<II extends I, TT extends T>(collection: Collection<string, II, TT>, id: II): OptionalItemSequence<II, TT>;

	abstract addItem<II extends I, TT extends T>(collection: Collection<string, II, TT>, data: TT): Promise<II>;

	abstract setItem<II extends I, TT extends T>(collection: Collection<string, II, TT>, id: II, data: TT): Promise<void>;

	abstract updateItem<II extends I, TT extends T>(
		collection: Collection<string, II, TT>,
		id: II,
		updates: Updates<Item<II, TT>>,
	): Promise<void>;

	abstract deleteItem<II extends I, TT extends T>(collection: Collection<string, II, TT>, id: II): Promise<void>;

	async countQuery<II extends I, TT extends T>(collection: Collection<string, II, TT>, query?: Query<Item<II, TT>>): Promise<number> {
		return countArray(await this.getQuery(collection, query));
	}

	abstract getQuery<II extends I, TT extends T>(
		collection: Collection<string, II, TT>,
		query?: Query<Item<II, TT>>,
	): Promise<Items<II, TT>>;

	abstract getQuerySequence<II extends I, TT extends T>(
		collection: Collection<string, II, TT>,
		query?: Query<Item<II, TT>>,
	): ItemsSequence<II, TT>;

	abstract setQuery<II extends I, TT extends T>(
		collection: Collection<string, II, TT>,
		query: Query<Item<II, TT>>,
		data: TT,
	): Promise<void>;

	abstract updateQuery<II extends I, TT extends T>(
		collection: Collection<string, II, TT>,
		query: Query<Item<II, TT>>,
		updates: Updates<TT>,
	): Promise<void>;

	abstract deleteQuery<II extends I, TT extends T>(collection: Collection<string, II, TT>, query: Query<Item<II, TT>>): Promise<void>;

	async getFirst<II extends I, TT extends T>(
		collection: Collection<string, II, TT>,
		query: Query<Item<II, TT>>,
	): Promise<OptionalItem<II, TT>> {
		return getFirst(await this.getQuery(collection, { ...query, $limit: 1 }));
	}

	async requireFirst<II extends I, TT extends T>(
		collection: Collection<string, II, TT>,
		query: Query<Item<II, TT>>,
	): Promise<Item<II, TT>> {
		const first = await this.getFirst(collection, query);
		if (!first)
			throw new RequiredError(`First item does not exist in collection "${collection.name}"`, {
				provider: this,
				collection,
				query,
				caller: this.requireFirst,
			});
		return first;
	}
}
