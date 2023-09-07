import type { AbstractProvider } from "./Provider.js";
import type { StopCallback } from "../util/callback.js";
import type { DataKey, Database } from "../util/data.js";
import type { Item, OptionalItem } from "../util/item.js";
import { BooleanStore } from "../store/BooleanStore.js";
import { Store } from "../store/Store.js";
import { call } from "../util/callback.js";
import { NONE } from "../util/constants.js";
import { getItem } from "../util/item.js";
import { getRequired } from "../util/optional.js";
import { runSequence } from "../util/sequence.js";
import { getOptionalSource } from "../util/source.js";
import { CacheProvider } from "./CacheProvider.js";

/** Store a single item. */
export class ItemStore<T extends Database, K extends DataKey<T>> extends Store<OptionalItem<T[K]>> {
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

	constructor(provider: AbstractProvider<T>, collection: K, id: string) {
		const memory = getOptionalSource<CacheProvider<T>>(CacheProvider, provider)?.memory;
		const time = memory?.getItemTime(collection, id);
		const value = memory && typeof time === "number" ? memory.getItem(collection, id) : NONE; // Use the value in the memory provider if it's cached, or use mark this store as loading otherwise (which will trigger `refresh()` below.
		super(value, time);
		this.provider = provider;
		this.collection = collection;
		this.id = id;

		// Queue a request to refresh the value if it doesn't exist.
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
	connect(provider: AbstractProvider<T> = this.provider): StopCallback {
		return runSequence(this.through(provider.getItemSequence(this.collection, this.id)));
	}

	// Override to subscribe to `MemoryProvider` while things are iterating over this store.
	override async *[Symbol.asyncIterator](): AsyncGenerator<OptionalItem<T[K]>, void, void> {
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
			const table = getOptionalSource<CacheProvider<T>>(CacheProvider, this.provider)?.memory.getTable(this.collection);
			if (table) this._stop = runSequence(this.through(table.getCachedItemSequence(this.id)));
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
