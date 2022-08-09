import type { Key, Datas, Entity } from "../util/data.js";
import type { AsyncProvider, AbstractProvider, Provider } from "../provider/Provider.js";
import type { QueryProps } from "../query/Query.js";
import { DatabaseDocument, SynchronousDatabaseDocument, AsynchronousDatabaseDocument } from "./DatabaseDocument.js";
import { DatabaseQuery, SynchronousDatabaseQuery, AsynchronousDatabaseQuery } from "./DatabaseQuery.js";

/** Database with a provider. */
export type Database<T extends Datas = Datas> = _AbstractDatabase<T>;

/** Database with a synchronous or asynchronous provider. */
abstract class _AbstractDatabase<T extends Datas> {
	abstract readonly provider: AbstractProvider<T>;

	/** Create a query on a collection in this database. */
	abstract query<K extends Key<T>>(collection: K, query?: QueryProps<Entity<T[K]>>): DatabaseQuery<T, K>;

	/** Reference a document in a collection in this database. */
	abstract doc<K extends Key<T>>(collection: K, id: string): DatabaseDocument<T, K>;

	/**
	 * Create a new document with a random ID.
	 * - Created document is guaranteed to have a unique ID.
	 *
	 * @param collection Name of the collection to add the document to.
	 * @param data Complete data to set the document to.
	 * @return String ID for the created document (possibly promised).
	 */
	abstract add<K extends Key<T>>(collection: K, data: T[K]): string | PromiseLike<string>;
}

/** Database with a synchronous provider. */
export class SynchronousDatabase<T extends Datas> implements _AbstractDatabase<T> {
	readonly provider: Provider<T>;
	constructor(provider: Provider<T>) {
		this.provider = provider;
	}
	query<K extends Key<T>>(collection: K, query?: QueryProps<Entity<T[K]>>): SynchronousDatabaseQuery<T, K> {
		return new SynchronousDatabaseQuery(this, collection, query);
	}
	doc<K extends Key<T>>(collection: K, id: string): SynchronousDatabaseDocument<T, K> {
		return new SynchronousDatabaseDocument(this, collection, id);
	}
	add<K extends Key<T>>(collection: K, data: T[K]): string {
		return this.provider.addDocument({ collection }, data);
	}
}

/** Database with a synchronous provider. */
export class AsynchronousDatabase<T extends Datas> implements _AbstractDatabase<T> {
	readonly provider: AsyncProvider<T>;
	constructor(provider: AsyncProvider<T>) {
		this.provider = provider;
	}
	query<K extends Key<T>>(collection: K, query?: QueryProps<Entity<T[K]>>): AsynchronousDatabaseQuery<T, K> {
		return new AsynchronousDatabaseQuery(this, collection, query);
	}
	doc<K extends Key<T>>(collection: K, id: string): AsynchronousDatabaseDocument<T, K> {
		return new AsynchronousDatabaseDocument(this, collection, id);
	}
	add<K extends Key<T>>(collection: K, data: T[K]): Promise<string> {
		return this.provider.addDocument({ collection }, data);
	}
}
