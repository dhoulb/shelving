import { RequiredError } from "../../error/RequiredError.js";
import { countArray, getFirst } from "../../util/array.js";
import type { Data } from "../../util/data.js";
import type { Identifier, Item, Items, OptionalItem } from "../../util/item.js";
import type { ItemQuery } from "../../util/query.js";
import type { Updates } from "../../util/update.js";
import type { Collection } from "../collection/Collection.js";

/** Provider with a fully asynchronous interface for database access. */
export abstract class DBProvider<I extends Identifier = Identifier> {
	abstract getItem<T extends Data>(collection: Collection<string, I, T>, id: I): Promise<OptionalItem<I, T>>;

	async requireItem<T extends Data>(collection: Collection<string, I, T>, id: I): Promise<Item<I, T>> {
		const item = await this.getItem(collection, id);
		if (!item)
			throw new RequiredError(`Item does not exist in collection "${collection.name}"`, {
				provider: this,
				collection: collection.name,
				id,
				caller: this.requireItem,
			});
		return item;
	}

	abstract getItemSequence<T extends Data>(collection: Collection<string, I, T>, id: I): AsyncIterable<OptionalItem<I, T>>;

	abstract addItem<T extends Data>(collection: Collection<string, I, T>, data: T): Promise<I>;

	abstract setItem<T extends Data>(collection: Collection<string, I, T>, id: I, data: T): Promise<void>;

	abstract updateItem<T extends Data>(collection: Collection<string, I, T>, id: I, updates: Updates<T>): Promise<void>;

	abstract deleteItem<T extends Data>(collection: Collection<string, I, T>, id: I): Promise<void>;

	async countQuery<T extends Data>(collection: Collection<string, I, T>, query?: ItemQuery<I, T>): Promise<number> {
		return countArray(await this.getQuery(collection, query));
	}

	abstract getQuery<T extends Data>(collection: Collection<string, I, T>, query?: ItemQuery<I, T>): Promise<Items<I, T>>;

	abstract getQuerySequence<T extends Data>(collection: Collection<string, I, T>, query?: ItemQuery<I, T>): AsyncIterable<Items<I, T>>;

	abstract setQuery<T extends Data>(collection: Collection<string, I, T>, query: ItemQuery<I, T>, data: T): Promise<void>;

	abstract updateQuery<T extends Data>(collection: Collection<string, I, T>, query: ItemQuery<I, T>, updates: Updates<T>): Promise<void>;

	abstract deleteQuery<T extends Data>(collection: Collection<string, I, T>, query: ItemQuery<I, T>): Promise<void>;

	async getFirst<T extends Data>(collection: Collection<string, I, T>, query: ItemQuery<I, T>): Promise<OptionalItem<I, T>> {
		return getFirst(await this.getQuery(collection, { ...query, $limit: 1 }));
	}

	async requireFirst<T extends Data>(collection: Collection<string, I, T>, query: ItemQuery<I, T>): Promise<Item<I, T>> {
		const first = await this.getFirst(collection, query);
		if (!first)
			throw new RequiredError(`First item does not exist in collection "${collection.name}"`, {
				provider: this,
				collection: collection.name,
				query,
				caller: this.requireFirst,
			});
		return first;
	}
}
