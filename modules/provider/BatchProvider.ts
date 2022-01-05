import { MutableObject, Result, Observer, Unsubscriber, isAsync, Observable, Entries, getMap, Results, awaitNext, Data, ResultsObserver } from "../util/index.js";
import { LazyState } from "../stream/index.js";
import type { DataDocument, DataQuery } from "../db/index.js";
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
	override get<T extends Data>(ref: DataDocument<T>): Result<T> | Promise<Result<T>> {
		const key = ref.toString();
		const get = this._gets[key];
		if (get) return get;
		const result = super.get(ref);
		return isAsync(result) ? (this._gets[key] = this._awaitDocument(ref, result)) : result;
	}

	/** Await a result and delete it from get requests when done. */
	private async _awaitDocument<T extends Data>(ref: DataDocument<T>, asyncResult: PromiseLike<Result<T>>): Promise<Result<T>> {
		const result = await asyncResult;
		const key = ref.toString();
		delete this._gets[key];
		return result;
	}

	// Override to combine multiple subscriptions into one.
	override subscribe<T extends Data>(ref: DataDocument<T>, observer: Observer<Result<T>>): Unsubscriber {
		const key = ref.toString();
		// TidyState completes itself `STOP_DELAY` milliseconds after its last observer unsubscribes.
		// States also send their most recently received value to any new observers.
		const sub = (this._subs[key] ||= new LazyState<Result<T>>(STOP_DELAY).from(s => {
			const stop = super.subscribe(ref, s);
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
	override getQuery<T extends Data>(ref: DataQuery<T>): Entries<T> | Promise<Entries<T>> {
		const key = ref.toString();
		const get = this._gets[key];
		if (get) return get;
		const result = super.getQuery(ref);
		return isAsync(result) ? (this._gets[key] = this._awaitDocuments(ref, result)) : result;
	}

	/** Await a set of results and delete from get requests when done. */
	private async _awaitDocuments<T extends Data>(ref: DataQuery<T>, asyncResults: PromiseLike<Entries<T>>): Promise<Results<T>> {
		// Convert the iterable to a map because it might be read multiple times.
		const results = getMap(await asyncResults);
		const key = ref.toString();
		delete this._gets[key];
		return results;
	}

	// Override to combine multiple subscriptions into one.
	override subscribeQuery<T extends Data>(ref: DataQuery<T>, observer: Observer<Results<T>>): Unsubscriber {
		const key = ref.toString();
		// TidyState completes itself `STOP_DELAY` milliseconds after its last observer unsubscribes.
		// States also send their most recently received value to any new observers.
		const sub = (this._subs[key] ||= new LazyState<Results<T>>(STOP_DELAY).from(o => {
			// Convert the iterable to a map because it might be read multiple times.
			const stop = super.subscribeQuery(ref, new ResultsObserver(o));
			// The first value from the subscription can be reused for any concurrent get requests.
			this._gets[key] ||= this._awaitDocuments(ref, awaitNext(sub));
			return () => {
				delete this._subs[key];
				stop();
			};
		}));
		return sub.subscribe(observer);
	}
}
