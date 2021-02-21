import type { Dependencies } from "../array";
import { logError } from "../console";
import { LOADING } from "../constants";
import type { Subscriptor, Unsubscriber, AsyncFetcher } from "../function";
import { State } from "../state";
import { Stream } from "../stream";

/** Default max age for data. */
const MAX_AGE_MS = 60000;

/** How long to wait to stop unused subscriptions. */
const UNSUBSCRIBE_MS = 60000;

// How long to wait before removing errored sources.
const ERROR_CLEANUP_MS = 10000;

/**
 * Source is a type of State that can fetch or subscribe to a remote source.
 * - Sources are considered global, and are indexed by unique keys.
 * - Sources can fetch data once (with an expiry time for refreshing)
 * - Sources can subscribe to data to get it fresh in real time.
 */
export class Source<T> extends State<T> {
	/**
	 * Get a named source from the source cache.
	 * @todo This might need garbage collection in future.
	 */
	static get<X>(key: string, initial: X | typeof LOADING = LOADING): Source<X> {
		return cache[key] || new Source<X>(key, initial);
	}

	private _unsubscribe?: Unsubscriber; // Function to call to stop the active subscription.

	/**
	 * Derive a state that consumers who need realtime active data can subscribe to.
	 * - This is separate so we can count the number of live subscribers vs components that just need the fetched data.
	 */
	readonly active: Stream<T> = new Stream(this);

	/** String key that this . */
	readonly key: string;

	// Private; use `Source.get()` instead.
	private constructor(key: string, initial: T | typeof LOADING) {
		super(initial);
		this.key = key;
		cache[key] = this;
	}

	/**
	 * Fetch this source's data from a data source.
	 * @param fetcher The fetcher function to call to fetch the data.
	 * @param deps Any dependencies the fetcher needs.
	 * @param maxAge Skip the fetch if we already have a cached result that's younger than this (in milliseconds).
	 */
	fetchFrom<D extends Dependencies>(fetcher: AsyncFetcher<T, D>, deps: D, maxAge = MAX_AGE_MS): void {
		// No need to subscribe if:
		// 1. This source is closed.
		// 2. A subscriber is already queued.
		// 3. A fetcher is already queued.
		// 4. The source is already subscribed.
		// 5. We have a fetched result and it's younger than `maxAge`
		if (
			this.closed ||
			this._queuedSubscribe ||
			this.fetchFrom ||
			this._unsubscribe ||
			(typeof this.updated === "number" && Date.now() - this.updated < maxAge)
		)
			return;

		// Queue to fetch at the end of the tick.
		// Fetches and subscribes are deferred to the end of the tick so that we don't subscribe and fetch from the same source (which would be wasteful!)
		this._queuedFetch = () => this.next(fetcher(...deps));
		Promise.resolve().then(this._start, logError);
	}
	_queuedFetch?: () => void;

	/** Subcribe this source to a data source. */
	subscribeTo<D extends Dependencies>(subscriptor: Subscriptor<T, D>, deps: D): void {
		// No need to subscribe if:
		// 1. This source is closed.
		// 2. A subscriber is already queued.
		// 3. The source is already subscribed.
		if (this.closed || this._queuedSubscribe || this._unsubscribe) return;

		// Queue to subscribe at the end of the tick.
		// Fetches and subscribes are deferred to the end of the tick so that we don't subscribe and fetch from the same source (which would be wasteful!)
		this._queuedSubscribe = () => subscriptor(this, ...deps);
		Promise.resolve().then(this._start, logError);
	}
	_queuedSubscribe?: () => Unsubscriber;

	// Run at the end of the tick to subscribe/fetch from the source.
	// Fetches and subscribes are deferred to the end of the tick so that we don't subscribe and fetch from the same source (which would be wasteful!)
	private _start = (): void => {
		if (this.closed) return;
		try {
			if (this._queuedSubscribe) {
				// Subscribe beats fetch.
				this._unsubscribe = this._queuedSubscribe();
				this._stop(); // Unsubscribe again soon if no components subscribe.
			} else if (this._queuedFetch) {
				// Fetch if there's no subscription.
				this._queuedFetch();
			}
		} catch (thrown) {
			this.error(thrown);
		}
		this._queuedSubscribe = undefined;
		this._queuedFetch = undefined;
	};

	/** Unsubscribe from the source soon if we have no subscribers. */
	private _stop() {
		if (this._timeout) clearTimeout(this._timeout);
		if (this._unsubscribe && !this.active.subscribers) {
			this._timeout = setTimeout(() => this._unsubscribe && !this.active.subscribers && (this._unsubscribe = void this._unsubscribe()), UNSUBSCRIBE_MS);
		}
	}
	private _timeout?: NodeJS.Timeout;

	// Override error to remove self from cache after we've errored.
	error(reason: Error | unknown): void {
		super.error(reason);
		setTimeout(() => delete cache[this.key], ERROR_CLEANUP_MS);
	}
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const cache: { [fingerprint: string]: Source<any> } = {};

// Initialise a couple of values.
Source.get("undefined", undefined);
Source.get("empty", {});
