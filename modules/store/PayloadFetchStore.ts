import { awaitAbort, getDelay } from "../util/async.js";
import type { NONE } from "../util/constants.js";
import { awaitDispose } from "../util/dispose.js";
import { FetchStore } from "./FetchStore.js";
import { Store } from "./Store.js";

export type PayloadFetchCallback<P, R> = (payload: P, signal: AbortSignal) => R | PromiseLike<R>;

/**
 * Store that fetches its values from a remote source by sending a payload to them.
 *
 * @param payload The initial payload for the store.
 * @param value The initial value for the store, or `NONE` if it does not have one yet.
 * @param callback An optional callback that, if set, will be called with the current payload when the `fetch()` method is invoked to fetch the next value.
 * @param debounce Delay in milliseconds before the fetch is triggered after a payload change. `busy` becomes `true` immediately; the actual fetch waits for the debounce period to expire. If the payload changes again before the delay expires the previous fetch is cancelled and the timer resets.
 */
export class PayloadFetchStore<P, R> extends FetchStore<R> {
	/**
	 * Store keeping the current payload to send to the fetch on send.
	 * - New payloads can be set using `this.payload.value`
	 */
	readonly payload: Store<P>;

	// Override to save initial payload and callback.
	constructor(payload: P | typeof NONE, value: R | typeof NONE, callback?: PayloadFetchCallback<P, R>, debounce = 0) {
		const payloadStore = new Store(payload);
		const fetch =
			callback &&
			(async (signal: AbortSignal) => {
				const abort = awaitAbort(signal);
				if (debounce > 0) await Promise.race([getDelay(debounce), abort]);
				const value = payloadStore.loading ? await Promise.race([payloadStore.next, abort]) : payloadStore.value;
				return callback(value, signal);
			});
		super(value, fetch);
		this.payload = payloadStore;
		void _iterate(this);
	}

	// Implement `AsyncDisposable`
	override async [Symbol.asyncDispose](): Promise<void> {
		await awaitDispose(
			this.payload, // Send `done: true` to any iterators of the payload store.
			super[Symbol.asyncDispose](),
		);
	}
}

/**
 * Wait for payload changes, and abort any in-flight request, mark stale, then start a fresh fetch.
 * - Note that `this.payload` gets disposed in the `PayloadFetchStore` cleanup function which will send `done: true` to this iteration and end it.
 */
async function _iterate<P, R>(store: PayloadFetchStore<P, R>): Promise<void> {
	for await (const _payload of store.payload.next) {
		store.invalidate(); // Abort any in-flight fetch and mark stale.
		void store.refresh(); // Eagerly start a fresh fetch with the new payload.
	}
}
