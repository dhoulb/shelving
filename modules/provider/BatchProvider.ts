import type { Datas, Entities, Key, OptionalEntity } from "../util/data.js";
import type { PartialObserver } from "../observe/Observer.js";
import type { Observable, Unsubscribe } from "../observe/Observable.js";
import { DelayedSelfClosingState } from "../state/SelfClosingState.js";
import { awaitNext, connected } from "../observe/util.js";
import { setMapItem } from "../util/map.js";
import { AsyncThroughProvider } from "./ThroughProvider.js";
import type { ProviderDocument, ProviderQuery } from "./Provider.js";

/** How long to wait after all subscriptions have ended to close the source subscription. */
const STOP_DELAY = 2000;

/**
 * Provider that batches multiple database reads from a source provider together, for efficiency.
 *
 * Allows you to create a large number of requests for and subscriptions to the same data with very little overhead,
 * - Multiple concurrent get requests (for the same reference) are combined into one request.
 * - Multiple concurrent subscriptions (to the same reference) are combined into one subscription.
 *
 * Basically makes any provider under it more efficient.
 */
export class BatchProvider<T extends Datas> extends AsyncThroughProvider<T> {
	private readonly _gets: Map<string, Promise<any>> = new Map(); // eslint-disable-line @typescript-eslint/no-explicit-any
	private readonly _subs: Map<string, Observable<any>> = new Map(); // eslint-disable-line @typescript-eslint/no-explicit-any

	// Override to combine multiple requests into one.
	override getDocument<K extends Key<T>>(ref: ProviderDocument<T, K>): Promise<OptionalEntity<T[K]>> {
		const key = ref.toString();
		return this._gets.get(key) || setMapItem(this._gets, key, this._awaitDocument(ref, super.getDocument(ref)));
	}

	/** Await a result and delete it from get requests when done. */
	private async _awaitDocument<K extends Key<T>>(ref: ProviderDocument<T, K>, asyncEntity: PromiseLike<OptionalEntity<T[K]>>): Promise<OptionalEntity<T[K]>> {
		const result = await asyncEntity;
		const key = ref.toString();
		this._gets.delete(key);
		return result;
	}

	// Override to combine multiple subscriptions into one.
	override subscribeDocument<K extends Key<T>>(ref: ProviderDocument<T, K>, observer: PartialObserver<OptionalEntity<T[K]>>): Unsubscribe {
		const key = ref.toString();
		// Subscribe a new `DelayedSelfClosingState` to the source.
		// Self-closing state closes itself when it's not being used for `STOP_DELAY` milliseconds, which ends the source subscription too.
		return (
			this._subs.get(key) ||
			setMapItem(
				this._subs,
				key,
				connected<OptionalEntity<T[K]>>(s => {
					const stop = super.subscribeDocument(ref, s);
					if (s instanceof DelayedSelfClosingState && !this._gets.has(key)) this._gets.set(key, this._awaitDocument(ref, awaitNext(s))); // The first value from the new subscription can also power any concurrent get requests (which saves that separate request).
					return () => {
						this._subs.delete(key); // Delete this subscription from subs to allow a new subscription to be made in future.
						stop();
					};
				}, new DelayedSelfClosingState(STOP_DELAY)),
			)
		).subscribe(observer);
	}

	// Override to combine multiple requests into one.
	override getQuery<K extends Key<T>>(ref: ProviderQuery<T, K>): Promise<Entities<T[K]>> {
		const key = ref.toString();
		return this._gets.get(key) || setMapItem(this._gets, key, this._awaitEntities<K>(ref, super.getQuery(ref)));
	}

	/** Await a set of results and delete from get requests when done. */
	private async _awaitEntities<K extends Key<T>>(ref: ProviderQuery<T, K>, asyncEntities: PromiseLike<Entities<T[K]>>): Promise<Entities<T[K]>> {
		const results = await asyncEntities;
		const key = ref.toString();
		this._gets.delete(key);
		return results;
	}

	// Override to combine multiple subscriptions into one.
	override subscribeQuery<K extends Key<T>>(ref: ProviderQuery<T, K>, observer: PartialObserver<Entities<T[K]>>): Unsubscribe {
		const key = ref.toString();
		// Subscribe a new `DelayedSelfClosingState` to the source.
		// Self-closing state closes itself when it's not being used for `STOP_DELAY` milliseconds, which ends the source subscription too.
		return (
			this._subs.get(key) ||
			setMapItem(
				this._subs,
				key,
				connected<Entities<T[K]>>(s => {
					const stop = super.subscribeQuery(ref, s);
					if (s instanceof DelayedSelfClosingState && !this._gets.has(key)) this._gets.set(key, this._awaitEntities(ref, awaitNext(s))); // The first value from the subscription can also power any concurrent get requests (which saves that separate request).
					return () => {
						this._subs.delete(key); // Delete this subscription from subs to allow a new subscription to be made in future.
						stop();
					};
				}, new DelayedSelfClosingState(STOP_DELAY)),
			)
		).subscribe(observer);
	}
}
