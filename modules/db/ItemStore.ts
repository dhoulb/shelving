import type { MemoryProvider } from "./MemoryProvider.js";
import type { AbstractProvider } from "./Provider.js";
import type { DataKey, Database } from "../util/data.js";
import type { Item, OptionalItem } from "../util/item.js";
import type { Stop } from "../util/start.js";
import { BooleanStore } from "../store/BooleanStore.js";
import { LazyStore } from "../store/LazyStore.js";
import { NONE } from "../util/constants.js";
import { getItem } from "../util/item.js";
import { getRequired } from "../util/optional.js";
import { runSequence } from "../util/sequence.js";

/** Store a single item. */
export class ItemStore<T extends Database, K extends DataKey<T>> extends LazyStore<OptionalItem<T[K]>> {
	readonly provider: AbstractProvider<T>;
	readonly collection: K;
	readonly id: string;
	readonly busy = new BooleanStore();

	/** Get the data of this store (throws `RequiredError` if item doesn't exist). */
	get data(): Item<T[K]> {
		return getRequired(this.value);
	}

	/** Set the data of this store. */
	set data(data: T[K] | Item<T[K]>) {
		this.value = getItem(this.id, data);
	}

	/** Does the item exist? */
	get exists(): boolean {
		return !!this.value;
	}

	constructor(collection: K, id: string, provider: AbstractProvider<T>, memory?: MemoryProvider<T>) {
		const time = memory?.getItemTime(collection, id);
		const item = memory?.getItem(collection, id);
		super(
			store => memory && runSequence(store.through(memory.getCachedItemSequence(collection, id))),
			typeof time === "number" || item ? item : NONE, // Use the cached value if it was definitely cached or is not undefined.
			time,
		);
		this.provider = provider;
		this.collection = collection;
		this.id = id;

		// Start loading the value from the provider if it wasn't cached.
		if (typeof time !== "number") this.refresh();
	}

	/** Refresh this store from the source provider. */
	refresh(provider: AbstractProvider<T> = this.provider): void {
		if (!this.busy.value) void this._refresh(provider);
	}
	private async _refresh(provider: AbstractProvider<T>): Promise<void> {
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
	refreshStale(maxAge: number, provider?: AbstractProvider<T>) {
		if (this.age > maxAge) this.refresh(provider);
	}

	/** Subscribe this store to a provider. */
	connect(provider: AbstractProvider<T> = this.provider): Stop {
		return runSequence(this.through(provider.getItemSequence(this.collection, this.id)));
	}
}
