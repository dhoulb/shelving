import type { Key, Datas } from "../util/data.js";
import type { AsyncProvider, Provider } from "../provider/Provider.js";
import type { FilterList } from "../constraint/FilterConstraint.js";
import type { SortList } from "../constraint/SortConstraint.js";
import type { ItemData } from "../db/Item.js";
import type { Nullish } from "../util/null.js";
import { DeepIterable } from "../util/iterate.js";
import { Item, AsyncItem } from "./Item.js";
import { Query, AsyncQuery } from "./Query.js";
import { Collection, AsyncCollection } from "./Collection.js";
import { changeAsyncProvider, changeProvider, ItemChanges, WriteChange } from "./Change.js";

/** Database with a synchronous or asynchronous provider. */
abstract class BaseDatabase<T extends Datas> {
	abstract readonly provider: Provider<T> | AsyncProvider<T>;

	/** Create a query on a collection in this database. */
	abstract collection<K extends Key<T>>(collection: K): Collection<Pick<T, K>, K> | AsyncCollection<Pick<T, K>, K>;

	/** Create a query on a collection in this database. */
	abstract query<K extends Key<T>>(collection: K, filters?: FilterList<ItemData<T[K]>>, sorts?: SortList<ItemData<T[K]>>, limit?: number | null): Query<Pick<T, K>, K> | AsyncQuery<Pick<T, K>, K>;

	/** Reference an item in a collection in this database. */
	abstract item<K extends Key<T>>(collection: K, id: string): Item<Pick<T, K>, K> | AsyncItem<Pick<T, K>, K>;

	/** Run a set of changes on this database. */
	abstract change<K extends Key<T>>(...changes: DeepIterable<Nullish<WriteChange<Pick<T, K>, K>>>[]): ItemChanges<Pick<T, K>, K> | Promise<ItemChanges<Pick<T, K>, K>>;
}

/** Database with a synchronous provider. */
export class Database<T extends Datas = Datas> implements BaseDatabase<T> {
	readonly provider: Provider<T>;
	constructor(provider: Provider<T>) {
		this.provider = provider;
	}
	collection<K extends Key<T>>(collection: K): Collection<Pick<T, K>, K> {
		return new Collection<Pick<T, K>, K>(this, collection);
	}
	query<K extends Key<T>>(collection: K, filters?: FilterList<ItemData<T[K]>>, sorts?: SortList<ItemData<T[K]>>, limit?: number | null): Query<Pick<T, K>, K> {
		return new Query<Pick<T, K>, K>(this, collection, filters, sorts, limit);
	}
	item<K extends Key<T>>(collection: K, id: string): Item<Pick<T, K>, K> {
		return new Item<Pick<T, K>, K>(this, collection, id);
	}
	change<K extends Key<T>>(...changes: DeepIterable<Nullish<WriteChange<Pick<T, K>, K>>>[]): ItemChanges<Pick<T, K>, K> {
		return changeProvider(this.provider, changes);
	}
}

/** Database with a synchronous provider. */
export class AsyncDatabase<T extends Datas = Datas> implements BaseDatabase<T> {
	readonly provider: AsyncProvider<T>;
	constructor(provider: AsyncProvider<T>) {
		this.provider = provider;
	}
	collection<K extends Key<T>>(collection: K): AsyncCollection<Pick<T, K>, K> {
		return new AsyncCollection<Pick<T, K>, K>(this, collection);
	}
	query<K extends Key<T>>(collection: K, filters?: FilterList<ItemData<T[K]>>, sorts?: SortList<ItemData<T[K]>>, limit?: number | null): AsyncQuery<Pick<T, K>, K> {
		return new AsyncQuery<Pick<T, K>, K>(this, collection, filters, sorts, limit);
	}
	item<K extends Key<T>>(collection: K, id: string): AsyncItem<Pick<T, K>, K> {
		return new AsyncItem<Pick<T, K>, K>(this, collection, id);
	}
	change<K extends Key<T>>(...changes: DeepIterable<Nullish<WriteChange<Pick<T, K>, K>>>[]): Promise<ItemChanges<Pick<T, K>, K>> {
		return changeAsyncProvider(this.provider, changes);
	}
}
