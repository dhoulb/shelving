import type { MutableObject } from "../util/object.js";
import type { DocumentReference, QueryReference } from "../db/Reference.js";
import type { Entity, Data, Result } from "../util/data.js";
import { getArray, ImmutableArray } from "../util/array.js";
import { isAsync } from "../util/async.js";
import { DelayedSelfClosingState } from "../state/SelfClosingState.js";
import { TransformObserver } from "../observe/TransformObserver.js";
import { Observable, Unsubscribe } from "../observe/Observable.js";
import { Observer } from "../observe/Observer.js";
import { awaitNext } from "../observe/util.js";
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
	override getDocument<T extends Data>(ref: DocumentReference<T>): Result<Entity<T>> | Promise<Result<Entity<T>>> {
		const key = ref.toString();
		const get = this._gets[key];
		if (get) return get;
		const result = super.getDocument(ref);
		return isAsync(result) ? (this._gets[key] = this._awaitDocument(ref, result)) : result;
	}

	/** Await a result and delete it from get requests when done. */
	private async _awaitDocument<T extends Data>(ref: DocumentReference<T>, asyncResult: PromiseLike<Result<Entity<T>>>): Promise<Result<Entity<T>>> {
		const result = await asyncResult;
		const key = ref.toString();
		delete this._gets[key];
		return result;
	}

	// Override to combine multiple subscriptions into one.
	override subscribeDocument<T extends Data>(ref: DocumentReference<T>, observer: Observer<Result<Entity<T>>>): Unsubscribe {
		const key = ref.toString();
		// TidyState completes itself `STOP_DELAY` milliseconds after its last observer unsubscribes.
		// States also send their most recently received value to any new observers.
		const sub = (this._subs[key] ||= new DelayedSelfClosingState<Result<Entity<T>>>(STOP_DELAY).connect(s => {
			const stop = super.subscribeDocument(ref, s);
			// The first value from the new subscription can be reused for any concurrent get requests.
			this._gets[key] ||= this._awaitDocument(ref, awaitNext(sub));
			return () => {
				delete this._subs[key];
				stop();
			};
		}));
		return sub.subscribe(observer);
	}

	// Override to combine multiple requests into one.
	override getQuery<T extends Data>(ref: QueryReference<T>): Iterable<Entity<T>> | Promise<Iterable<Entity<T>>> {
		const key = ref.toString();
		const get = this._gets[key];
		if (get) return get;
		const result = super.getQuery(ref);
		return isAsync(result) ? (this._gets[key] = this._awaitResults(ref, result)) : result;
	}

	/** Await a set of results and delete from get requests when done. */
	private async _awaitResults<T extends Data>(ref: QueryReference<T>, asyncResults: PromiseLike<Iterable<Entity<T>>>): Promise<ImmutableArray<Entity<T>>> {
		// Convert the iterable to a map because it might be read multiple times.
		const results = getArray(await asyncResults);
		const key = ref.toString();
		delete this._gets[key];
		return results;
	}

	// Override to combine multiple subscriptions into one.
	override subscribeQuery<T extends Data>(ref: QueryReference<T>, observer: Observer<ImmutableArray<Entity<T>>>): Unsubscribe {
		const key = ref.toString();
		// TidyState completes itself `STOP_DELAY` milliseconds after its last observer unsubscribes.
		// States also send their most recently received value to any new observers.
		const sub = (this._subs[key] ||= new DelayedSelfClosingState<ImmutableArray<Entity<T>>>(STOP_DELAY).connect(o => {
			// Convert the iterable to an array because it might be read multiple times.
			const stop = super.subscribeQuery(ref, new TransformObserver(getArray, o));
			// The first value from the subscription can be reused for any concurrent get requests.
			this._gets[key] ||= this._awaitResults(ref, awaitNext(sub));
			return () => {
				delete this._subs[key];
				stop();
			};
		}));
		return sub.subscribe(observer);
	}
}
