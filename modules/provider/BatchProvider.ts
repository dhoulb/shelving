import { MutableObject, Result, Observer, Unsubscriber, isAsync, Observable, Datas, Key, Results, toMap, DeriveObserver, ResultsMap } from "../util/index.js";
import { getNextValue, LazyState, startState } from "../stream/index.js";
import type { DatabaseDocument, DatabaseQuery } from "../db/index.js";
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
export class BatchProvider<D extends Datas> extends ThroughProvider<D> {
	/** List of currently ongoing get requests. */
	protected readonly _gets: MutableObject<Promise<any>> = {}; // eslint-disable-line @typescript-eslint/no-explicit-any

	/** List of currently ongoing subscription streams. */
	protected readonly _subs: MutableObject<Observable<any>> = {}; // eslint-disable-line @typescript-eslint/no-explicit-any

	// Override to combine multiple requests into one.
	override get<C extends Key<D>>(ref: DatabaseDocument<D, C>): Result<D[C]> | Promise<Result<D[C]>> {
		const key = ref.toString();
		const get = this._gets[key];
		if (get) return get;
		const result = super.get(ref);
		return isAsync(result) ? (this._gets[key] = this._awaitDocument(ref, result)) : result;
	}

	/** Await a result and delete it from get requests when done. */
	private async _awaitDocument<C extends Key<D>>(ref: DatabaseDocument<D, C>, asyncResult: Promise<Result<D[C]>>): Promise<Result<D[C]>> {
		const result = await asyncResult;
		const key = ref.toString();
		delete this._gets[key];
		return result;
	}

	// Override to combine multiple subscriptions into one.
	override subscribe<C extends Key<D>>(ref: DatabaseDocument<D, C>, observer: Observer<Result<D[C]>>): Unsubscriber {
		const key = ref.toString();
		// TidyState completes itself `STOP_DELAY` milliseconds after its last observer unsubscribes.
		// States also send their most recently received value to any new observers.
		const sub = (this._subs[key] ||= startState(s => {
			const stop = super.subscribe(ref, s);
			// The first value from the new subscription can be reused for any concurrent get requests.
			this._gets[key] ||= this._awaitDocument(ref, getNextValue(sub));
			return () => {
				delete this._subs[key];
				stop();
			};
		}, new LazyState<Result<D[C]>>(STOP_DELAY)));
		return sub.subscribe(observer);
	}

	// Override to combine multiple requests into one.
	override getQuery<C extends Key<D>>(ref: DatabaseQuery<D, C>): Results<D[C]> | Promise<Results<D[C]>> {
		const key = ref.toString();
		const get = this._gets[key];
		if (get) return get;
		const result = super.getQuery(ref);
		return isAsync(result) ? (this._gets[key] = this._awaitDocuments(ref, result)) : result;
	}

	/** Await a set of results and delete from get requests when done. */
	private async _awaitDocuments<C extends Key<D>>(ref: DatabaseQuery<D, C>, asyncResults: Promise<Results<D[C]>>): Promise<ResultsMap<D[C]>> {
		// Convert the iterable to a map because it might be read multiple times.
		const results = toMap(await asyncResults);
		const key = ref.toString();
		delete this._gets[key];
		return results;
	}

	// Override to combine multiple subscriptions into one.
	override subscribeQuery<C extends Key<D>>(ref: DatabaseQuery<D, C>, observer: Observer<ResultsMap<D[C]>>): Unsubscriber {
		const key = ref.toString();
		// TidyState completes itself `STOP_DELAY` milliseconds after its last observer unsubscribes.
		// States also send their most recently received value to any new observers.
		const sub = (this._subs[key] ||= startState(o => {
			// Convert the iterable to a map because it might be read multiple times.
			const stop = super.subscribeQuery(ref, new DeriveObserver(toMap, o));
			// The first value from the subscription can be reused for any concurrent get requests.
			this._gets[key] ||= this._awaitDocuments(ref, getNextValue(sub));
			return () => {
				delete this._subs[key];
				stop();
			};
		}, new LazyState<ResultsMap<D[C]>>(STOP_DELAY)));
		return sub.subscribe(observer);
	}
}
