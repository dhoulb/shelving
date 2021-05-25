import type { Mutable } from "../object";
import { addItem, MutableArray, removeItem } from "../array";
import { AsyncEmptyDispatcher, AsyncDispatcher, AsyncCatcher, thispatch, Unsubscriber, AsyncDeriver } from "../function";
import { Resolvable } from "../data";
import { SKIP } from "../constants";
import { dispatchComplete, dispatchError, dispatchNext, Observer } from "./Observer";
import { Observable } from "./Observable";

/**
 * Stream: an object that can be subscribed to and passes along any next values to its subscribers.
 *
 * - Provide a normalised `.closed` property that is `true` initially and `false` after `complete()` has been called.
 * - Ensure that `next()`, `error()`, `complete()` aren't called again after `.closed` is true.
 */
export class Stream<T> implements Observer<T>, Observable<T> {
	protected _subscribers: MutableArray<Observer<T>> = []; // List of subscribed observers.

	/**
	 * Is this stream open or closed.
	 * - Closed streams no longer pass their values through to their subscribers.
	 */
	readonly closed: boolean = false;

	/** Get the current subscriber count. */
	get subscribers(): number {
		return this._subscribers.length;
	}

	/**
	 * Send the next value to this stream's subscribers.
	 * - Calls `next()` on all subscribers.
	 */
	next(value: Resolvable<T>): void {
		if (this.closed || value === SKIP) return;
		if (value instanceof Promise) return dispatchNext(this, value);
		for (const subscriber of this._subscribers.slice()) dispatchNext(subscriber, value);
	}

	/**
	 * Complete this stream with an error.
	 * - Calls `error()` on the subscribers.
	 * - Unsubscribes from the source (if there is one).
	 * - Closes this stream.
	 */
	error(reason: Error | unknown): void {
		if (this.closed) return;
		(this as Mutable<this>).closed = true;
		for (const subscriber of this._subscribers.slice()) dispatchError(subscriber, reason);
	}

	/**
	 * Complete this stream successfully.
	 * - Calls `complete()` on the subscribers.
	 * - Unsubscribes from the source (if there is one).
	 * - Closes this stream.
	 */
	complete(): void {
		if (this.closed) return;
		(this as Mutable<this>).closed = true;
		for (const subscriber of this._subscribers.slice()) dispatchComplete(subscriber);
	}

	/**
	 * Subscribe to this `Stream` and return an unsubscriber function.
	 * - Allows either an `Observer` object or  separate `next()`, `error()` and `complete()` functions.
	 */
	subscribe(next: Observer<T> | AsyncDispatcher<T>, error?: AsyncCatcher, complete?: AsyncEmptyDispatcher): Unsubscriber {
		const observer = typeof next === "object" ? next : { next, error, complete };
		this.on(observer);
		return this.off.bind(this, observer);
	}

	/**
	 * Add an observer to this stream.
	 * - Like `subscribe()` but only allows an `Observer` object.
	 */
	on(observer: Observer<T>): void {
		addItem(this._subscribers, observer);
	}

	/** Remove an observer from this stream. */
	off(observer: Observer<T>): void {
		removeItem(this._subscribers, observer);
	}

	/** Return a new stream that takes a specific number of values from this stream then completes itself. */
	take(num: number): Stream<T> {
		return new LimitedStream(num, this);
	}

	/**
	 * Derive a new stream from this stream.
	 * - Optionally supply a `deriver()` function that modifies the stream.
	 */
	derive(): Stream<T>;
	derive<TT>(deriver: AsyncDeriver<T, TT>): Stream<TT>;
	derive<TT>(deriver?: AsyncDeriver<T, TT>): Stream<T> | Stream<TT> {
		return deriver ? new SourceStream(new DerivingStream(deriver, this)) : new SourceStream(this);
	}
}

/** SlicingStream: stream that, when new values are received, calls a specified slice of its subscribers (not all of them!) */
export class SlicingStream<T> extends Stream<T> {
	private _start: number;
	private _end: number | undefined;

	constructor(start: number, end: number | undefined = undefined) {
		super();
		this._start = start;
		this._end = end;
	}

	/**
	 * Send the next value to this stream's subscribers.
	 * - Calls `next()` on all subscribers.
	 * - Knows how to deal with resolvable values (i.e. Promised or SKIP values).
	 */
	next(value: Resolvable<T>): void {
		if (this.closed || value === SKIP) return;
		if (value instanceof Promise) return dispatchNext(this, value);
		for (const subscriber of this._subscribers.slice(this._start, this._end)) dispatchNext(subscriber, value);
	}
}

/** SourceStream: subscribes to a source observable. */
export class SourceStream<T> extends Stream<T> {
	private _cleanup?: Unsubscriber; // Unsubscriber function for the source this stream is attached to.
	readonly source?: Observable<T>;

	constructor(source?: Observable<T>) {
		super();
		this.source = source;
	}

	// Starts the connection to the source.
	start(): void {
		if (!this.closed && !this._cleanup) {
			try {
				this._cleanup = this.source?.subscribe(this);
			} catch (thrown) {
				this.error(thrown);
			}
		}
	}

	/** Stops the subscription to the source observable. */
	stop(): void {
		if (this._cleanup) this._cleanup = void this._cleanup();
	}

	// When an observer is added, start the subscription to the source observable.
	on(observer: Observer<T>): void {
		super.on(observer);
		if (this._subscribers.length) this.start();
	}

	// When the last observer is removed, stop the subscription to the source observable.
	off(observer: Observer<T>): void {
		super.off(observer);
		if (!this._subscribers.length) this.stop();
	}

	// When the stream completes, stop the subscription to the source observable.
	error(reason: Error | unknown): void {
		this.stop();
		super.error(reason);
	}

	// When the stream completes, stop the subscription to the source observable.
	complete(): void {
		this.stop();
		super.complete();
	}
}

/** LimitedStream: takes a specified number of values from a source then completes itself. */
export class LimitedStream<T> extends SourceStream<T> {
	private _remaining: number;

	constructor(num: number, source: Observable<T>) {
		super(source);
		this._remaining = num;
	}

	next(value: Resolvable<T>): void {
		if (this.closed || value === SKIP) return;
		if (value instanceof Promise) return dispatchNext(this, value);
		super.next(value);
		this._remaining--;
		if (this._remaining <= 0) this.complete();
	}
}

/** Deriving stream: a stream that modifies the next value before repeating it. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class DerivingStream<I, O> extends SourceStream<any> {
	private _deriver: AsyncDeriver<I, O>;

	constructor(deriver: AsyncDeriver<I, O>, source?: Observable<I>) {
		super(source);
		this._deriver = deriver;
	}

	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore We know this signature is correct.
	next(value: Resolvable<I>): void {
		if (this.closed || value === SKIP) return;
		if (value instanceof Promise) return dispatchNext(this, value);
		try {
			// Call `this.derived()` with the new value and `this.error()`
			thispatch<O, "derived", "error">(this, "derived", this._deriver(value), this, "error");
		} catch (thrown) {
			this.error(thrown); // Calling this._deriver() might throw.
		}
	}

	/** Receive a derived value to the target. */
	derived(value: O): void {
		super.next(value);
	}
}
