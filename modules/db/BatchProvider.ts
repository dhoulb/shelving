import { MutableObject, Data, Result, Results, Observer, Unsubscriber, isAsync, Observable } from "../util/index.js";
import { getNextValue, TidyState } from "../stream/index.js";
import type { Document } from "./Document.js";
import type { Documents } from "./Documents.js";
import type { Provider } from "./Provider.js";
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
export class BatchProvider extends ThroughProvider implements Provider {
	/** List of currently ongoing get requests. */
	protected readonly _gets: MutableObject<Promise<any>> = {}; // eslint-disable-line @typescript-eslint/no-explicit-any

	/** List of currently ongoing subscription streams. */
	protected readonly _subs: MutableObject<Observable<any>> = {}; // eslint-disable-line @typescript-eslint/no-explicit-any

	// Override `getDocument()` to combine multiple requests into one.
	override getDocument<X extends Data>(ref: Document<X>): Result<X> | Promise<Result<X>> {
		const key = ref.toString();
		const get = this._gets[key];
		if (get) return get;
		const result = super.getDocument<X>(ref);
		return isAsync(result) ? (this._gets[key] = this._awaitDocument(ref, result)) : result;
	}

	/** Await a result and delete it from get requests when done. */
	private async _awaitDocument<X extends Data>(ref: Document<X>, asyncResult: Promise<Result<X>>): Promise<Result<X>> {
		const result = await asyncResult;
		const key = ref.toString();
		delete this._gets[key];
		return result;
	}

	// Override `onDocument()` to combine multiple subscriptions into one.
	override onDocument<X extends Data>(ref: Document<X>, observer: Observer<Result<X>>): Unsubscriber {
		const key = ref.toString();
		// TidyState completes itself `STOP_DELAY` milliseconds after its last observer unsubscribes.
		// States also send their most recently received value to any new observers.
		const sub = (this._subs[key] ||= new TidyState<Result<X>>(s => {
			const stop = super.onDocument(ref, s);
			this._gets[key] ||= this._awaitDocument(ref, getNextValue(sub)); // The first value from the new subscription can be reused for any concurrent get requests.
			return () => {
				delete this._subs[key];
				stop();
			};
		}, STOP_DELAY));
		return sub.subscribe(observer);
	}

	// Override `getDocuments()` to combine multiple requests into one.
	override getDocuments<X extends Data>(ref: Documents<X>): Results<X> | Promise<Results<X>> {
		const key = ref.toString();
		const get = this._gets[key];
		if (get) return get;
		const result = super.getDocuments<X>(ref);
		return isAsync(result) ? (this._gets[key] = this._awaitDocuments(ref, result)) : result;
	}

	/** Await a set of results and delete from get requests when done. */
	private async _awaitDocuments<X extends Data>(ref: Documents<X>, asyncResult: Promise<Results<X>>): Promise<Results<X>> {
		const result = await asyncResult;
		const key = ref.toString();
		delete this._gets[key];
		return result;
	}

	// Override `onDocuments()` to combine multiple subscriptions into one.
	override onDocuments<X extends Data>(ref: Documents<X>, observer: Observer<Results<X>>): Unsubscriber {
		const key = ref.toString();
		// TidyState completes itself `STOP_DELAY` milliseconds after its last observer unsubscribes.
		// States also send their most recently received value to any new observers.
		const sub = (this._subs[key] ||= new TidyState<Results<X>>(s => {
			const stop = super.onDocuments(ref, s);
			this._gets[key] ||= this._awaitDocuments(ref, getNextValue(sub)); // The first value from the subscription can be reused for any concurrent get requests.
			return () => {
				delete this._subs[key];
				stop();
			};
		}, STOP_DELAY));
		return sub.subscribe(observer);
	}
}
