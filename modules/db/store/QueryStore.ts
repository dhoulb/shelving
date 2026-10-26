import { RequiredError } from "../../error/RequiredError.js";
import { UnsupportedError } from "../../error/UnsupportedError.js";
import { FetchStore } from "../../store/FetchStore.js";
import { getFirst, getLast } from "../../util/array.js";
import { awaitAbort, awaitRace } from "../../util/async.js";
import { getGetter } from "../../util/class.js";
import { NONE } from "../../util/constants.js";
import type { Data } from "../../util/data.js";
import { BLACKHOLE } from "../../util/function.js";
import type { Identifier, Item, Items } from "../../util/item.js";
import type { Query } from "../../util/query.js";
import { runSequence } from "../../util/sequence.js";
import { getSource } from "../../util/source.js";
import type { Collection } from "../collection/Collection.js";
import type { DBProvider } from "../provider/DBProvider.js";
import { MemoryDBProvider, type MemoryTable } from "../provider/MemoryDBProvider.js";

/**
 * Store that runs a query against a collection from a database provider and tracks its matching items.
 *
 * - Holds an `Items` value (the array of matching items) and is iterable over those items.
 * - When the provider is (or wraps) a `MemoryDBProvider`, the store seeds from the memory at once and follows the live query result. An empty result only counts as loaded when the memory has a time for the query (see `MemoryTable.getQueryTime()`). Until then the store is loading, and a fetch waits until the memory loads the query (e.g. from `HydratingAPIProvider`).
 * - Any other provider is fetched, and its `DBProvider.getQuerySequence()` is followed while the store has subscribers. A provider that throws `UnsupportedError` for subscriptions is only fetched.
 * - The store does not page. To load more items into a memory, call the API with `getQueryItemsAfter()`, and the store shows the new items.
 *
 * @example
 *  const store = new QueryStore(collection, query, provider);
 *  for (const item of store) console.log(item);
 * @see https://shelving.cc/db/QueryStore
 */
export class QueryStore<I extends Identifier, T extends Data> extends FetchStore<Items<I, T>> implements Iterable<Item<I, T>> {
	/**
	 * The database provider this store fetches its items from.
	 * @see https://shelving.cc/db/QueryStore/provider
	 */
	readonly provider: DBProvider<I>;
	/**
	 * The collection the query runs against.
	 * @see https://shelving.cc/db/QueryStore/collection
	 */
	readonly collection: Collection<string, I, T>;
	/**
	 * The query that selects the items tracked by this store.
	 * @see https://shelving.cc/db/QueryStore/query
	 */
	readonly query: Query<Item<I, T>>;

	/**
	 * The first item in this store, or `undefined` if the query has no items.
	 * @see https://shelving.cc/db/QueryStore/optionalFirst
	 */
	get optionalFirst(): Item<I, T> | undefined {
		return getFirst(this.value);
	}

	/**
	 * The last item in this store, or `undefined` if the query has no items.
	 * @see https://shelving.cc/db/QueryStore/optionalLast
	 */
	get optionalLast(): Item<I, T> | undefined {
		return getLast(this.value);
	}

	/**
	 * The first item in this store.
	 *
	 * @returns The first matching item including its ID.
	 * @throws {RequiredError} If the query has no items.
	 * @example store.first // Item<I, T>
	 * @see https://shelving.cc/db/QueryStore/first
	 */
	get first(): Item<I, T> {
		const first = this.optionalFirst;
		if (!first)
			throw new RequiredError(`First item does not exist in collection "${this.collection.name}"`, {
				store: this,
				provider: this.provider,
				collection: this.collection.name,
				query: this.query,
				caller: getGetter(this, "first"),
			});
		return first;
	}

	/**
	 * The last item in this store.
	 *
	 * @returns The last matching item including its ID.
	 * @throws {RequiredError} If the query has no items.
	 * @example store.last // Item<I, T>
	 * @see https://shelving.cc/db/QueryStore/last
	 */
	get last(): Item<I, T> {
		const last = this.optionalLast;
		if (!last)
			throw new RequiredError(`Last item does not exist in collection "${this.collection.name}"`, {
				store: this,
				provider: this.provider,
				collection: this.collection.name,
				query: this.query,
				caller: getGetter(this, "last"),
			});
		return last;
	}

	/** The memory table the provider is backed by, if any. */
	private readonly _table: MemoryTable<I, T> | undefined;

	constructor(collection: Collection<string, I, T>, query: Query<Item<I, T>>, provider: DBProvider<I>) {
		const table = getSource<MemoryDBProvider<I>>(MemoryDBProvider, provider)?.getTable(collection);
		super(table && _isLoaded(table, query) ? table.getQuery(query) : NONE); // Use the current memory snapshot if it has loaded.
		this.provider = provider;
		this.collection = collection;
		this.query = query;
		this._table = table;
		this.starter = table
			? store => runSequence(store.through(_getLoadedSequence(table, query)))
			: store =>
					runSequence(
						store.through(_getSupportedSequence(() => provider.getQuerySequence(collection, query))),
						undefined,
						reason => (store.reason = reason),
					);
	}

	// Override to fetch the result from the database provider.
	// - A memory waits until it has loaded the query.
	override async _fetch(signal: AbortSignal): Promise<Items<I, T>> {
		const { provider, collection, query, _table } = this;
		if (_table && !_isLoaded(_table, query)) await _awaitFirst(_getLoadedSequence(_table, query), signal);
		return provider.getQuery(collection, query);
	}

	// Implement `Iterable`
	[Symbol.iterator](): Iterator<Item<I, T>> {
		return this.value.values();
	}
}

/** Whether the memory has loaded a query, i.e. it has items for it, or a time for it. */
function _isLoaded<I extends Identifier, T extends Data>(table: MemoryTable<I, T>, query: Query<Item<I, T>>): boolean {
	return table.getQueryTime(query) !== undefined || !!table.countQuery(query);
}

/** Follow a query in the memory, but skip the results from before it has loaded. */
async function* _getLoadedSequence<I extends Identifier, T extends Data>(
	table: MemoryTable<I, T>,
	query: Query<Item<I, T>>,
): AsyncIterable<Items<I, T>> {
	for await (const items of table.getQuerySequence(query)) if (items.length || table.getQueryTime(query) !== undefined) yield items;
}

/** Follow a provider's sequence, but end it at once if the provider does not support subscriptions. */
async function* _getSupportedSequence<T>(getSequence: () => AsyncIterable<T>): AsyncIterable<T> {
	try {
		yield* getSequence();
	} catch (thrown) {
		if (!(thrown instanceof UnsupportedError)) throw thrown;
	}
}

/** Get the first value of a sequence, or reject when the signal aborts. */
async function _awaitFirst<T>(sequence: AsyncIterable<T>, signal: AbortSignal): Promise<T> {
	const iterator = sequence[Symbol.asyncIterator]();
	try {
		const result = await awaitRace(iterator.next(), awaitAbort(signal));
		if (result.done) throw new RequiredError("Memory closed before the query loaded", { caller: _awaitFirst });
		return result.value;
	} finally {
		iterator.return?.().catch(BLACKHOLE);
	}
}
