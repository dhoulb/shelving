import type { MutableObject } from "../util/object.js";
import type { DocumentReference, QueryReference } from "../db/Reference.js";
import type { Data, Entities, OptionalEntity } from "../util/data.js";
import type { PartialObserver } from "../observe/Observer.js";
import { isAsync } from "../util/async.js";
import { DelayedSelfClosingState } from "../state/SelfClosingState.js";
import { Observable, Unsubscribe } from "../observe/Observable.js";
import { awaitNext, connected } from "../observe/util.js";
import { ThroughProvider } from "./ThroughProvider.js";

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
export class BatchProvider extends ThroughProvider {
	/** List of currently ongoing get requests. */
	protected readonly _gets: MutableObject<Promise<any>> = {}; // eslint-disable-line @typescript-eslint/no-explicit-any

	/** List of currently ongoing subscription streams. */
	protected readonly _subs: MutableObject<Observable<any>> = {}; // eslint-disable-line @typescript-eslint/no-explicit-any

	// Override to combine multiple requests into one.
	override getDocument<T extends Data>(ref: DocumentReference<T>): OptionalEntity<T> | Promise<OptionalEntity<T>> {
		const key = ref.toString();
		const get = this._gets[key];
		if (get) return get;
		const result = super.getDocument(ref);
		return isAsync(result) ? (this._gets[key] = this._awaitDocument(ref, result)) : result;
	}

	/** Await a result and delete it from get requests when done. */
	private async _awaitDocument<T extends Data>(ref: DocumentReference<T>, asyncEntity: PromiseLike<OptionalEntity<T>>): Promise<OptionalEntity<T>> {
		const result = await asyncEntity;
		const key = ref.toString();
		delete this._gets[key];
		return result;
	}

	// Override to combine multiple subscriptions into one.
	override subscribeDocument<T extends Data>(ref: DocumentReference<T>, observer: PartialObserver<OptionalEntity<T>>): Unsubscribe {
		const key = ref.toString();
		// Subscribe a new `DelayedSelfClosingState` to the source.
		// Self-closing state closes itself when it's not being used for `STOP_DELAY` milliseconds, which ends the source subscription too.
		return (this._subs[key] ||= connected<OptionalEntity<T>>(s => {
			const stop = super.subscribeDocument(ref, s);
			if (s instanceof DelayedSelfClosingState) this._gets[key] ||= this._awaitDocument(ref, awaitNext(s)); // The first value from the new subscription can also power any concurrent get requests (which saves that separate request).
			return () => {
				delete this._subs[key]; // Delete this subscription from subs to allow a new subscription to be made in future.
				stop();
			};
		}, new DelayedSelfClosingState(STOP_DELAY))).subscribe(observer);
	}

	// Override to combine multiple requests into one.
	override getQuery<T extends Data>(ref: QueryReference<T>): Entities<T> | Promise<Entities<T>> {
		const key = ref.toString();
		const get = this._gets[key];
		if (get) return get;
		const result = super.getQuery(ref);
		return isAsync(result) ? (this._gets[key] = this._awaitEntities(ref, result)) : result;
	}

	/** Await a set of results and delete from get requests when done. */
	private async _awaitEntities<T extends Data>(ref: QueryReference<T>, asyncEntities: PromiseLike<Entities<T>>): Promise<Entities<T>> {
		const results = await asyncEntities;
		const key = ref.toString();
		delete this._gets[key];
		return results;
	}

	// Override to combine multiple subscriptions into one.
	override subscribeQuery<T extends Data>(ref: QueryReference<T>, observer: PartialObserver<Entities<T>>): Unsubscribe {
		const key = ref.toString();
		// Subscribe a new `DelayedSelfClosingState` to the source.
		// Self-closing state closes itself when it's not being used for `STOP_DELAY` milliseconds, which ends the source subscription too.
		return (this._subs[key] ||= connected<Entities<T>>(s => {
			const stop = super.subscribeQuery(ref, s);
			if (s instanceof DelayedSelfClosingState) this._gets[key] ||= this._awaitEntities(ref, awaitNext(s)); // The first value from the subscription can also power any concurrent get requests (which saves that separate request).
			return () => {
				delete this._subs[key]; // Delete this subscription from subs to allow a new subscription to be made in future.
				stop();
			};
		}, new DelayedSelfClosingState(STOP_DELAY))).subscribe(observer);
	}
}
