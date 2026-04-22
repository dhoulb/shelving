import type { NONE } from "../util/constants.js";
import { dispose } from "../util/dispose.js";
import { FetchStore } from "./FetchStore.js";
import { Store } from "./Store.js";

export type PayloadFetchCallback<P, R> = (payload: P) => PromiseLike<R>;

/**
 * Store that fetches its values from a remote source by sending a payload to them.
 *
 * @param payload The initial payload for the store.
 * @param value The initial value for the store, or `NONE` if it does not have one yet.
 * @param callback An optional callback that, if set, will be called with the current payload when the `fetch()` method is invoked to fetch the next value.
 */
export abstract class PayloadFetchStore<P, R> extends FetchStore<R> implements Disposable {
	/**
	 * Store keeping the current payload to send to the fetch on send.
	 * - New payloads can be set using `this.payload.value`
	 */
	readonly payload!: Store<P>;

	// Override to save intial payload and callback.
	constructor(payload: P, value: R | typeof NONE, callback?: PayloadFetchCallback<P, R>) {
		super(value, callback && (() => callback(this.payload.value)));
		this.payload = new Store(payload);

		// Observe next values from the payload.
		// These abort inflight calls with the current (incorrect) payload.
		// @todo Unsure if this is leaky.
		_iterate(this);
	}

	// Implement Disposable
	override [Symbol.dispose]() {
		dispose(this.payload);
		super[Symbol.dispose]();
	}
}

/** Observe payload changes. Abort any in-flight request, mark stale, then start a fresh fetch. */
async function _iterate<P, R>(store: PayloadFetchStore<P, R>) {
	for await (const _payload of store.payload.next) {
		store.abort(); // Abort any in-flight request that used the old payload.
		store.invalidate(); // Mark stale so the next read (or the refresh below) fetches fresh data.
		store.refresh(); // Eagerly start a fresh fetch if no other fetch is already in-flight.
	}
}
