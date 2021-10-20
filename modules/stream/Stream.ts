import {
	Mutable,
	addItem,
	MutableArray,
	removeItem,
	AsyncEmptyDispatcher,
	AsyncDispatcher,
	AsyncCatcher,
	Unsubscriber,
	AsyncDeriver,
	dispatch,
	Resolvable,
	SKIP,
	Observable,
	dispatchComplete,
	dispatchError,
	dispatchNext,
	Observer,
	isAsync,
	therive,
	createObserver,
} from "../util/index.js";
import { StreamClosedError } from "./errors.js";

/**
 * Stream: an object that can be subscribed to and passes along any next values to its subscribers.
 *
 * - Provide a normalised `.closed` property that is `true` initially and `false` after `complete()` has been called.
 * - Ensure that `next()`, `error()`, `complete()` aren't called again after `.closed` is true.
 */
export class Stream<I, O = I> implements Observer<I>, Observable<O> {
	/** Create a new stream. */
	static create<X>(): Stream<X> {
		return new Stream<X>();
	}

	/** Create a new stream from a source. */
	static from<X>(source: Observable<X>): Stream<X, X> {
		return new Stream(source);
	}

	/** Create a new stream that derives a value using an `AsyncDeriver` function. */
	static derive<X, Y>(deriver: AsyncDeriver<X, Y>, source?: Observable<X>): Stream<X, Y> {
		return new Stream(source, deriver);
	}

	/** Create a new stream that only fires a slice of its subscribers. */
	static slice<X>(start: number, end: number | undefined = undefined, source?: Observable<X>): Stream<X, X> {
		return new SlicingStream(start, end, source);
	}

	/** Create a new stream that takes a limited number of next values then completes itself. */
	static take<X>(num: number, source?: Observable<X>): Stream<X, X> {
		return new LimitedStream(num, source);
	}

	private readonly _deriver?: AsyncDeriver<I, O>;
	private readonly _cleanup?: Unsubscriber;
	protected readonly _subscribers: MutableArray<Observer<O>> = []; // List of subscribed observers.

	/**
	 * Is this stream open or closed.
	 * - Closed streams no longer pass their values through to their subscribers.
	 */
	readonly closed: boolean = false;

	/** Get the current subscriber count. */
	get subscribers(): number {
		return this._subscribers.length;
	}

	get nextValue(): Promise<O> {
		return getNextValue(this);
	}

	// Protected (use `Stream.from()` and `Stream.derived()` instead).
	protected constructor(source?: Observable<I>, deriver?: AsyncDeriver<I, O>) {
		if (source) this._cleanup = source.subscribe(this);
		if (deriver) this._deriver = deriver;
	}

	/**
	 * Send the next value to this stream's subscribers.
	 * - Calls `next()` on all subscribers.
	 */
	next(value: Resolvable<I>): void {
		if (this.closed) throw new StreamClosedError(this);
		if (value === SKIP) return;
		if (isAsync(value)) return dispatchNext(this, value);
		if (this._deriver) {
			// Derive the value using the deriver then call `this.dispatchNext()` with that new value (or `this.error()` if anything goes wrong).
			therive<I, O, "dispatchNext", "error">(value, this._deriver, this as unknown as { dispatchNext(v: O): void }, "dispatchNext", this, "error"); // Unknown cast to allow calling protected `this.dispatchNext()`
		} else {
			// Call `this.dispatchNext()` directly.
			this.dispatchNext(value as unknown as O); // Unknown cast because we know I is O (because there's no deriver).
		}
	}
	protected dispatchNext(value: O): void {
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
		if (this._cleanup) dispatch(this._cleanup);
		this.dispatchError(reason);
	}
	protected dispatchError(reason: Error | unknown): void {
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
		if (this._cleanup) dispatch(this._cleanup);
		this.dispatchComplete();
	}
	protected dispatchComplete(): void {
		for (const subscriber of this._subscribers.slice()) dispatchComplete(subscriber);
	}

	/**
	 * Subscribe to this stream and return an unsubscriber function.
	 * - Allows either an `Observer` object or  separate `next()`, `error()` and `complete()` functions.
	 * - Implements `Observable`
	 */
	subscribe(next: Observer<O> | AsyncDispatcher<O>, error?: AsyncCatcher, complete?: AsyncEmptyDispatcher): Unsubscriber {
		const observer = createObserver(next, error, complete);
		this.on(observer);
		return this.off.bind(this, observer);
	}

	/** Add an observer to this stream. */
	on(observer: Observer<O>): void {
		if (this.closed) throw new StreamClosedError(this);
		addItem(this._subscribers, observer);
	}

	/** Remove an observer from this stream. */
	off(observer: Observer<O>): void {
		removeItem(this._subscribers, observer);
	}

	/**
	 * Derive a new stream from this stream.
	 * - Optionally supply a `deriver()` function that modifies the stream.
	 */
	derive(): Stream<O, O>;
	derive<X>(deriver: AsyncDeriver<O, X>): Stream<O, X>;
	derive<X>(deriver?: AsyncDeriver<O, X>): Stream<O, O> | Stream<O, X> {
		return deriver ? new Stream<O, X>(this, deriver) : new Stream<O, O>(this);
	}

	/** Create a new stream subscribed to this stream that only fires a slice of its subscribers. */
	slice(start: number, end: number | undefined = undefined): Stream<O, O> {
		return new SlicingStream(start, end, this);
	}

	/** Create a new stream that takes a limited number of next values from this stream then completes itself. */
	take(num: number): Stream<O, O> {
		return new LimitedStream(num, this);
	}
}

/** SlicingStream: stream that, when new values are received, calls a specified slice of its subscribers (not all of them!) */
class SlicingStream<I, O = I> extends Stream<I, O> {
	private _start: number;
	private _end: number | undefined;
	constructor(start: number, end: number | undefined = undefined, source?: Observable<I>, deriver?: AsyncDeriver<I, O>) {
		super(source, deriver);
		this._start = start;
		this._end = end;
	}
	// Override to dispatch only to a slice of the subscribers.
	protected override dispatchNext(value: O): void {
		for (const subscriber of this._subscribers.slice(this._start, this._end)) dispatchNext(subscriber, value);
	}
}

/** LimitedStream: takes a specified number of values from a source then completes itself. */
class LimitedStream<I, O = I> extends Stream<I, O> {
	private _remaining: number;
	constructor(num: number, source?: Observable<I>, deriver?: AsyncDeriver<I, O>) {
		super(source, deriver);
		this._remaining = num;
	}
	// Override to complete when the specified number of next values have been taken.
	protected override dispatchNext(value: O): void {
		super.dispatchNext(value);
		this._remaining--;
		if (this._remaining <= 0) this.complete();
	}
}

/**
 * Get a Promise that resolves to the next value issued by an observable.
 * - Internally uses a `LimitedStream` instance that unsubscribes itself after receiving one value.
 */
export const getNextValue = <T>(observable: Observable<T>): Promise<T> =>
	new Promise<T>((next, error) => new LimitedStream<T, T>(1, observable).on({ next, error }));
