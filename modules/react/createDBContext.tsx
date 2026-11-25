import { createContext, type ReactElement, type ReactNode, use, useRef } from "react";
import type { AnyCaller } from "shelving/util/function";
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
import { useStore } from "./useStore.js";

/**
 * Bundle of hooks and a provider component returned by `createDBContext()`.
 *
 * @see https://shelving.cc/react/DBContext
 */
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

	/** Provide a `DBCache` as context to child nodes, to allow them to use `useItem()` and `useQuery()` */
	readonly DBContext: (props: DBContextProps<I, T>) => ReactElement;

	/** Return the underlying `DBCache` for `<DBContext>` */
	requireDBCache(): DBCache<I, T>;
}

/**
 * Props for the `<DBContext>` component returned by `createDBContext()`.
 *
 * @see https://shelving.cc/react/DBContextProps
 */
export interface DBContextProps<I extends Identifier, T extends Data> {
	readonly children?: ReactNode;
	/** The provider to read from, in place of the one given to `createDBContext()`. The context makes its own `DBCache` for it, and a new one when it changes. */
	readonly provider?: DBProvider<I, T> | undefined;
	/** A `DBCache` you made, used as it is. It wins over `provider`. */
	readonly cache?: DBCache<I, T> | undefined;
}

/**
 * Create a data context
 * - Allows React elements to call `useItem()` and `useQuery()` to access items/queries in a database provider.
 * - The provider can be given here, or to each `<DBContext>` as its `provider` or `cache` prop, so each tree can have its own database.
 * - If the database is (or wraps) a `MemoryDBProvider`, the returned stores seed from it synchronously.
 *
 * @param provider Default `DBProvider` the created context resolves item and query stores against, when a `<DBContext>` gets no `provider` or `cache` prop.
 *
 * @see https://shelving.cc/react/createDBContext
 */
export function createDBContext<I extends Identifier, T extends Data>(provider?: DBProvider<I, T>): DBContext<I, T> {
	const CacheContext = createContext<DBCache<I, T> | undefined>(undefined);

	function requireDBCache(caller: AnyCaller = requireDBCache): DBCache<I, T> {
		const cache = use(CacheContext);
		if (!cache) throw new RequiredError(`Must be used inside <DBContext>`, { caller });
		return cache;
	}

	function useItem(
		collection: Nullish<Collection<string, I, T>>, //
		id: Nullish<I>,
	): ItemStore<I, T> | undefined {
		return useStore(collection && id ? requireDBCache(useItem).getItem(collection, id) : undefined);
	}

	function useQuery(
		collection: Nullish<Collection<string, I, T>>, //
		query: Nullish<Query<Item<I, T>>>,
	): QueryStore<I, T> | undefined {
		return useStore(collection && query ? requireDBCache(useQuery).getQuery(collection, query) : undefined);
	}

	function DBContext({ children, provider: given = provider, cache }: DBContextProps<I, T>): ReactElement {
		const made = useRef<DBCache<I, T>>(undefined);
		if (!cache) {
			if (!given) throw new RequiredError("<DBContext> needs a provider or a cache", { caller: DBContext });
			if (made.current?.provider !== given) made.current = new DBCache(given);
		}
		return <CacheContext value={cache ?? made.current}>{children}</CacheContext>;
	}

	return { requireDBCache, useItem, useQuery, DBContext } as DBContext<I, T>;
}
