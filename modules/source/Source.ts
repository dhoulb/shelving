import type { Dependencies } from "../array";
import type { Subscriptor, Unsubscriber, AsyncFetcher } from "../function";
import { State } from "../state";

/** Default max age for data. */
const MAX_AGE_SECONDS = 60;

/** How long to wait to stop unused subscriptions. */
const UNSUBSCRIBE_SECONDS = 10;

/** Source is a type of State that can fetch or subscribe to a remote source. */
export class Source<T> extends State<T> {
	/** Date we last fetched the data. */
	private _fetched?: number;

	/** Function to call to stop the active subscription. */
	private _unsubscribe?: Unsubscriber;

	/**
	 * Derive a state that consumers who need realtime data can subscribe to.
	 * - This is separate so we can count the number of live subscribers vs components that just need the fetched data.
	 */
	readonly subscription: State<T> = this.derive();

	/** Fetch this source's data from a data source. */
	fetchFrom<D extends Dependencies>(fetcher: T | Promise<T> | AsyncFetcher<T, D>, deps: D, maxAgeSeconds = MAX_AGE_SECONDS): void {
		// No need to fetch if the source is currently subscribed.
		if (this._unsubscribe) return;

		// No need to fetch if result was fetched more recently than maxAgeSeconds
		if (typeof this._fetched !== "number" || Date.now() - this._fetched < maxAgeSeconds * 1000) return;

		// Fetch.
		try {
			const value = fetcher instanceof Function ? fetcher(...deps) : fetcher;
			if (value instanceof Promise) {
				void this._asyncNext(value);
			} else {
				this.next(value);
			}
		} catch (thrown) {
			this.error(thrown);
		}
	}
	private async _asyncNext(value: Promise<T>): Promise<void> {
		try {
			this.next(await value);
		} catch (thrown) {
			this.error(thrown);
		}
	}

	/** Subcribe this source to a data source. */
	subscribeTo<D extends Dependencies>(subscriptor: Subscriptor<T, D>, deps: D): void {
		// No need to fetch if the source is currently subscribed.
		if (this._unsubscribe) return;

		// Subscribe.
		try {
			// Subscibe to the source now.
			this._unsubscribe || subscriptor(this, ...deps);
			// But unsubscribe again soon if no components subscribe.
			this.cleanup();
		} catch (thrown) {
			this.error(thrown);
		}
	}

	// Override `next()` to store the last fetched time.
	next(value: T): void {
		if (this.closed) return;
		this._fetched = Date.now();
		super.next(value);
	}

	/** Unsubscribe from the source soon if we have no subscribers. */
	private cleanup() {
		if (this._timeout) clearTimeout(this._timeout);
		if (this._unsubscribe && !this.subscription.subscribers) {
			this._timeout = setTimeout(
				() => this._unsubscribe && !this.subscription.subscribers && (this._unsubscribe = void this._unsubscribe()),
				UNSUBSCRIBE_SECONDS * 1000,
			);
		}
	}
	private _timeout?: NodeJS.Timeout;
}

/** Create a new `Source` instance. */
export const createSource = <T>(initialValue?: T): Source<T> => new Source<T>(initialValue);
