import type { Data } from "../../util/data.js";
import { awaitDispose } from "../../util/dispose.js";
import type { Identifier, Item, Items, ItemsSequence, OptionalItem, OptionalItemSequence } from "../../util/item.js";
import type { Query } from "../../util/query.js";
import type { Updates } from "../../util/update.js";
import type { Collection } from "../collection/Collection.js";
import type { DBProvider } from "./DBProvider.js";
import { MemoryDBProvider } from "./MemoryDBProvider.js";
import { RecordingDBProvider } from "./RecordingDBProvider.js";
import { ThroughDBProvider } from "./ThroughDBProvider.js";

/**
 * Database provider that keeps a copy of asynchronous remote data in a local synchronous cache.
 *
 * - Wraps a `source` provider and mirrors every read and write into an in-memory `MemoryDBProvider`, so subsequent reads can be served synchronously and live subscriptions stay seeded.
 * - Reads fetch from `source`, then refresh the cache; writes hit `source`, then mirror the change into the cache.
 * - Fetch-first item writes: `updateItem()` and `deleteItem()` fetch the item first (caching it) and skip the source write when it doesn't exist. Query writes are inherited two-step, resolving through this provider's own `getQuery()` — so the matched items are cached, and each per-item write mirrors exactly. The fetch and the writes are separate steps, so wrap them in `transact()` when they must be atomic.
 * - Transactions run on `source` via `transact()` with a transaction-scoped mirror — only a committed transaction's writes reach the cache.
 * - Discover the cache from a wrapping layer with `getSource(CacheDBProvider, provider)` to seed stores from `.memory`.
 *
 * @see https://shelving.cc/db/CacheDBProvider
 */
export class CacheDBProvider<I extends Identifier, T extends Data> extends ThroughDBProvider<I, T> {
	/**
	 * The in-memory provider holding the local synchronous cache of `source` data.
	 *
	 * @see https://shelving.cc/db/CacheDBProvider/memory
	 */
	readonly memory: MemoryDBProvider<I, T>;

	/**
	 * @param cache In-memory provider to use as the cache (a fresh `MemoryDBProvider` by default).
	 */
	constructor(source: DBProvider<I, T>, cache: MemoryDBProvider<I, T> = new MemoryDBProvider<I, T>()) {
		super(source);
		this.memory = cache;
	}

	/** Read from `source`, then refresh the cache. */
	override async getItem<II extends I, TT extends T>(collection: Collection<string, II, TT>, id: II): Promise<OptionalItem<II, TT>> {
		const item = await super.getItem(collection, id);
		const table = this.memory.getTable(collection);
		item ? table.setItem(id, item) : table.deleteItem(id);
		return item;
	}

	/** Mirror each emission into the cache. */
	override getItemSequence<II extends I, TT extends T>(collection: Collection<string, II, TT>, id: II): OptionalItemSequence<II, TT> {
		return this.memory.getTable(collection).setItemSequence(id, super.getItemSequence(collection, id));
	}

	/** Mirror the added item into the cache. */
	override async addItem<II extends I, TT extends T>(collection: Collection<string, II, TT>, data: TT): Promise<II> {
		const id = await super.addItem(collection, data);
		this.memory.getTable(collection).setItem(id, data);
		return id;
	}

	/** Mirror the set item into the cache. */
	override async setItem<II extends I, TT extends T>(collection: Collection<string, II, TT>, id: II, data: TT): Promise<void> {
		await super.setItem(collection, id, data);
		this.memory.getTable(collection).setItem(id, data);
	}

	/** Fetch the item first (caching it), then update it only if it exists. */
	override async updateItem<II extends I, TT extends T>(
		collection: Collection<string, II, TT>,
		id: II,
		updates: Updates<Item<II, TT>>,
	): Promise<void> {
		const item = await this.getItem(collection, id);
		if (!item) return;
		await super.updateItem(collection, id, updates);
		this.memory.getTable(collection).updateItem(id, updates);
	}

	/** Fetch the item first, then delete it only if it exists. */
	override async deleteItem<II extends I, TT extends T>(collection: Collection<string, II, TT>, id: II): Promise<void> {
		const item = await this.getItem(collection, id);
		if (!item) return;
		await super.deleteItem(collection, id);
		this.memory.getTable(collection).deleteItem(id);
	}

	/** Read from `source`, then refresh the cache. */
	override async getQuery<II extends I, TT extends T>(
		collection: Collection<string, II, TT>,
		query?: Query<Item<II, TT>>,
	): Promise<Items<II, TT>> {
		const items = await super.getQuery(collection, query);
		this.memory.getTable(collection).setItems(items);
		return items;
	}

	/** Mirror each emission into the cache. */
	override getQuerySequence<II extends I, TT extends T>(
		collection: Collection<string, II, TT>,
		query?: Query<Item<II, TT>>,
	): ItemsSequence<II, TT> {
		return this.memory.getTable(collection).setItemsSequence(super.getQuerySequence(collection, query));
	}

	// Override so transaction copies get their own transaction-scoped mirror — uncommitted writes must never touch the real cache.
	override cloneWith(source: DBProvider<I, T>): this {
		const clone = super.cloneWith(source);
		Object.defineProperty(clone, "memory", { value: new MemoryDBProvider<I, T>(), enumerable: true });
		return clone;
	}

	/**
	 * Runs the transaction on `source`, recording the callback's operations, then commits the recorded writes into the cache once the source commits.
	 * - The callback's provider is this cache over the source's transaction (with its own transaction-scoped mirror), so fetch-first writes and query resolution behave exactly as they do outside a transaction — and the fetch-then-write steps are atomic because both run in the source transaction.
	 * - Uncommitted data never touches the cache: a thrown callback commits nothing, and if the backend retries the callback only the committed attempt's writes are mirrored.
	 * - Update writes commit to the cache as deltas, so they refresh cached items and skip uncached ones — an item only read inside the transaction stays uncached until its next read.
	 */
	override async transact<X>(callback: (provider: DBProvider<I, T>) => Promise<X>): Promise<X> {
		let transaction: RecordingDBProvider<I, T> | undefined;
		const result = await this.source.transact(provider =>
			callback((transaction = new RecordingDBProvider<I, T>(this.cloneWith(provider)))),
		);
		if (transaction) await transaction.replayWrites(this.memory); // Commit the recorded writes into the cache.
		return result;
	}

	// Implement `AsyncDisposable`
	override async [Symbol.asyncDispose]() {
		await awaitDispose(
			this.memory, // Dispose the cache memory provider.
			super[Symbol.asyncDispose](), // Chain (disposes `source`).
		);
	}
}
