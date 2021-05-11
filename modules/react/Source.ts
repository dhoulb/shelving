import type { Subscriptor, Unsubscriber, AsyncFetcher } from "../function";
import { LOADING } from "../constants";
import { State } from "../state";
import { Observer, Subscribable } from "../observe";

/** Default max age for data. */
const MAX_AGE_MS = 60000;

/** How long to wait to stop unused subscriptions. */
const UNSUBSCRIBE_MS = 60000;

type SourceOptions<T> = {
	readonly initial?: T | Promise<T>;
	readonly fetch?: AsyncFetcher<T> | { get: () => Promise<T> };
	readonly subscribe?: Subscriptor<T> | Subscribable<T>;
};

/**
 * Source is a type of State that can fetch or subscribe to a remote source.
 * - A single `Source` instance can be either fetched once or subscribed to (for a live stream of data) (or alternate between either mode).
 * - Use `Source.get(key)` to get a source, and start a fetch or subscribe process with `.fetchFrom()` or `.subscribeTo()`
 * - The source won't fetch twice if it has recently refreshed (or has begun to fetch or subscribe).
 * - The source won't subscribe again if it's already subscribed (or has begun to).
 */
export class Source<T> extends State<T> {
	private readonly _fetch?: AsyncFetcher<T> | { get: () => Promise<T> };
	private readonly _subscribe?: Subscriptor<T> | Subscribable<T>;
	private _unsubscribe?: Unsubscriber; // Function to call to stop the active subscription.

	// Private to encourage `Source.get()`
	constructor(options: SourceOptions<T>) {
		super("initial" in options ? (options.initial as T | Promise<T>) : LOADING);
		this._subscribe = options.subscribe;
		this._fetch = options.fetch;
	}

	/**
	 * Queue a fetch using this source's defined `Fetcher`, if the current data is older than `maxAge`
	 *
	 * @param maxAge Skip the fetch if we already have a cached result that's younger than this (in milliseconds).
	 */
	queueFetch(maxAge = MAX_AGE_MS): void {
		// Must be a source with a defined fetcher.
		if (!this._fetch) throw new Error("Source is not fetchable");

		// No need to fetch if:
		// 1. This source is closed.
		// 2. A value is pending.
		// 3. A fetch timeout is already queued.
		// 3. This source is already subscribed.
		// 4. We have a fetched result and it's younger than `maxAge`
		if (this.closed || this.pending || this._queuedFetch || this._unsubscribe || this.age < maxAge) return;

		// Queue a callback to fetch the next value.
		this._queuedFetch = setTimeout(() => this.fetch());
	}
	private _queuedFetch?: NodeJS.Timeout;

	/**
	 * Fetch immediately using this source's defined `Fetcher`
	 */
	fetch(): void {
		// Must be a source with a defined fetcher.
		if (!this._fetch) throw new Error("Source is not fetchable");

		// Clear any queued fetch.
		if (this._queuedFetch) this._queuedFetch = void clearTimeout(this._queuedFetch);

		// No need to subscribe if:
		// 1. This source is closed.
		// 2. A value is pending.
		// 3. This source is already subscribed.
		if (this.closed || this.pending || this._unsubscribe) return;

		try {
			this.next(typeof this._fetch === "function" ? this._fetch() : this._fetch.get());
		} catch (thrown) {
			this.error(thrown);
		}
	}

	/**
	 * Start a subscription to this source's defined `Subscriptor`
	 */
	start(): void {
		// Must be a source with a defined subscriptor.
		if (!this._subscribe) throw new Error("Source is not subscribable");

		// No need to subscribe if:
		// 1. This source is closed.
		// 2. A subscriber is already queued.
		// 3. The source is already subscribed.
		if (this.closed || this._unsubscribe) return;

		// Clear any queued fetch (subscribing overrides fetching).
		if (this._queuedFetch) this._queuedFetch = void clearTimeout(this._queuedFetch);

		try {
			this._unsubscribe = typeof this._subscribe === "function" ? this._subscribe(this) : this._subscribe.subscribe(this);
			this._scheduleUnsubscribe();
		} catch (thrown) {
			this.error(thrown);
		}
	}

	/** Clean up any unnecessary subscriptions if we have no subscribers. */
	private _scheduleUnsubscribe() {
		setTimeout(() => this._unsubscribe && !this.subscribers && (this._unsubscribe = void this._unsubscribe()), UNSUBSCRIBE_MS);
	}

	// Override `off()` to trigger cleanup if we remove the last subscription.
	off(subscriber: Observer<T>): void {
		super.off(subscriber);
		if (!this._unsubscribe && !this.subscribers) this._scheduleUnsubscribe();
	}
}
