import {
	AsyncObserver,
	DeriveObserver,
	Deriver,
	ObserverType,
	Subscribable,
	Dispatcher,
	Mutable,
	Unsubscriber,
	dispatchNext,
	Observer,
	dispatchError,
	dispatchComplete,
	createObserver,
	Observable,
	subscribe,
	dispatch,
} from "../util/index.js";
import { StreamClosedError } from "./errors.js";

/** Any stream (useful for `extends AnyStream` clauses). */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyStream = Stream<any>;

/**
 * Simple stream.
 * - Does no deriving (input and output types are the same).
 */
export class Stream<T> implements Observer<T>, Observable<T> {
	/** List of sources this stream is subscribed to. */
	protected readonly _sources = new Set<Stream<T> | Unsubscriber>();

	/** List of subscribed observers that values are forwarded to. */
	protected readonly _subscribers = new Set<Observer<T>>();

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
	next(value: T): void {
		if (this.closed) throw new StreamClosedError();
		this._dispatch(value);
	}

	/** Call `next()` on the subscribers. */
	protected _dispatch(value: T): void {
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
			if (source instanceof Stream) this.stop(source);
			else dispatch(undefined, source);
		}
	}

	/**
	 * Start streaming from a source to this.
	 * @param middleware Optioanl middleware observer that eventually sends values to this.
	 */
	start<X>(source: Subscribable<X>, middleware: Observer<X>): void;
	start(source: Subscribable<T>): void;
	start(source: Subscribable<T>, target: Observer<T> = this): void {
		if (this.closed) throw new StreamClosedError();
		if (source instanceof Stream) source.on(target);
		else this._sources.add(subscribe(source, target));
	}

	/**
	 * Stop streaming from a source to this.
	 * - Only other instances of `Stream` can be stopped (for everything else call its `unsubscribe()` function).
	 */
	stop(source: Stream<T>): void {
		source.off(this);
	}

	/**
	 * Subscribe to this stream and return an unsubscriber function.
	 * - Allows either an `Observer` object or  separate `next()`, `error()` and `complete()` functions.
	 * - Implements `Observable`
	 */
	subscribe(next: Observer<T> | Dispatcher<T>, error?: Dispatcher<unknown>, complete?: Dispatcher<void>): Unsubscriber {
		const observer = createObserver(next, error, complete);
		this.on(observer);
		return this.off.bind(this, observer);
	}

	/** Add an observer to this stream. */
	on(observer: Observer<T>): void {
		if (observer.closed) throw new StreamClosedError();
		if (observer instanceof Stream) observer._sources.add(this); // Observer is a stream, add this to the observer's sources so it stops observing this stream when it closes.
		this._subscribers.add(observer);
	}

	/** Remove an observer from this stream. */
	off(observer: Observer<T>): void {
		if (observer instanceof Stream) observer._sources.delete(this);
		this._subscribers.delete(observer);
	}
}

/** Subscribe from a source to a new or existing stream. */
export function subscribeStream<T extends AnyStream>(source: Subscribable<ObserverType<T>>, target: T): T;
export function subscribeStream<T>(source: Subscribable<T>): Stream<T>;
export function subscribeStream<T>(source: Subscribable<T>, target: Stream<T> = new Stream()): Stream<T> {
	target.start(source);
	return target;
}

/** Derive from a source to a new or existing stream using a deriver. */
export function deriveStream<I, O extends AnyStream>(source: Subscribable<I>, deriver: Deriver<I, ObserverType<O>>, target: O): O;
export function deriveStream<I, O>(source: Subscribable<I>, deriver: Deriver<I, O>): Stream<O>;
export function deriveStream<I, O>(source: Subscribable<I>, deriver: Deriver<I, O>, target: Stream<O> = new Stream<O>()): Stream<O> {
	target.start(source, new DeriveObserver(deriver, target));
	return target;
}

/** Derive from a source to a new or existing stream using an async deriver. */
export function deriveAsyncStream<I, O extends AnyStream>(source: Subscribable<I>, deriver: Deriver<I, ObserverType<O> | Promise<ObserverType<O>>>, target: O): O; // prettier-ignore
export function deriveAsyncStream<I, O>(source: Subscribable<I>, deriver: Deriver<I, O | Promise<O>>): Stream<O>;
export function deriveAsyncStream<I, O>(source: Subscribable<I>, deriver: Deriver<I, O | Promise<O>>, target: Stream<O> = new Stream<O>()): Stream<O> {
	target.start(() => subscribe(source, new DeriveObserver(deriver, new AsyncObserver(target))));
	return target;
}
