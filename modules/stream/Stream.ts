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
} from "../util/index.js";
import { StreamClosedError } from "./errors.js";

/**
 * Streams combine `Observer` and `Observable`.
 * - Any received values and errors are passed along to to all of its subscribers.
 * - Provide a normalised `.closed` property that is `true` initially and `false` after `error()` or `complete()` have been called.
 * - Ensure that `next()`, `error()`, `complete()` aren't called again after `.closed` is true.
 */
export class Stream<T> implements Observer<T>, Observable<T> {
	/**
	 * Stream from a source to a new or existing stream.
	 * - Convenience allows you to one-line the following: `const target = new Stream(); target.start(source);`
	 *
	 * @param source Source subscribable.
	 * @param target Target stream that subscribes to the subscribable.
	 * @returns The target stream.
	 */
	static from<X>(source: Subscribable<X>): Stream<X>;
	static from<X, S extends Observer<X>>(source: Subscribable<X>, target: S): S;
	static from<X>(source: Subscribable<X>, target: Observer<X> = new Stream<X>()): Observer<X> {
		target instanceof Stream ? target.start(source) : startSubscription(source, target);
		return target;
	}

	/** List of subscribed observers. */
	protected readonly _subscribers: MutableArray<Observer<T>> = [];

	/** Cleanup function that ends the current source subscription. */
	protected _cleanup?: Unsubscriber | void;

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
		(this as Mutable<this>).closed = true;
		(this as Mutable<this>).pending = false;
		this.stop();
		for (const subscriber of this._subscribers.slice()) dispatchError(subscriber, reason);
	}

	/**
	 * Complete this stream successfully.
	 * - Calls `complete()` on the subscribers.
	 * - Unsubscribes from the source (if there is one).
	 * - Closes this stream.
	 */
	complete(): void {
		if (this.closed) throw new StreamClosedError(this);
		(this as Mutable<this>).closed = true;
		(this as Mutable<this>).pending = false;
		this.stop();
		for (const subscriber of this._subscribers.slice()) dispatchComplete(subscriber);
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
		addItem(this._subscribers, observer);
	}

	/** Remove an observer from this stream. */
	off(observer: Observer<T>): void {
		removeItem(this._subscribers, observer);
	}

	/**
	 * Subscribe this stream to a source subscribable.
	 * - If there'ss an existing source subscription, it will be closed before the new source is opened.
	 */
	start(source: Subscribable<T>): void {
		if (this.closed) throw new StreamClosedError(this);
		this.stop(); // Close any existing source subscription.
		this._cleanup = startSubscription(source, this);
	}

	/** Stop any open subscription to a source. */
	stop(): void {
		if (this._cleanup) this._cleanup = void this._cleanup();
	}

	/**
	 * Stream from this stream to a new or existing stream.
	 *
	 * @param target Target stream that subscribes to the subscribable.
	 * @returns The target stream.
	 */
	to<S extends Observer<T>>(target: S): S {
		return Stream.from(this, target);
	}
}
