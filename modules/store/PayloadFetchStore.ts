import type { NONE } from "../util/constants.js";
import { awaitDispose } from "../util/dispose.js";
import { FetchStore } from "./FetchStore.js";
import { Store } from "./Store.js";

export type PayloadFetchCallback<P, R> = (payload: P) => R | PromiseLike<R>;

/**
 * Store that fetches its values from a remote source by sending a payload to them.
 *
 * @param payload The initial payload for the store.
 * @param value The initial value for the store, or `NONE` if it does not have one yet.
 * @param callback An optional callback that, if set, will be called with the current payload when the `fetch()` method is invoked to fetch the next value.
 */
export class PayloadFetchStore<P, R> extends FetchStore<R> {
	/**
	 * Store keeping the current payload to send to the fetch on send.
	 * - New payloads can be set using `this.payload.value`
	 */
	readonly payload: Store<P>;

	// Override to save initial payload and callback.
	constructor(payload: P, value: R | typeof NONE, callback?: PayloadFetchCallback<P, R>) {
		const payloadStore = new Store(payload);
		super(value, callback && (() => callback(payloadStore.value)));
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
		store.abort(); // Abort any in-flight request that used the old payload.
		store.invalidate(); // Mark stale so the next read (or the refresh below) fetches fresh data.
		void store.refresh(); // Eagerly start a fresh fetch if no other fetch is already in-flight.
	}
}
