import {
	AsyncCatcher,
	AsyncDispatcher,
	AsyncEmptyDispatcher,
	Mutable,
	Unsubscriber,
	Resolvable,
	SKIP,
	Observable,
	dispatchNext,
	Observer,
	isAsync,
	MutableArray,
	dispatchError,
	dispatchComplete,
	addItem,
	createObserver,
	removeItem,
	Subscribable,
	startSubscription,
	ObserverType,
	AnyObserver,
	dispatch,
} from "../util/index.js";
import { ObserverClosedError, StreamClosedError } from "./errors.js";

/** Extract the internal type from a `Stream` */
export type StreamType<T extends Stream<unknown>> = T extends Stream<infer X> ? X : never;

/**
 * Streams combine `Observer` and `Observable`.
 * - Subscribers are added using `stream.subscribe(observer)` or `stream.subscribe(next, error, complete)`
 * - Stream receives next values via `stream.next(value)` and forwards the values to its subscribers.
 * - Provide a normalised `stream.closed` property that is `true` initially and `false` after `stream.error()` or `stream.complete()` have been called (`stream.next()` can't be called again after `stream.closed` is true).
 * - Streams can connect to a source subscribable via `stream.start()`. The source subscription is ended when this stream is closed with `stream.error()` or `stream.complete()`
 */
export class Stream<T> implements Observer<T>, Observable<T> {
	/**
	 * Start streaming from a source subscribable to a target observer.
	 * - Convenience allows you to one-line the following: `const target = new Stream(); target.start(source);`
	 * - Primarily intended for working with `Stream` instances but works perfectly well with any `Subscribable` and `Observer`.
	 *
	 * @param source Source subscribable.
	 * @param target Target stream that subscribes to the subscribable.
	 * @returns The target stream.
	 */
	static start<S extends AnyObserver>(source: Subscribable<ObserverType<S>>, target: S): S;
	static start<X>(source: Subscribable<X>): Stream<X>;
	static start<X>(source: Subscribable<X>, target: Observer<X> = new Stream<X>()): Observer<X> {
		// `source.on()` is more efficient because it doesn't create a an `Unsubscribe` function that is never used.
		if (source instanceof Stream) source.on(target);
		// `startSubscription()` works with any `Subscribable` and `Observer`
		else startSubscription(source, target);
		return target;
	}

	/** List of sources this stream is subscribed to. */
	protected readonly _sources: MutableArray<Stream<T> | Unsubscriber> = [];

	/** List of subscribed observers that values are forwarded to. */
	protected readonly _subscribers: MutableArray<Observer<T>> = [];

	/**
	 * Is this stream currently receiving an asynchronous next value?
	 * - i.e. `next()` was called with a `Promise` that hasn't resolved yet.
	 * - Use this to avoid retrieving expensive next values if we already started one.
	 */
	readonly pending: boolean = false;

	/** Is this stream open or closed (i.e. `error()` or `complete()` have been called. */
	readonly closed: boolean = false;

	/**
	 * Send the next value to this stream's subscribers.
	 * - Calls `next()` on all subscribers.
	 */
	next(value: Resolvable<T>): void {
		if (this.closed) throw new StreamClosedError(this);
		if (isAsync(value)) {
			(this as Mutable<this>).pending = true;
			dispatchNext(this, value);
		} else {
			(this as Mutable<this>).pending = false;
			if (value !== SKIP) this._dispatch(value as unknown as T);
		}
	}

	/** Dispatch a next value (separate method so it can be overrided in subclasses). */
	protected _dispatch(value: T): void {
		for (const subscriber of this._subscribers.slice()) dispatchNext(subscriber, value);
	}

	/**
	 * Complete this stream with an error.
	 * - Calls `error()` on the subscribers.
	 * - Unsubscribes from the source (if there is one).
	 * - Closes this stream.
	 */
	error(reason: Error | unknown): void {
		if (this.closed) throw new StreamClosedError(this);
		this._close();
		for (const subscriber of this._subscribers.splice(0)) dispatchError(subscriber, reason);
	}

	/**
	 * Complete this stream successfully.
	 * - Calls `complete()` on the subscribers.
	 * - Unsubscribes from the source (if there is one).
	 * - Closes this stream.
	 */
	complete(): void {
		if (this.closed) throw new StreamClosedError(this);
		this._close();
		for (const subscriber of this._subscribers.splice(0)) dispatchComplete(subscriber);
	}

	/**
	 * Close this stream.
	 * - Called after `stream.complete()` and `stream.error()`
	 */
	protected _close(): void {
		(this as Mutable<this>).closed = true;
		(this as Mutable<this>).pending = false;
		for (const source of this._sources.splice(0)) {
			if (source instanceof Stream) this.stop(source);
			else dispatch(source);
		}
	}

	/**
	 * Start streaming from a source to this.
	 * - If there'ss an existing source subscription, it will be closed before the new source is opened.
	 */
	start(source: Subscribable<T>): void {
		if (this.closed) throw new StreamClosedError(this);
		if (source instanceof Stream) source.on(this);
		else this._sources.push(startSubscription(source, this));
	}

	/**
	 * Stop streaming from a source to this.
	 * - Only other instances of `Stream` can be stopped.
	 */
	stop(source: Stream<T>): void {
		source.off(this);
	}

	/**
	 * Subscribe to this stream and return an unsubscriber function.
	 * - Allows either an `Observer` object or  separate `next()`, `error()` and `complete()` functions.
	 * - Implements `Observable`
	 */
	subscribe(next: Observer<T> | AsyncDispatcher<T>, error?: AsyncCatcher, complete?: AsyncEmptyDispatcher): Unsubscriber {
		const observer = createObserver(next, error, complete);
		this.on(observer);
		return this.off.bind(this, observer);
	}

	/** Add an observer to this stream. */
	on(observer: Observer<T>): void {
		if (observer.closed) throw new ObserverClosedError(this, observer);
		if (observer instanceof Stream) addItem(observer._sources, this); // Observer is a stream, add this to the observer's sources so it stops observing this stream when it closes.
		addItem(this._subscribers, observer);
	}

	/** Remove an observer from this stream. */
	off(observer: Observer<T>): void {
		if (observer instanceof Stream) removeItem(observer._sources, this);
		removeItem(this._subscribers, observer);
	}
}
