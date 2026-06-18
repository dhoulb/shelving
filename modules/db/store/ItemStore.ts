import { RequiredError } from "../../error/RequiredError.js";
import { FetchStore } from "../../store/FetchStore.js";
import { getGetter } from "../../util/class.js";
import { NONE } from "../../util/constants.js";
import type { Data } from "../../util/data.js";
import type { Identifier, Item, OptionalItem } from "../../util/item.js";
import { getItem } from "../../util/item.js";
import { runSequence } from "../../util/sequence.js";
import type { Collection } from "../collection/Collection.js";
import type { DBProvider } from "../provider/DBProvider.js";
import type { MemoryDBProvider } from "../provider/MemoryDBProvider.js";

/**
 * Store that fetches and tracks a single item by ID in a collection from a database provider.
 *
 * - Holds an [`OptionalItem`](/util/item/OptionalItem) value: the item if it exists, or `undefined` if it doesn't.
 * - Seeds from a [`MemoryDBProvider`](/db/MemoryDBProvider) snapshot when available, and subscribes to realtime updates.
 *
 * @example
 *  const store = new ItemStore(collection, "abc", provider);
 *  const item = await store; // OptionalItem<I, T>
 * @see https://dhoulb.github.io/shelving/db/store/ItemStore/ItemStore
 */
export class ItemStore<I extends Identifier, T extends Data> extends FetchStore<OptionalItem<I, T>> {
	/**
	 * The database provider this store fetches its item from.
	 * @see https://dhoulb.github.io/shelving/db/store/ItemStore/ItemStore/provider
	 */
	readonly provider: DBProvider<I>;
	/**
	 * The collection the item lives in.
	 * @see https://dhoulb.github.io/shelving/db/store/ItemStore/ItemStore/collection
	 */
	readonly collection: Collection<string, I, T>;
	/**
	 * The ID of the item this store tracks.
	 * @see https://dhoulb.github.io/shelving/db/store/ItemStore/ItemStore/id
	 */
	readonly id: I;

	/**
	 * The required item data of this store.
	 * - Use this when the item is known to exist; use `value` when it may be `undefined`.
	 *
	 * @returns The item data including its ID.
	 * @throws {RequiredError} If the item doesn't exist (i.e. if `this.value` is `undefined`).
	 * @example store.item // Item<I, T>
	 * @see https://dhoulb.github.io/shelving/db/store/ItemStore/ItemStore/item
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

	/**
	 * Create a store that tracks a single item by ID.
	 *
	 * @param collection The collection the item lives in.
	 * @param id The ID of the item to track.
	 * @param provider The database provider to fetch the item from.
	 * @param memory Optional memory provider used to seed the initial value and drive realtime updates.
	 * @example new ItemStore(collection, "abc", provider)
	 */
	constructor(collection: Collection<string, I, T>, id: I, provider: DBProvider<I>, memory?: MemoryDBProvider<I>) {
		const item = memory?.getTable(collection).getItem(id);
		super(item ?? NONE); // Use the current memory snapshot if available.
		if (memory) this.starter = store => runSequence(store.through(memory.getItemSequence(collection, id)));
		this.provider = provider;
		this.collection = collection;
		this.id = id;
	}

	// Override to get the item from the provider.
	override _fetch(_signal: AbortSignal): Promise<OptionalItem<I, T>> {
		return this.provider.getItem(this.collection, this.id);
	}
}
