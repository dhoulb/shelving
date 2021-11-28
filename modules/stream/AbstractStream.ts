import {
	Subscribable,
	Dispatcher,
	Mutable,
	Unsubscriber,
	Observable,
	dispatchNext,
	Observer,
	dispatchError,
	dispatchComplete,
	createObserver,
	subscribe,
	dispatch,
	Handleable,
} from "../util/index.js";
import { StreamClosedError } from "./errors.js";

/**
 * Connect observables to observers.
 * - Subscribers are added using `connectable.subscribe(observer)` or `connectable.subscribe(next, error, complete)`
 * - Stream receives next values via `connectable.next(value)` and forwards the values to its subscribers.
 * - Provide a normalised `connectable.closed` property that is `true` initially and `false` after `connectable.error()` or `connectable.complete()` have been called (`connectable.next()` can't be called again after `connectable.closed` is true).
 * - Streams can connect to a source subscribable via `connectable.start()`. The source subscription is ended when this stream is closed with `connectable.error()` or `connectable.complete()`
 */
export abstract class AbstractStream<I, O> implements Observer<I>, Observable<O>, Handleable {
	/** List of sources this stream is subscribed to. */
	protected readonly _sources = new Set<AbstractStream<unknown, I> | Unsubscriber>();

	/** List of subscribed observers that values are forwarded to. */
	protected readonly _subscribers = new Set<Observer<O>>();

	/** Get the number of current sources. */
	get sources(): number {
		return this._sources.size;
	}

	/** Get the number of current subscribers. */
	get subscribers(): number {
		return this._subscribers.size;
	}

	/** Is this stream open or closed (i.e. `error()` or `complete()` have been called. */
	readonly closed: boolean = false;

	/**
	 * Send a next value.
	 * - Calls `this._derive()` which calls `this._dispatch()` which calls `next()` on the subscribers.
	 */
	next(value: I): void {
		if (this.closed) throw new StreamClosedError();
		this._derive(value);
	}

	/**
	 * Derive the input type into the output type.
	 * - Should call `this._dispatch()` which calls `next()` on the subsribers.
	 */
	protected abstract _derive(value: I): void;

	/** Call `next()` on the subscribers. */
	protected _dispatch(value: O): void {
		for (const subscriber of this._subscribers) dispatchNext(value, subscriber);
	}

	/**
	 * Complete this stream with an error.
	 * - Calls `error()` on the subscribers.
	 * - Closes this stream.
	 */
	error(reason: Error | unknown): void {
		if (this.closed) throw new StreamClosedError();
		this._close();
		for (const subscriber of this._subscribers) {
			dispatchError(reason, subscriber);
			this.off(subscriber);
		}
	}

	/**
	 * Complete this stream successfully.
	 * - Calls `complete()` on the subscribers.
	 * - Closes this stream.
	 */
	complete(): void {
		if (this.closed) throw new StreamClosedError();
		this._close();
		for (const subscriber of this._subscribers) {
			dispatchComplete(subscriber);
			this.off(subscriber);
		}
	}

	/** Close this stream. */
	private _close(): void {
		(this as Mutable<this>).closed = true;
		for (const source of this._sources) {
			this._sources.delete(source);
			if (source instanceof AbstractStream) this.stop(source);
			else dispatch(undefined, source);
		}
	}

	/**
	 * Start streaming from a source to this.
	 * - If there'ss an existing source subscription, it will be closed before the new source is opened.
	 */
	start(source: Subscribable<I>): void {
		if (this.closed) throw new StreamClosedError();
		if (source instanceof AbstractStream) source.on(this);
		else this._sources.add(subscribe(source, this));
	}

	/**
	 * Stop streaming from a source to this.
	 * - Only other instances of `Stream` can be stopped.
	 */
	stop(source: AbstractStream<unknown, I>): void {
		source.off(this);
	}

	/**
	 * Subscribe to this stream and return an unsubscriber function.
	 * - Allows either an `Observer` object or  separate `next()`, `error()` and `complete()` functions.
	 * - Implements `Observable`
	 */
	subscribe(next: Observer<O> | Dispatcher<O>, error?: Dispatcher<unknown>, complete?: Dispatcher<void>): Unsubscriber {
		const observer = createObserver(next, error, complete);
		this.on(observer);
		return this.off.bind(this, observer);
	}

	/** Add an observer to this stream. */
	on(observer: Observer<O>): void {
		if (observer.closed) throw new StreamClosedError();
		if (observer instanceof AbstractStream) observer._sources.add(this); // Observer is a stream, add this to the observer's sources so it stops observing this stream when it closes.
		this._subscribers.add(observer);
	}

	/** Remove an observer from this stream. */
	off(observer: Observer<O>): void {
		if (observer instanceof AbstractStream) observer._sources.delete(this);
		this._subscribers.delete(observer);
	}
}
