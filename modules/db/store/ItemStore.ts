import { RequiredError } from "../../error/RequiredError.js";
import { UnsupportedError } from "../../error/UnsupportedError.js";
import { FetchStore } from "../../store/FetchStore.js";
import { awaitAbort, awaitRace } from "../../util/async.js";
import { getGetter } from "../../util/class.js";
import { NONE } from "../../util/constants.js";
import type { Data } from "../../util/data.js";
import { BLACKHOLE } from "../../util/function.js";
import type { Identifier, Item, OptionalItem } from "../../util/item.js";
import { getItem } from "../../util/item.js";
import { runSequence } from "../../util/sequence.js";
import { getSource } from "../../util/source.js";
import type { Collection } from "../collection/Collection.js";
import type { DBProvider } from "../provider/DBProvider.js";
import { MemoryDBProvider, type MemoryTable } from "../provider/MemoryDBProvider.js";

/**
 * Store that fetches and tracks a single item by ID in a collection from a database provider.
 *
 * - Holds an `OptionalItem` value: the item if it exists, or `undefined` if it doesn't.
 * - When the provider is (or wraps) a `MemoryDBProvider`, the store seeds from the memory at once and follows its changes. A missing item only counts as loaded when the memory has a time for it (see `MemoryTable.getItemTime()`). Until then the store is loading, and a fetch waits until the memory loads the item (e.g. from `HydratingAPIProvider`).
 * - Any other provider is fetched, and its `DBProvider.getItemSequence()` is followed while the store has subscribers. A provider that throws `UnsupportedError` for subscriptions is only fetched.
 *
 * @example
 *  const store = new ItemStore(collection, "abc", provider);
 *  const item = await store; // OptionalItem<I, T>
 * @see https://shelving.cc/db/ItemStore
 */
export class ItemStore<I extends Identifier, T extends Data> extends FetchStore<OptionalItem<I, T>> {
	/**
	 * The database provider this store fetches its item from.
	 * @see https://shelving.cc/db/ItemStore/provider
	 */
	readonly provider: DBProvider<I>;
	/**
	 * The collection the item lives in.
	 * @see https://shelving.cc/db/ItemStore/collection
	 */
	readonly collection: Collection<string, I, T>;
	/**
	 * The ID of the item this store tracks.
	 * @see https://shelving.cc/db/ItemStore/id
	 */
	readonly id: I;

	/**
	 * The required item data of this store.
	 * - Use this when the item is known to exist; use `value` when it may be `undefined`.
	 *
	 * @returns The item data including its ID.
	 * @throws {RequiredError} If the item doesn't exist (i.e. if `this.value` is `undefined`).
	 * @example store.item // Item<I, T>
	 * @see https://shelving.cc/db/ItemStore/item
	 */
	get item(): Item<I, T> {
		const item = this.value;
		if (!item)
			throw new RequiredError(`Item does not exist in collection "${this.collection.name}"`, {
				store: this,
				provider: this.provider,
				collection: this.collection.name,
				id: this.id,
				caller: getGetter(this, "item"),
			});
		return item;
	}
	set item(data: T | Item<I, T>) {
		this.value = getItem(this.id, data);
	}

	/** The memory table the provider is backed by, if any. */
	private readonly _table: MemoryTable<I, T> | undefined;

	constructor(collection: Collection<string, I, T>, id: I, provider: DBProvider<I>) {
		const table = getSource<MemoryDBProvider<I>>(MemoryDBProvider, provider)?.getTable(collection);
		super(table && _isLoaded(table, id) ? table.getItem(id) : NONE); // Use the current memory snapshot if it has loaded.
		this.provider = provider;
		this.collection = collection;
		this.id = id;
		this._table = table;
		this.starter = table
			? store => runSequence(store.through(_getLoadedSequence(table, id)))
			: store =>
					runSequence(
						store.through(_getSupportedSequence(() => provider.getItemSequence(collection, id))),
						undefined,
						reason => (store.reason = reason),
					);
	}

	// Override to get the item from the provider.
	// - A memory waits until it has loaded the item.
	override async _fetch(signal: AbortSignal): Promise<OptionalItem<I, T>> {
		const { provider, collection, id, _table } = this;
		if (_table && !_isLoaded(_table, id)) await _awaitFirst(_getLoadedSequence(_table, id), signal);
		return provider.getItem(collection, id);
	}
}

/** Whether the memory has loaded an item, i.e. it has the item, or a time for it. */
function _isLoaded<I extends Identifier, T extends Data>(table: MemoryTable<I, T>, id: I): boolean {
	return !!table.getItem(id) || table.getItemTime(id) !== undefined;
}

/** Follow an item in the memory, but skip the values from before it has loaded. */
async function* _getLoadedSequence<I extends Identifier, T extends Data>(
	table: MemoryTable<I, T>,
	id: I,
): AsyncIterable<OptionalItem<I, T>> {
	for await (const item of table.getItemSequence(id)) if (_isLoaded(table, id)) yield item;
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
		if (result.done) throw new RequiredError("Memory closed before the item loaded", { caller: _awaitFirst });
		return result.value;
	} finally {
		iterator.return?.().catch(BLACKHOLE);
	}
}
