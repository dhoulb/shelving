import { Store } from "../../store/Store.js";
import { NONE } from "../../util/constants.js";
import { isDeepEqual } from "../../util/equal.js";
import type { Endpoint } from "../endpoint/Endpoint.js";
import type { APIProvider } from "../provider/APIProvider.js";

const _CANCELLED = Symbol("EndpointStore/CANCELLED");
const _TIMEOUT = Symbol("EndpointStore/TIMEOUT");

/**
 * Store object that loads a result from an API endpoint and manages its state.
 */
export class EndpointStore<P, R> extends Store<R> implements Disposable {
	readonly provider: APIProvider;
	readonly endpoint: Endpoint<P, R>;

	private _payload!: P;

	/**
	 * The current payload set for this endpoint.
	 * - Value will only change if the new payload is not deeply equal to the current one.
	 * - If a new payload is set, it will abort any current in-flight request
	 */
	get payload(): P {
		return this._payload;
	}
	set payload(next: P) {
		const current = this._payload;

		// Did the payload actually change?
		if (!isDeepEqual(current, next)) {
			this._payload = next;
			this.abort(); // Abort any in-flight requst now (as it would've been sent with the previous payload).
			this.fetch();
		}
	}

	// Override to possibly trigger a fetch when `this.loading` is read.
	// This is because when we check `store.loading` in a component we are signalling intent that we wish to use that value.
	override get loading(): boolean {
		const loading = super.loading;
		if (loading) this.fetch();
		return loading;
	}

	// Override to possibly trigger a fetch when `this.value` is first read.
	// This is because when we check `store.loading` in a component we are signalling intent that we wish to use that value.
	override get value(): R {
		if (super.loading) this.fetch();
		return super.value;
	}
	override set value(value: R | typeof NONE) {
		super.value = value;
	}

	constructor(endpoint: Endpoint<P, R>, payload: P, provider: APIProvider) {
		super(NONE);
		this.endpoint = endpoint;
		this.provider = provider;
		this.payload = payload;
	}

	/** Store the inflight fetch request. */
	private _inflight: AbortableFetch<void> | undefined = undefined;

	/**
	 * Invalidate this endpoint, so that calls to `this.value` trigger a new fetch immediately.
	 */
	public invalidate(): void {
		this.abort();
		// @todo Implement this by setting the _age_ to `undefined` instead, so that the current value continues to exist but is so old that it triggers a refetch.
		// That means we need to have an age system built into this somehow, we can't just implement it in `useAPI()`
		// Don't know if I like that.....
		this.value = NONE;
	}

	/**
	 * Fetch the result for this endpoint now.
	 * - Triggered automatically when someone reads `value` or `loading`
	 */
	public fetch(): Promise<void> {
		// Re-use existing fetch if it exists.
		if (this._inflight) return this._inflight.promise;

		// Create a new fetch.
		const abort = new AbortController();
		const promise = this._fetch(abort);
		this._inflight = { abort, promise };
		return promise;
	}

	/** Fetch the result if the current value is older than `maxAge` milliseconds. */
	public refreshStale(maxAge: number): void {
		if (this.age > maxAge) void this.fetch();
	}

	/** Abort any in-flight request now. */
	private abort() {
		if (this._inflight) {
			const { abort } = this._inflight;
			this._inflight = undefined;
			abort.abort(_CANCELLED);
		}
	}

	/** Fetch the result from the API endpoint now. */
	private async _fetch(abort: AbortController): Promise<void> {
		try {
			const value = await this.provider.fetch(this.endpoint, this._payload, { signal: abort.signal });
			this.reason = undefined;
			this.value = value;
		} catch (thrown) {
			console.error(thrown);
			if (thrown === _CANCELLED)
				return; // Cancelled on purpose.
			else if (thrown === _TIMEOUT)
				this.reason = "Timed out"; // Request timed out.
			else this.reason = thrown;
		} finally {
			this._inflight = undefined;
		}
	}

	// Implement Disposable.
	[Symbol.dispose]() {
		this.abort();
	}
}

/** Any endpoint store. */
// biome-ignore lint/suspicious/noExplicitAny: Intentional.
export type AnyEndpointStore = EndpointStore<any, any>;

/** A fetch to an endpoint that can be aborted. */
type AbortableFetch<T> = {
	abort: AbortController;
	promise: Promise<T>;
};
