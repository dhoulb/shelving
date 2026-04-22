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

/** Store that stores a single item in a collection from a database provider. */
export class ItemStore<I extends Identifier, T extends Data> extends FetchStore<OptionalItem<I, T>> {
	readonly provider: DBProvider<I>;
	readonly collection: Collection<string, I, T>;
	readonly id: I;

	/**
	 * The required item data of this store.
	 * @throws {RequiredError} if item doesn't exist (i.e. if `this.value` is `undefined`
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

	constructor(collection: Collection<string, I, T>, id: I, provider: DBProvider<I>, memory?: MemoryDBProvider<I>) {
		const item = memory?.getTable(collection).getItem(id);
		super(item ?? NONE); // Use the current memory snapshot if available.
		if (memory) this.starter = store => runSequence(store.through(memory.getItemSequence(collection, id)));
		this.provider = provider;
		this.collection = collection;
		this.id = id;
	}

	// Override to get the item from the provider.
	override _fetch(): Promise<OptionalItem<I, T>> {
		return this.provider.getItem(this.collection, this.id);
	}
}
