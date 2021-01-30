/* eslint-disable no-shadow */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect } from "react";
import { Dependencies, AsyncDispatcher, ErrorDispatcher, MutableObject, UnsubscribeDispatcher, LOADING, State, Dispatcher } from "shelving/tools";
import { useState } from "./useState";

/**
 * Function that creates a subscription and returns an unsubscribe function.
 *
 * @param onNext A callback that should be called if the function starts a subscription to the value.
 * @param onError An error callback that should be called if a subscription has an error.
 * @param ...deps The array of dependencies that were provided when `useSubscription()` was called.
 * @returns An unsubscribe callback that stops any started subscriptions.
 */
export type SourceSubscriber<T, D extends Dependencies> = (onNext: AsyncDispatcher<T>, onError: ErrorDispatcher, ...deps: D) => UnsubscribeDispatcher;

/** Function that can fetch a value (possibly asyncronously). */
export type SourceFetcher<T, D extends Dependencies> = T | ((...deps: D) => T | Promise<T>);

/** Default max age for data. */
const MAX_AGE_SECONDS = 60;

/** How long to wait to stop unused subscriptions. */
const UNSUBSCRIBE_SECONDS = 10;

type SourceState<T> = { value: T; error?: unknown };

class Source<T> extends State<SourceState<T>> {
	protected _fetched = Date.now() - 86400000;
	protected _unsubscribe?: UnsubscribeDispatcher;
	protected _subscribed = 0;
	protected _timeout?: NodeJS.Timeout;
	protected _onNext: Dispatcher<T> = (value: T) => {
		this.set({ value });
		this._fetched = Date.now();
	};
	protected _onError: ErrorDispatcher = (error: unknown) => this.merge({ error });

	constructor(value: T | typeof LOADING = LOADING) {
		super(value === LOADING ? LOADING : { value });
	}

	/** Fetch this source's data from its data source. */
	fetch<D extends Dependencies>(fetch: SourceFetcher<T, D>, deps: D, maxAgeSeconds = MAX_AGE_SECONDS) {
		// No need to fetch if the source is currently subscribed.
		if (!this._unsubscribe) {
			// No need to fetch if result was fetched more recently than maxAgeSeconds
			if (Date.now() - this._fetched > maxAgeSeconds * 1000) {
				try {
					const value = fetch instanceof Function ? fetch(...deps) : fetch;
					if (value instanceof Promise) {
						value.then(this._onNext, this._onError);
					} else {
						this._onNext(value);
					}
				} catch (error) {
					this._onError(error);
				}
			}
		}
	}

	/** Subcribe this source to its data source. */
	subscribe<D extends Dependencies>(subscribe: SourceSubscriber<T, D>, deps: D) {
		// No need to fetch if the source is currently subscribed.
		if (!this._unsubscribe) {
			try {
				// Subscibe to the source now.
				this._unsubscribe || subscribe(this._onNext, this._onError, ...deps);
				// But unsubscribe again soon if no components subscribe.
				this.unsubscribeSoon();
			} catch (error) {
				this._onError(error);
			}
		}
	}

	/** Indicate that a component has subscribed to this source by incrementing the subscriber count. */
	incrementSubscribers() {
		this._subscribed++;
	}
	decrementSubscribers() {
		this._subscribed--;
		this.unsubscribeSoon();
	}

	/** Unsubscribe from the source soon if we have no subscribing components. */
	unsubscribeSoon() {
		if (this._timeout) clearTimeout(this._timeout);
		if (this._unsubscribe && !this._subscribed) {
			this._timeout = setTimeout(
				() => this._unsubscribe && !this._subscribed && (this._unsubscribe = void this._unsubscribe()),
				UNSUBSCRIBE_SECONDS * 1000,
			);
		}
	}
}

/** Global registry of sources indexed by key. */
const sources: MutableObject<Source<any>> = {
	// Undefined source always has a value of `undefined` empty object.
	"undefined": new Source(undefined),
	// Empty object source always has a value of `{}` empty object.
	"{}": new Source({}),
};

/** Get a source by its key from the global registry of sources. */
export const getSource = <T>(key: string): Source<T> => (sources[key] ||= new Source<T>());

/**
 * Use a source in a component.
 * - Omit the `subcribe()` function so we don't call it incorrectly.
 */
export const useSource = <T>(key: string): Omit<Source<T>, "subscribe"> => useState(getSource<T>(key));

/**
 * Use a live source in a component.
 * - Live sources can be subscribed to.
 */
export const useLiveSource = <T>(key: string): Source<T> => {
	const source = useState(getSource<T>(key));
	useEffect(() => {
		source.incrementSubscribers();
		return () => source.decrementSubscribers();
	}, [source]);
	return source;
};
