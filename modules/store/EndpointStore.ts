import type { Endpoint } from "../endpoint/Endpoint.js";
import { MINUTE, NONE } from "../util/constants.js";
import { isDeepEqual } from "../util/equal.js";
import { Store } from "./Store.js";

/**
 * Store object that loads a result from an API endpoint and manages its state.
 *
 * @todo Needs support for `EndpointOptions` to set headers etc.
 */
export class EndpointStore<P, R> extends Store<R> {
	static CANCELLED = Symbol("CANCELLED");

	readonly endpoint: Endpoint<P, R>;

	private _payload!: P;
	private _abort: AbortController | undefined = undefined;

	get payload(): P {
		return this._payload;
	}
	set payload(next: P) {
		const current = this._payload;

		// Did the payload actually change?
		if (!isDeepEqual(current, next)) {
			this._payload = next;

			// If there's already a fetch in progress, cancel it.
			if (this._abort) {
				this._abort.abort(EndpointStore.CANCELLED);
				this._abort = undefined;
			}

			// Trigger a fetch.
			this._call();
		}
	}

	/** Maximum age data can be before a fetch is triggered (defaults to 5 minutes). */
	maxAge = 5 * MINUTE;

	// Override to possibly trigger a fetch when value is read.
	override get value(): R {
		// Queue `this.call()` if...
		// 1. Value is still loading.
		// 2. Value is stale (older than maxAge).
		if (this.loading || this.age > this.maxAge) if (!this.reason) this._call();

		return super.value;
	}
	override set value(value: R | typeof NONE) {
		super.value = value;
	}

	constructor(endpoint: Endpoint<P, R>, payload: P) {
		super(NONE);
		this.endpoint = endpoint;
		this.payload = payload;
	}

	public refetch(): Promise<void> {
		return this._call();
	}

	/** Call the API now to fetch the data. */
	private async _call(): Promise<void> {
		if (this._abort) return; // Already fetching.

		this.reason = undefined; // Optimistically clear any error.

		try {
			this._abort = new AbortController();
			const value = await this.endpoint.fetch(this._payload, { signal: this._abort.signal });
			this.value = value;
		} catch (thrown) {
			console.error(thrown);
			if (thrown === EndpointStore.CANCELLED) return; // Cancelled on purpose.
			this.reason = thrown;
		} finally {
			this._abort = undefined;
		}
	}
}
