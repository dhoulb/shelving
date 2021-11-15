import { MutableObject, Data, Result, Results, Observer, Unsubscriber, isAsync, Observable, LOADING } from "../util/index.js";
import { getNextValue, LazyState } from "../stream/index.js";
import type { ModelDocument, ModelQuery } from "../db/index.js";
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

	// Override `getDocument()` to combine multiple requests into one.
	override get<X extends Data>(ref: ModelDocument<X>): Result<X> | Promise<Result<X>> {
		const key = ref.toString();
		const get = this._gets[key];
		if (get) return get;
		const result = super.get<X>(ref);
		return isAsync(result) ? (this._gets[key] = this._awaitDocument(ref, result)) : result;
	}

	/** Await a result and delete it from get requests when done. */
	private async _awaitDocument<X extends Data>(ref: ModelDocument<X>, asyncResult: Promise<Result<X>>): Promise<Result<X>> {
		const result = await asyncResult;
		const key = ref.toString();
		delete this._gets[key];
		return result;
	}

	// Override `onDocument()` to combine multiple subscriptions into one.
	override subscribe<X extends Data>(ref: ModelDocument<X>, observer: Observer<Result<X>>): Unsubscriber {
		const key = ref.toString();
		// TidyState completes itself `STOP_DELAY` milliseconds after its last observer unsubscribes.
		// States also send their most recently received value to any new observers.
		const sub = (this._subs[key] ||= LazyState.start(s => {
			const stop = super.subscribe(ref, s);
			this._gets[key] ||= this._awaitDocument(ref, getNextValue(sub)); // The first value from the new subscription can be reused for any concurrent get requests.
			return () => {
				delete this._subs[key];
				stop();
			};
		}, new LazyState<Result<X>>(LOADING, STOP_DELAY)));
		return sub.subscribe(observer);
	}

	// Override `getDocuments()` to combine multiple requests into one.
	override getQuery<X extends Data>(ref: ModelQuery<X>): Results<X> | Promise<Results<X>> {
		const key = ref.toString();
		const get = this._gets[key];
		if (get) return get;
		const result = super.getQuery<X>(ref);
		return isAsync(result) ? (this._gets[key] = this._awaitDocuments(ref, result)) : result;
	}

	/** Await a set of results and delete from get requests when done. */
	private async _awaitDocuments<X extends Data>(ref: ModelQuery<X>, asyncResult: Promise<Results<X>>): Promise<Results<X>> {
		const result = await asyncResult;
		const key = ref.toString();
		delete this._gets[key];
		return result;
	}

	// Override `onDocuments()` to combine multiple subscriptions into one.
	override subscribeQuery<X extends Data>(ref: ModelQuery<X>, observer: Observer<Results<X>>): Unsubscriber {
		const key = ref.toString();
		// TidyState completes itself `STOP_DELAY` milliseconds after its last observer unsubscribes.
		// States also send their most recently received value to any new observers.
		const sub = (this._subs[key] ||= LazyState.start(s => {
			const stop = super.subscribeQuery(ref, s);
			this._gets[key] ||= this._awaitDocuments(ref, getNextValue(sub)); // The first value from the subscription can be reused for any concurrent get requests.
			return () => {
				delete this._subs[key];
				stop();
			};
		}, new LazyState<Results<X>>(LOADING, STOP_DELAY)));
		return sub.subscribe(observer);
	}
}
