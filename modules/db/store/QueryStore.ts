import { RequiredError } from "../../error/RequiredError.js";
import { FetchStore } from "../../store/FetchStore.js";
import { getFirst, getLast, type ImmutableArray, requireFirst } from "../../util/array.js";
import { awaitAbort, awaitRace } from "../../util/async.js";
import { getGetter } from "../../util/class.js";
import { NONE } from "../../util/constants.js";
import { type Data, getDataProp, joinDataPath } from "../../util/data.js";
import { isEqual } from "../../util/equal.js";
import { BLACKHOLE } from "../../util/function.js";
import type { Identifier, Item, Items } from "../../util/item.js";
import {
	compareQueryItems,
	getQueryAfter,
	getQueryBefore,
	getQueryFilters,
	getQueryLimit,
	getQueryOrders,
	matchQueryItem,
	type Query,
	type QueryFilter,
	type QueryOrder,
	sortQueryItems,
} from "../../util/query.js";
import { runSequence } from "../../util/sequence.js";
import { isDefined } from "../../util/undefined.js";
import type { Collection } from "../collection/Collection.js";
import type { DBProvider } from "../provider/DBProvider.js";
import { MemoryDBProvider, type MemoryTable } from "../provider/MemoryDBProvider.js";

/**
 * Store that runs a query against a collection from a database provider and tracks its matching items.
 *
 * - Holds an `Items` value (the array of matching items) and is iterable over those items.
 * - Seeds from a `MemoryDBProvider` snapshot when available, and follows changes in the memory.
 * - An empty result in the memory only counts as loaded when the memory has a time for the query (see `MemoryTable.getQueryTime()`). Until then the store is loading.
 * - When the provider is a `MemoryDBProvider`, a fetch waits until the memory has loaded the query (e.g. from `HydratingAPIProvider`).
 * - A query with an `$order` loads in pages: `fetchAfter()` loads the next page at the end, and `fetchBefore()` loads new items at the start.
 * - A query with an `$order` pins its items: each item keeps its position after a fetch, so an edit never moves an item or removes it from view. A deleted item is hidden. New items in the memory that sort before the first item show at the start at once (e.g. an optimistic preview).
 * - A query without an `$order` follows the live query result in the memory, and cannot page.
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
	 * The memory provider this store seeds from and follows, if available.
	 * @see https://shelving.cc/db/QueryStore/memory
	 */
	readonly memory: MemoryDBProvider<I> | undefined;

	/**
	 * The maximum number of items the query can return, or `Infinity` if unlimited.
	 * - For a paged query, this is the size of each page.
	 * @see https://shelving.cc/db/QueryStore/limit
	 */
	get limit(): number {
		return getQueryLimit(this.query) ?? Number.POSITIVE_INFINITY;
	}

	/**
	 * Whether more items can be loaded after the last item with `fetchAfter()`.
	 * @see https://shelving.cc/db/QueryStore/hasAfter
	 */
	get hasAfter(): boolean {
		return this._hasAfter;
	}
	private _hasAfter = false;

	/**
	 * Whether more items can be loaded before the first item with `fetchBefore()`.
	 * - `false` after the first fetch, because the first page starts at the start. It becomes `true` when `fetchBefore()` finds more new items than one page.
	 * @see https://shelving.cc/db/QueryStore/hasBefore
	 */
	get hasBefore(): boolean {
		return this._hasBefore;
	}
	private _hasBefore = false;

	/**
	 * Whether more items can be loaded after the last item. Alias of `hasAfter`.
	 * @see https://shelving.cc/db/QueryStore/hasMore
	 */
	get hasMore(): boolean {
		return this._hasAfter;
	}

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

	// Paging state (only used when the query has an `$order`).
	private readonly _orders: ImmutableArray<QueryOrder>;
	private readonly _filters: ImmutableArray<QueryFilter>;
	private _ids: ImmutableArray<I> = []; // Pinned IDs in display order.
	private _rows = new Map<I, Item<I, T>>(); // Pinned items as they were fetched (their sort values are the cursors).
	private _loaded = false; // Whether any items have been pinned yet.
	private _generation = 0; // Increases when a refresh starts.

	constructor(collection: Collection<string, I, T>, query: Query<Item<I, T>>, provider: DBProvider<I>, memory?: MemoryDBProvider<I>) {
		const table = memory?.getTable(collection);
		const items = table && _isLoaded(table, query) ? table.getQuery(query) : undefined;
		super(items ?? NONE); // Use the current memory snapshot if it has loaded.
		this.provider = provider;
		this.collection = collection;
		this.query = query;
		this.memory = memory;
		this._orders = getQueryOrders(query);
		this._filters = getQueryFilters(query);
		if (this._orders.length) {
			// Paged query: pin the snapshot, and recompose the pinned items whenever the memory changes.
			if (items) {
				this._pin(items);
				this._hasAfter = items.length >= this.limit; // A full snapshot may have more items after it.
			}
			if (memory) this.starter = store => runSequence(memory.getQuerySequence(collection), () => store._recompose());
		} else if (table) {
			// Unpaged query: follow the live query result in the memory, once it has loaded.
			this.starter = store => runSequence(store.through(_getLoadedSequence(table, query)));
		}
	}

	// Override to fetch the result from the database provider.
	// - A paged query loads the first page again, and drops any other loaded pages.
	// - A `MemoryDBProvider` waits until it has loaded the query.
	override async _fetch(signal: AbortSignal): Promise<Items<I, T>> {
		const { provider, collection, query, limit } = this;
		if (provider instanceof MemoryDBProvider) {
			const table: MemoryTable<I, T> = provider.getTable(collection);
			if (!_isLoaded(table, query)) await _awaitFirst(_getLoadedSequence(table, query), signal);
		}
		if (!this._orders.length) return provider.getQuery(collection, query);
		const generation = ++this._generation; // Makes any page fetch that is still running drop its result.
		// Load one more item than the page, to see if there are more.
		const items = await provider.getQuery(collection, _withLimit(query, limit + 1));
		if (generation !== this._generation) return this._compose(); // A newer refresh started, so it sets the items.
		this._hasAfter = items.length > limit;
		this._hasBefore = false;
		this._pin(items.slice(0, limit));
		return this._compose();
	}

	/**
	 * Load the next page of items after the last item.
	 * - Uses the query `$limit` as the page size.
	 * - Sets `busy` while the page loads. The items already loaded do not suspend.
	 * - Waits for a fetch that is already running, then loads the page.
	 * - Does nothing if `hasAfter` is `false`.
	 * - Loads the first page if no items have loaded yet.
	 * - A failed fetch rejects the promise, and the items already loaded stay. Unlike `refresh()`, it does not set `reason`.
	 *
	 * @returns Promise that resolves when the page has loaded.
	 * @throws {RequiredError} If the query has no `$order`.
	 * @throws {unknown} The error from the provider, if the fetch fails.
	 * @example if (store.hasAfter) await store.fetchAfter();
	 * @see https://shelving.cc/db/QueryStore/fetchAfter
	 */
	async fetchAfter(): Promise<void> {
		const { query, limit } = this;
		if (!this._orders.length)
			throw new RequiredError("Query must have $order to fetch more items", { store: this, query, caller: this.fetchAfter });
		if (this.busy.value) await this._idle(); // Only await when busy, so `busy` is set at once.
		const last = this._getRow(this._ids.at(-1));
		if (!last) {
			await this.refresh();
			return;
		}
		if (!this._hasAfter) return;
		const items = await this._fetchPage(getQueryAfter(query, last, this.fetchAfter), last);
		if (!items) return;
		this._hasAfter = items.length > limit;
		this._pin([...this._ids, ...items.slice(0, limit)]);
		this.write(this._compose());
	}

	/**
	 * Load the next page of items after the last item. Alias of `fetchAfter()`.
	 *
	 * @returns Promise that resolves when the page has loaded.
	 * @see https://shelving.cc/db/QueryStore/fetchMore
	 */
	fetchMore(): Promise<void> {
		return this.fetchAfter();
	}

	/**
	 * Load the new items before the first item, e.g. new messages at the start of a newest-first list.
	 * - Loads up to one page (the query `$limit`), nearest to the first item. Call again while `hasBefore` is `true` to load more.
	 * - Sets `busy` while the items load. The items already loaded do not suspend.
	 * - Waits for a fetch that is already running, then loads the items.
	 * - Loads the first page if no items have loaded yet.
	 * - A failed fetch rejects the promise, and the items already loaded stay. Unlike `refresh()`, it does not set `reason`.
	 *
	 * @returns Promise that resolves when the new items have loaded.
	 * @throws {RequiredError} If the query has no `$order`.
	 * @throws {unknown} The error from the provider, if the fetch fails.
	 * @example setInterval(() => store.fetchBefore().catch(BLACKHOLE), 10_000); // Poll for new messages.
	 * @see https://shelving.cc/db/QueryStore/fetchBefore
	 */
	async fetchBefore(): Promise<void> {
		const { query, limit } = this;
		if (!this._orders.length)
			throw new RequiredError("Query must have $order to fetch more items", { store: this, query, caller: this.fetchBefore });
		if (this.busy.value) await this._idle(); // Only await when busy, so `busy` is set at once.
		const first = this._getRow(this._ids[0]);
		if (!first) {
			await this.refresh();
			return;
		}
		// Reverse the order so the items nearest to the first item come first.
		const items = await this._fetchPage(
			{ ...getQueryBefore(query, first, this.fetchBefore), $order: _reverseOrders(this._orders) } as Query<Item<I, T>>,
			first,
		);
		if (!items) return;
		this._hasBefore = items.length > limit;
		this._pin([...items.slice(0, limit).reverse(), ...this._ids]);
		this.write(this._compose());
	}

	/** Wait until no fetch is running. */
	private async _idle(): Promise<void> {
		while (this.busy.value) await this.busy.next;
	}

	/** Fetch one page from an inclusive cursor query, and drop the items already loaded. */
	private async _fetchPage(query: Query<Item<I, T>>, cursor: Item<I, T>): Promise<Items<I, T> | undefined> {
		const { _ids, _rows, limit } = this;
		const { key } = requireFirst(this._orders);
		const value = getDataProp(cursor, key);
		// The inclusive range returns the loaded items with the same sort value as the cursor again, so ask for that many more.
		let ties = 0;
		for (const id of _ids) {
			const row = _rows.get(id);
			if (row && isEqual(getDataProp(row, key), value)) ties++;
		}
		// A refresh that starts while the page loads owns the items and `busy`, so the page is dropped.
		const generation = this._generation;
		this.busy.value = true;
		try {
			const items = await this.provider.getQuery(this.collection, _withLimit(query, limit + ties + 1));
			if (generation !== this._generation) return;
			const seen = new Set(_ids);
			return items.filter(({ id }) => !seen.has(id));
		} catch (thrown) {
			if (generation === this._generation) throw thrown; // Keep the loaded items, so do not set `reason`.
		} finally {
			if (generation === this._generation) this.busy.value = false;
		}
	}

	/** Pin a list of items (or IDs of items already pinned) as the loaded items, in display order. */
	private _pin(items: ImmutableArray<Item<I, T> | I>): void {
		const rows = new Map<I, Item<I, T>>();
		const ids: I[] = [];
		for (const item of items) {
			const row = typeof item === "object" ? item : this._rows.get(item);
			if (!row || rows.has(row.id)) continue;
			rows.set(row.id, row);
			ids.push(row.id);
		}
		this._ids = ids;
		this._rows = rows;
		this._loaded = true;
		// Put the fetched items in the memory, so other stores can use them.
		if (this.memory) this.memory.getTable(this.collection).setItems(items.filter(item => typeof item === "object"));
	}

	/** Get a pinned item as it was fetched. */
	private _getRow(id: I | undefined): Item<I, T> | undefined {
		return id === undefined ? undefined : this._rows.get(id);
	}

	/**
	 * Make the current value of a paged query.
	 * - New items in the memory that match the filters and sort before the first pinned item come first.
	 * - When the list is complete (`hasAfter` is `false`), new items that sort after the last pinned item come last.
	 * - Then each pinned item in its pinned position, with its current data from the memory. Items deleted from the memory are hidden.
	 */
	private _compose(): Items<I, T> {
		const { memory, _ids, _rows, _orders, _filters } = this;
		if (!memory) return _ids.map(id => _rows.get(id)).filter(isDefined);
		const table = memory.getTable(this.collection);
		const first = this._getRow(_ids[0]);
		const last = this._hasAfter ? undefined : this._getRow(_ids.at(-1)); // Only a complete list shows new items at the end.
		const head: Item<I, T>[] = [];
		const tail: Item<I, T>[] = [];
		for (const item of table.getQuery()) {
			if (_rows.has(item.id) || !matchQueryItem(item, _filters)) continue;
			if (!first || compareQueryItems(item, first, _orders) < 0) head.push(item);
			else if (last && compareQueryItems(item, last, _orders) > 0) tail.push(item);
		}
		const body = _ids.map(id => table.getItem(id)).filter(isDefined);
		return [...sortQueryItems(head, _orders), ...body, ...sortQueryItems(tail, _orders)];
	}

	/** Recompose the value after the memory changes. */
	private _recompose(): void {
		// Skip while loading, or while a fetch runs (it recomposes when it ends, and a write now would abort a refresh).
		if (!this._loaded || this.busy.value) return;
		this.write(this._compose());
	}

	// Implement `Iterable`
	[Symbol.iterator](): Iterator<Item<I, T>> {
		return this.value.values();
	}
}

/** Set the limit of a query, or remove it when the limit is infinite. */
function _withLimit<T extends Data>(query: Query<T>, limit: number): Query<T> {
	return { ...query, $limit: Number.isFinite(limit) ? limit : undefined }; // Not `withProp()`, because it cannot infer `$limit` on a generic `Query<T>`.
}

/** Reverse every order of a query. */
function _reverseOrders(orders: ImmutableArray<QueryOrder>): ImmutableArray<string> {
	return orders.map(({ key, direction }) => `${direction === "asc" ? "!" : ""}${joinDataPath(key)}`);
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
