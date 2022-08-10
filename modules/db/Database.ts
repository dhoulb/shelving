import type { Key, Datas } from "../util/data.js";
import { ItemData } from "../db/Item.js";
import type { AsyncProvider, Provider } from "../provider/Provider.js";
import type { QueryProps } from "../constraint/QueryConstraints.js";
import { Item, AsyncItem } from "./Item.js";
import { Query, AsyncQuery } from "./Query.js";
import { AsyncCollection, Collection } from "./Collection.js";

/** Database with a synchronous or asynchronous provider. */
abstract class AbstractDatabase<T extends Datas = Datas> {
	abstract readonly provider: Provider<T> | AsyncProvider<T>;

	/** Create a query on a collection in this database. */
	abstract collection<K extends Key<T>>(collection: K): Collection<T, K> | AsyncCollection<T, K>;

	/** Create a query on a collection in this database. */
	abstract query<K extends Key<T>>(collection: K, query?: QueryProps<ItemData<T[K]>>): Query<T, K> | AsyncQuery<T, K>;

	/** Reference an item in a collection in this database. */
	abstract item<K extends Key<T>>(collection: K, id: string): Item<T, K> | AsyncItem<T, K>;
}

/** Database with a synchronous provider. */
export class Database<T extends Datas = Datas> implements AbstractDatabase<T> {
	readonly provider: Provider<T>;
	constructor(provider: Provider<T>) {
		this.provider = provider;
	}
	collection<K extends Key<T>>(collection: K): Collection<T, K> {
		return new Collection(this, collection);
	}
	query<K extends Key<T>>(collection: K, query?: QueryProps<ItemData<T[K]>>): Query<T, K> {
		return new Query(this, collection, query);
	}
	item<K extends Key<T>>(collection: K, id: string): Item<T, K> {
		return new Item(this, collection, id);
	}
}

/** Database with a synchronous provider. */
export class AsyncDatabase<T extends Datas = Datas> implements AbstractDatabase<T> {
	readonly provider: AsyncProvider<T>;
	constructor(provider: AsyncProvider<T>) {
		this.provider = provider;
	}
	collection<K extends Key<T>>(collection: K): AsyncCollection<T, K> {
		return new AsyncCollection(this, collection);
	}
	query<K extends Key<T>>(collection: K, query?: QueryProps<ItemData<T[K]>>): AsyncQuery<T, K> {
		return new AsyncQuery(this, collection, query);
	}
	item<K extends Key<T>>(collection: K, id: string): AsyncItem<T, K> {
		return new AsyncItem(this, collection, id);
	}
}
