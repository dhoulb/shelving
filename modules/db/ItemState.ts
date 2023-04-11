import { Data, getData } from "../util/data.js";
import { Dispatch } from "../util/function.js";
import { State } from "../state/State.js";
import { BooleanState } from "../state/BooleanState.js";
import { getOptionalSource } from "../util/source.js";
import { LazyDeferredSequence } from "../sequence/LazyDeferredSequence.js";
import { CacheProvider } from "../provider/CacheProvider.js";
import { MemoryTable } from "../index.js";
import { ItemValue, Item, AsyncItem, ItemData } from "./Item.js";

/** Hold the current state of a item. */
export class ItemState<T extends Data = Data> extends State<ItemValue<T>> {
	readonly ref: Item<T> | AsyncItem<T>;
	readonly busy = new BooleanState();

	/** Get the data of the item (throws `RequiredError` if item doesn't exist). */
	get data(): ItemData<T> {
		return getData(this.value);
	}

	/** Does the item exist (i.e. its value isn't `null`)? */
	get exists(): boolean {
		return !!this.value;
	}

	constructor(ref: Item<T> | AsyncItem<T>) {
		const { provider, collection, id } = ref;
		const table = getOptionalSource(CacheProvider, provider)?.memory.getTable(collection) as MemoryTable<T>;
		const time = table ? table.getItemTime(id) : null;
		const isCached = typeof time === "number";
		super(table && isCached ? table.getItem(id) : State.NOVALUE, table ? new LazyDeferredSequence(() => this.from(table.getCachedItemSequence(id))) : undefined);
		this._time = time;
		this.ref = ref;

		// Queue a request to refresh the value if it doesn't exist.
		if (this.loading) this.refresh();
	}

	/** Refresh this state from the source provider. */
	readonly refresh = (): void => {
		if (!this.busy.value) void this._refresh();
	};
	private async _refresh(): Promise<void> {
		this.busy.set(true);
		try {
			this.set(await this.ref.value);
		} catch (thrown) {
			this.next.reject(thrown);
		} finally {
			this.busy.set(false);
		}
	}

	/** Refresh this state if data in the cache is older than `maxAge` (in milliseconds). */
	refreshStale(maxAge: number) {
		if (this.age > maxAge) this.refresh();
	}

	/** Subscribe this state to the source provider. */
	connectSource(): Dispatch {
		return this.from(this.ref);
	}
}
