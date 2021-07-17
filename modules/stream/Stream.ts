import {
	Mutable,
	addItem,
	MutableArray,
	removeItem,
	AsyncEmptyDispatcher,
	AsyncDispatcher,
	AsyncCatcher,
	thispatch,
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
} from "../util";

/**
 * Stream: an object that can be subscribed to and passes along any next values to its subscribers.
 *
 * - Provide a normalised `.closed` property that is `true` initially and `false` after `complete()` has been called.
 * - Ensure that `next()`, `error()`, `complete()` aren't called again after `.closed` is true.
 */
export class Stream<T> implements Observer<T>, Observable<T> {
	readonly #cleanup?: Unsubscriber;
	readonly #subscribers: MutableArray<Observer<T>> = []; // List of subscribed observers.

	/**
	 * Is this stream open or closed.
	 * - Closed streams no longer pass their values through to their subscribers.
	 */
	readonly closed: boolean = false;

	/** Get the current subscriber count. */
	get subscribers(): number {
		return this.#subscribers.length;
	}

	get nextValue(): Promise<T> {
		return getNextValue(this);
	}

	constructor(source?: Observable<T>) {
		if (source) this.#cleanup = source.subscribe(this);
	}

	/**
	 * Send the next value to this stream's subscribers.
	 * - Calls `next()` on all subscribers.
	 */
	next(value: Resolvable<T>): void {
		if (this.closed || value === SKIP) return;
		if (isAsync(value)) return dispatchNext(this, value);
		for (const subscriber of this.#subscribers.slice()) dispatchNext(subscriber, value);
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
		if (this.#cleanup) dispatch(this.#cleanup);
		for (const subscriber of this.#subscribers.slice()) dispatchError(subscriber, reason);
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
		if (this.#cleanup) dispatch(this.#cleanup);
		for (const subscriber of this.#subscribers.slice()) dispatchComplete(subscriber);
	}

	/**
	 * Subscribe to this stream and return an unsubscriber function.
	 * - Allows either an `Observer` object or  separate `next()`, `error()` and `complete()` functions.
	 * - Implements `Observable`
	 */
	subscribe(next: Observer<T> | AsyncDispatcher<T>, error?: AsyncCatcher, complete?: AsyncEmptyDispatcher): Unsubscriber {
		const observer = typeof next === "object" ? next : { next, error, complete };
		this.on(observer);
		return this.off.bind(this, observer);
	}

	/** Add an observer to this stream. */
	on(observer: Observer<T>): void {
		addItem(this.#subscribers, observer);
	}

	/** Remove an observer from this stream. */
	off(observer: Observer<T>): void {
		removeItem(this.#subscribers, observer);
	}

	/**
	 * Derive a new stream from this stream.
	 * - Optionally supply a `deriver()` function that modifies the stream.
	 */
	derive(): Stream<T>;
	derive<TT>(deriver: AsyncDeriver<T, TT>): Stream<TT>;
	derive<TT>(deriver?: AsyncDeriver<T, TT>): Stream<T> | Stream<TT> {
		return deriver ? new Stream(new DerivingStream(deriver, this)) : new Stream(this);
	}

	/** Get a stream that takes the next X number of values from this stream then completes itself. */
	take(num: number): Stream<T> {
		return new LimitedStream(num, this);
	}
}

/** SlicingStream: stream that, when new values are received, calls a specified slice of its subscribers (not all of them!) */
export class SlicingStream<T> extends Stream<T> {
	#subscribers: MutableArray<Observer<T>> = []; // List of subscribed observers.
	#start: number;
	#end: number | undefined;

	constructor(start: number, end: number | undefined = undefined) {
		super();
		this.#start = start;
		this.#end = end;
	}

	/**
	 * Send the next value to this stream's subscribers.
	 * - Calls `next()` on all subscribers.
	 * - Knows how to deal with resolvable values (i.e. Promised or SKIP values).
	 */
	next(value: Resolvable<T>): void {
		if (this.closed || value === SKIP) return;
		if (isAsync(value)) return dispatchNext(this, value);
		for (const subscriber of this.#subscribers.slice(this.#start, this.#end)) dispatchNext(subscriber, value);
	}
}

/** LimitedStream: takes a specified number of values from a source then completes itself. */
export class LimitedStream<T> extends Stream<T> {
	#remaining: number;

	constructor(num: number, source?: Observable<T>) {
		super(source);
		this.#remaining = num;
	}

	next(value: Resolvable<T>): void {
		if (this.closed || value === SKIP) return;
		if (isAsync(value)) return dispatchNext(this, value);
		super.next(value);
		this.#remaining--;
		if (this.#remaining <= 0) this.complete();
	}
}

/** Deriving stream: a stream that modifies the next value before repeating it. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class DerivingStream<I, O> extends Stream<any> {
	private _deriver: AsyncDeriver<I, O>;

	constructor(deriver: AsyncDeriver<I, O>, source?: Observable<I>) {
		super(source);
		this._deriver = deriver;
	}

	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore We know this signature is correct.
	next(value: Resolvable<I>): void {
		if (this.closed || value === SKIP) return;
		if (isAsync(value)) return dispatchNext(this, value);
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

/**
 * Get a Promise that resolves to the next value issued by an observable.
 * - Internally uses a `LimitedStream` instance that unsubscribes itself after receiving one value.
 */
export const getNextValue = <T>(observable: Observable<T>): Promise<T> => new Promise<T>((next, error) => new LimitedStream(1, observable).on({ next, error }));
