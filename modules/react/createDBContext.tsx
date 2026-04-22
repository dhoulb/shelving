import { createContext, type ReactElement, type ReactNode, use } from "react";
import { DBCache } from "../db/cache/DBCache.js";
import type { Collection } from "../db/collection/Collection.js";
import type { DBProvider } from "../db/provider/DBProvider.js";
import type { ItemStore } from "../db/store/ItemStore.js";
import type { QueryStore } from "../db/store/QueryStore.js";
import { RequiredError } from "../error/RequiredError.js";
import type { Data } from "../util/data.js";
import type { Identifier, Item } from "../util/item.js";
import type { Nullish } from "../util/null.js";
import type { Query } from "../util/query.js";
import { useInstance } from "./useInstance.js";
import { useStore } from "./useStore.js";

export interface DBContext<I extends Identifier, T extends Data> {
	/** Get an `ItemStore` for the specified collection item in the current `DataProvider` context and subscribe to any changes in it. */
	useItem<II extends I, TT extends T>(
		collection: Nullish<Collection<string, II, TT>>, //
		id: Nullish<II>,
	): ItemStore<II, TT> | undefined;
	useItem<II extends I, TT extends T>(
		collection: Collection<string, II, TT>, //
		id: II,
	): ItemStore<II, TT>;

	/** Get an `QueryStore` for the specified collection query in the current `DataProvider` context and subscribe to any changes in it. */
	useQuery<II extends I, TT extends T>(
		collection: Nullish<Collection<string, II, TT>>, //
		query: Nullish<Query<Item<II, TT>>>,
	): QueryStore<II, TT> | undefined;
	useQuery<II extends I, TT extends T>(
		collection: Collection<string, II, TT>, //
		query: Query<Item<II, TT>>,
	): QueryStore<II, TT>;

	/** The `<DataContext>` wrapper to give your React components access to this data. */
	readonly DBContext: ({ children }: { children: ReactNode }) => ReactElement;
}

/**
 * Create a data context
 * - Allows React elements to call `useItem()` and `useQuery()` to access items/queries in a database provider.
 * - If the database has a `CacheDBProvider` in its chain then in-memory data will be used in the returned stores.
 */
export function createDBContext<I extends Identifier, T extends Data>(provider: DBProvider<I, T>): DBContext<I, T> {
	const CacheContext = createContext<DBCache<I, T> | undefined>(undefined);

	function useItem(
		collection: Nullish<Collection<string, I, T>>, //
		id: Nullish<I>,
	): ItemStore<I, T> | undefined {
		const cache = use(CacheContext);
		if (!cache) throw new RequiredError("useItem() can only be used inside <DBContext>", { caller: useItem });
		return useStore(collection && id ? cache.getItem(collection, id) : undefined);
	}

	function useQuery(
		collection: Nullish<Collection<string, I, T>>, //
		query: Nullish<Query<Item<I, T>>>,
	): QueryStore<I, T> | undefined {
		const cache = use(CacheContext);
		if (!cache) throw new RequiredError("useQuery() can only be used inside <DBContext>", { caller: useQuery });
		return useStore(collection && query ? cache.getQuery(collection, query) : undefined);
	}

	function DBContext({ children }: { children: ReactNode }): ReactElement {
		const cache = useInstance(DBCache as new (p: DBProvider<I, T>) => DBCache<I, T>, provider);
		return <CacheContext value={cache}>{children}</CacheContext>;
	}

	return { useItem, useQuery, DBContext } as DBContext<I, T>;
}
