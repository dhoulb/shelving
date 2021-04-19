import type { Arguments, Subscriptor, Unsubscriber, AsyncFetcher } from "../function";
import { LOADING } from "../constants";
import { State } from "../state";
import { Observer } from "../observe";

/** Default max age for data. */
const MAX_AGE_MS = 60000;

/** How long to wait to stop unused subscriptions. */
const UNSUBSCRIBE_MS = 60000;

/**
 * Source is a type of State that can fetch or subscribe to a remote source.
 * - A single `Source` instance can be either fetched once or subscribed to (for a live stream of data) (or alternate between either mode).
 * - Use `Source.get(key)` to get a source, and start a fetch or subscribe process with `.fetchFrom()` or `.subscribeTo()`
 * - The source won't fetch twice if it has recently refreshed (or has begun to fetch or subscribe).
 * - The source won't subscribe again if it's already subscribed (or has begun to).
 */
export class Source<T> extends State<T> {
	private _unsubscribe?: Unsubscriber; // Function to call to stop the active subscription.

	// Private to encourage `Source.get()`
	constructor(initial: T | Promise<T> | typeof LOADING) {
		super(initial);
	}

	/**
	 * Fetch this source's data from a data source.
	 * @param fetcher The fetcher function to call to fetch the data.
	 * @param ...args Any arguments the fetcher needs.
	 * @param maxAge Skip the fetch if we already have a cached result that's younger than this (in milliseconds).
	 */
	fetchFrom<A extends Arguments>(fetcher: AsyncFetcher<T, A>, args: A, maxAge = MAX_AGE_MS): void {
		// No need to subscribe if:
		// 1. This source is closed.
		// 2. A fetcher is already queued.
		// 3. The source is already subscribed.
		// 4. We have a fetched result and it's younger than `maxAge`
		if (this.closed || this.pending || this._unsubscribe || this.age < maxAge) return;

		// Fetch the next value.
		try {
			this.next(fetcher(...args));
		} catch (thrown) {
			this.error(thrown);
		}
	}
	_queuedFetch?: () => void;

	/**
	 * Subcribe this source to a data source.
	 * @param subscriptor The subscriptor function to call to start the subscription.
	 * @param ...args Any additional arguments the subscriptor needs.
	 */
	subscribeTo<A extends Arguments>(subscriptor: Subscriptor<T, A>, args: A): void {
		// No need to subscribe if:
		// 1. This source is closed.
		// 2. A subscriber is already queued.
		// 3. The source is already subscribed.
		if (this.closed || this._unsubscribe) return;

		try {
			this._unsubscribe = subscriptor(this, ...args);
			this._cleanupSubscription();
		} catch (thrown) {
			this.error(thrown);
		}
	}

	/** Clean up any unnecessary subscriptions if we have no subscribers. */
	private _cleanupSubscription() {
		setTimeout(() => this._unsubscribe && !this.subscribers && (this._unsubscribe = void this._unsubscribe()), UNSUBSCRIBE_MS);
	}

	// Override `unsubscribe()` to unsubscribe from the source if we ended the last subscription.
	unsubscribe(subscriber: Observer<T>): void {
		super.unsubscribe(subscriber);
		if (!this._unsubscribe && !this.subscribers) this._cleanupSubscription();
	}
}

/**
 * Cache of named `Source` instances indexed by string key.
 */
export class Sources {
	/** Cache of named `Source` instances indexed by string key. */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	private _cache: { [key: string]: Source<any> } = {};

	/** Get a named source from the source cache. */
	get<X = undefined>(key: string): Source<X | undefined>;
	get<X>(key: string, source: X | Promise<X> | typeof LOADING): Source<X>;
	get(key: string, initial: unknown | Promise<unknown> | typeof LOADING = undefined): Source<unknown> {
		const source = this._cache[key] || new Source<unknown>(initial);

		// If the state has closed, remove it from the cache in a few seconds.
		// This means that on the next render, the fetch or subscription will be retried.
		if (source.closed) setTimeout(() => source === this._cache[key] && delete this._cache[key], 3000);

		return source;
	}
}
