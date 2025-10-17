import { RequiredError } from "../error/RequiredError.js";
import { BooleanStore } from "../store/BooleanStore.js";
import { OptionalDataStore } from "../store/DataStore.js";
import { getGetter } from "../util/class.js";
import { NONE } from "../util/constants.js";
import type { Database, DataKey } from "../util/data.js";
import type { Identifier, Item } from "../util/item.js";
import { getItem } from "../util/item.js";
import { runSequence } from "../util/sequence.js";
import type { StopCallback } from "../util/start.js";
import type { MemoryProvider } from "./MemoryProvider.js";
import type { AbstractProvider } from "./Provider.js";

/** Store a single item. */
export class ItemStore<I extends Identifier, T extends Database, K extends DataKey<T>> extends OptionalDataStore<Item<I, T[K]>> {
	readonly provider: AbstractProvider<I, T>;
	readonly collection: K;
	readonly id: I;
	readonly busy = new BooleanStore();

	/** Get the data of this store (throws `RequiredError` if item doesn't exist). */
	override get data(): Item<I, T[K]> {
		const item = this.value;
		if (!item)
			throw new RequiredError(`Item does not exist in collection "${this.collection}"`, {
				store: this,
				provider: this.provider,
				collection: this.collection,
				id: this.id,
				caller: getGetter(this, "data"),
			});
		return item;
	}

	/** Set the data of this store. */
	override set data(data: T[K] | Item<I, T[K]>) {
		this.value = getItem(this.id, data);
	}

	constructor(collection: K, id: I, provider: AbstractProvider<I, T>, memory?: MemoryProvider<I, T>) {
		const time = memory?.getItemTime(collection, id);
		const item = memory?.getItem(collection, id);
		super(typeof time === "number" || item ? item : NONE, time); // Use the cached value if it was definitely cached or is not undefined.
		if (memory) this.starter = store => runSequence(store.through(memory.getCachedItemSequence(collection, id)));
		this.provider = provider;
		this.collection = collection;
		this.id = id;

		// Start loading the value from the provider if it wasn't cached.
		if (typeof time !== "number") this.refresh();
	}

	/** Refresh this store from the source provider. */
	refresh(provider: AbstractProvider<I, T> = this.provider): void {
		if (!this.busy.value) void this._refresh(provider);
	}
	private async _refresh(provider: AbstractProvider<I, T>): Promise<void> {
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
	refreshStale(maxAge: number, provider?: AbstractProvider<I, T>) {
		if (this.age > maxAge) this.refresh(provider);
	}

	/** Subscribe this store to a provider. */
	connect(provider: AbstractProvider<I, T> = this.provider): StopCallback {
		return runSequence(this.through(provider.getItemSequence(this.collection, this.id)));
	}
}
