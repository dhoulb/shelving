import { RequiredError } from "../../error/RequiredError.js";
import { BooleanStore } from "../../store/BooleanStore.js";
import { OptionalDataStore } from "../../store/DataStore.js";
import { getGetter } from "../../util/class.js";
import { NONE } from "../../util/constants.js";
import type { Data } from "../../util/data.js";
import type { Identifier, Item } from "../../util/item.js";
import { getItem } from "../../util/item.js";
import { runSequence } from "../../util/sequence.js";
import type { StopCallback } from "../../util/start.js";
import type { Collection } from "../collection/Collection.js";
import type { DBProvider } from "../provider/DBProvider.js";
import type { MemoryDBProvider } from "../provider/MemoryDBProvider.js";

/** Store a single item. */
export class ItemStore<I extends Identifier, T extends Data> extends OptionalDataStore<Item<I, T>> {
	readonly provider: DBProvider<I>;
	readonly collection: Collection<string, I, T>;
	readonly id: I;
	readonly busy = new BooleanStore();

	/** Get the data of this store (throws `RequiredError` if item doesn't exist). */
	override get data(): Item<I, T> {
		const item = this.value;
		if (!item)
			throw new RequiredError(`Item does not exist in collection "${this.collection.name}"`, {
				store: this,
				provider: this.provider,
				collection: this.collection.name,
				id: this.id,
				caller: getGetter(this, "data"),
			});
		return item;
	}

	/** Set the data of this store. */
	override set data(data: T | Item<I, T>) {
		this.value = getItem(this.id, data);
	}

	constructor(collection: Collection<string, I, T>, id: I, provider: DBProvider<I>, memory?: MemoryDBProvider<I>) {
		const item = memory?.getTable(collection).getItem(id);
		super(item ?? NONE); // Use the current memory snapshot if available.
		if (memory) this.starter = store => runSequence(store.through(memory.getItemSequence(collection, id)));
		this.provider = provider;
		this.collection = collection;
		this.id = id;

		// Always refresh from source, even if memory supplied an initial value.
		this.refresh();
	}

	/** Refresh this store from the source provider. */
	refresh(provider: DBProvider<I> = this.provider): void {
		if (!this.busy.value) void this._refresh(provider);
	}
	private async _refresh(provider: DBProvider<I>): Promise<void> {
		this.busy.value = true;
		this.reason = undefined; // Optimistically clear the error.
		try {
			this.value = await provider.getItem(this.collection, this.id);
		} catch (thrown) {
			this.reason = thrown;
		} finally {
			this.busy.value = false;
		}
	}

	/** Refresh this store if data in the cache is older than `maxAge` (in milliseconds). */
	refreshStale(maxAge: number, provider?: DBProvider<I>) {
		if (this.age > maxAge) this.refresh(provider);
	}

	/** Subscribe this store to a provider. */
	connect(provider: DBProvider<I> = this.provider): StopCallback {
		return runSequence(this.through(provider.getItemSequence(this.collection, this.id)));
	}
}
