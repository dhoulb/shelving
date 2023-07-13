import type { AsyncItemReference, ItemData, ItemReference, ItemValue } from "./ItemReference.js";
import type { AsyncProvider, Provider } from "../provider/Provider.js";
import type { StopCallback } from "../util/callback.js";
import type { Data } from "../util/data.js";
import { CacheProvider } from "../provider/CacheProvider.js";
import { BooleanState } from "../state/BooleanState.js";
import { State } from "../state/State.js";
import { call } from "../util/callback.js";
import { getRequired } from "../util/null.js";
import { getOptionalSource } from "../util/source.js";
import { getItemData } from "./ItemReference.js";

/** Hold the current state of a item. */
export class ItemState<T extends Data = Data> extends State<ItemValue<T>> {
	readonly ref: ItemReference<T> | AsyncItemReference<T>;
	readonly busy = new BooleanState();

	/** Get the data of this state (throws `RequiredError` if item doesn't exist). */
	get data(): ItemData<T> {
		return getRequired(this.value);
	}

	/** Set the data of this state. */
	set data(data: T | ItemData<T>) {
		this.value = getItemData(this.ref.id, data);
	}

	/** Does the item exist? */
	get exists(): boolean {
		return !!this.value;
	}

	constructor(ref: ItemReference<T> | AsyncItemReference<T>) {
		const { provider, collection, id } = ref;
		const memory = getOptionalSource(CacheProvider, provider)?.memory;
		const time = memory ? memory.getItemTime(collection, id) : undefined;
		super(memory && typeof time === "number" ? (memory.getItem(collection, id) as ItemValue<T>) : undefined, time);
		this.ref = ref;

		// Queue a request to refresh the value if it doesn't exist.
		if (this.loading) this.refresh();
	}

	/** Refresh this state from the source provider. */
	refresh(provider: Provider | AsyncProvider = this.ref.provider): void {
		if (!this.busy.value) void this._refresh(provider);
	}
	private async _refresh(provider: Provider | AsyncProvider): Promise<void> {
		this.busy.value = true;
		this.reason = undefined; // Optimistically clear the error.
		try {
			this.value = (await provider.getItem(this.ref.collection, this.ref.id)) as ItemValue<T>;
		} catch (thrown) {
			this.reason = thrown;
		} finally {
			this.busy.value = false;
		}
	}

	/** Refresh this state if data in the cache is older than `maxAge` (in milliseconds). */
	refreshStale(maxAge: number, provider?: Provider | AsyncProvider) {
		if (this.age > maxAge) this.refresh(provider);
	}

	/** Subscribe this state to a provider. */
	connect(provider: Provider | AsyncProvider = this.ref.provider): StopCallback {
		return this.from(provider.getItemSequence(this.ref.collection, this.ref.id) as AsyncIterable<ItemValue<T>>);
	}

	// Override to subscribe to `MemoryProvider` while things are iterating over this state.
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
			const { collection, id, provider } = this.ref;
			const memory = getOptionalSource(CacheProvider, provider)?.memory;
			if (memory) this._stop = this.from(memory.getCachedItemSequence(collection, id) as AsyncIterable<ItemValue<T>>);
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
