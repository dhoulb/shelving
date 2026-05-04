import { awaitDispose } from "../util/dispose.js";
import { BooleanStore } from "./BooleanStore.js";
import { Store, type StoreInput } from "./Store.js";

/**
 * Store that tracks its busy status via a separate `this.busy` store.
 * - "busy" means the store is awaiting a new value.
 */
export class BusyStore<T, TT = T> extends Store<T, TT> {
	readonly busy = new BooleanStore(false);

	// Overload to set `this.busy` to `true` when we start awaiting a value.
	// Gets set back to `false` when `abort()` is called (this also happens whenever a value or reason is set).
	override await(pending: PromiseLike<StoreInput<TT>>): Promise<boolean> {
		this.busy.value = true;
		return super.await(pending);
	}

	// Override to set busy to false on abort.
	// This also happens whenever a value or reaosn is set.
	override abort(): void {
		this.busy.value = false;
		super.abort();
	}

	// Implement `AsyncDisposable`.
	override async [Symbol.asyncDispose](): Promise<void> {
		await awaitDispose(
			() => this.abort(),
			this.busy, // Send `done: true` to any iterators of the busy store.
			super[Symbol.asyncDispose](),
		);
	}
}
