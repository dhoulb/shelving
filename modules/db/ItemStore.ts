import type { AbstractProvider } from "../provider/Provider.js";
import type { StopCallback } from "../util/callback.js";
import type { Data } from "../util/data.js";
import type { ItemData, ItemValue } from "../util/item.js";
import { CacheProvider } from "../provider/CacheProvider.js";
import { BooleanStore } from "../store/BooleanStore.js";
import { Store } from "../store/Store.js";
import { call } from "../util/callback.js";
import { NONE } from "../util/constants.js";
import { getItemData } from "../util/item.js";
import { getRequired } from "../util/optional.js";
import { runSequence } from "../util/sequence.js";
import { getOptionalSource } from "../util/source.js";

/** Store a single item. */
export class ItemStore<T extends Data = Data> extends Store<ItemValue<T>> {
	readonly provider: AbstractProvider;
	readonly collection: string;
	readonly id: string;
	readonly busy = new BooleanStore();

	/** Get the data of this store (throws `RequiredError` if item doesn't exist). */
	get data(): ItemData<T> {
		return getRequired(this.value);
	}

	/** Set the data of this store. */
	set data(data: T | ItemData<T>) {
		this.value = getItemData(this.id, data);
	}

	/** Does the item exist? */
	get exists(): boolean {
		return !!this.value;
	}

	constructor(provider: AbstractProvider, collection: string, id: string) {
		const memory = getOptionalSource(CacheProvider, provider)?.memory;
		const time = memory ? memory.getItemTime(collection, id) : undefined;
		super(memory && typeof time === "number" ? memory.getItem(collection, id) : NONE, time);
		this.provider = provider;
		this.collection = collection;
		this.id = id;

		// Queue a request to refresh the value if it doesn't exist.
		if (this.loading) this.refresh();
	}

	/** Refresh this store from the source provider. */
	refresh(provider: AbstractProvider = this.provider): void {
		if (!this.busy.value) void this._refresh(provider);
	}
	private async _refresh(provider: AbstractProvider): Promise<void> {
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
	refreshStale(maxAge: number, provider?: AbstractProvider) {
		if (this.age > maxAge) this.refresh(provider);
	}

	/** Subscribe this store to a provider. */
	connect(provider: AbstractProvider = this.provider): StopCallback {
		return runSequence(this.through(provider.getItemSequence(this.collection, this.id)));
	}

	// Override to subscribe to `MemoryProvider` while things are iterating over this store.
	override async *[Symbol.asyncIterator](): AsyncGenerator<ItemValue<T>, void, void> {
		this.start();
		this._iterating++;
		try {
			yield* super[Symbol.asyncIterator]();
		} finally {
			this._iterating--;
			if (this._iterating < 1) this.stop();
		}
	}
	private _iterating = 0;

	/** Start subscription to `MemoryProvider` if there is one. */
	start() {
		if (!this._stop) {
			const memory = getOptionalSource(CacheProvider, this.provider)?.memory;
			if (memory) this._stop = runSequence(this.through(memory.getCachedItemSequence(this.collection, this.id)));
		}
	}
	/** Stop subscription to `MemoryProvider` if there is one. */
	stop() {
		if (this._stop) this._stop = void call(this._stop);
	}
	private _stop: StopCallback | undefined = undefined;

	// Implement `Disposable`
	[Symbol.dispose](): void {
		this.stop();
	}
}
