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
	isFunction,
	MutableArray,
	dispatchError,
	dispatchComplete,
	addItem,
	createObserver,
	removeItem,
} from "../util/index.js";
import { StreamClosedError } from "./errors.js";

/** Source for a stream is either an `Observable` or a function that can be called to start the stream. */
export type StreamSource<X> = Observable<X> | ((observer: Observer<X>) => Unsubscriber);

/**
 * Streams combine `Observer` and `Observable`.
 * - Any received values and errors are passed along to to all of its subscribers.
 * - Provide a normalised `.closed` property that is `true` initially and `false` after `error()` or `complete()` have been called.
 * - Ensure that `next()`, `error()`, `complete()` aren't called again after `.closed` is true.
 */
export class Stream<I, O = I> implements Observer<I>, Observable<O> {
	/** List of subscribed observers. */
	protected readonly _subscribers: MutableArray<Observer<O>> = [];

	/** Cleanup function that ends the current source subscription. */
	protected _cleanup?: Unsubscriber | void;

	/**
	 * Is this stream open or closed.
	 * - Closed streams no longer pass their values through to their subscribers.
	 */
	readonly closed: boolean = false;

	constructor(source?: StreamSource<I>) {
		if (source) this._cleanup = isFunction(source) ? source(this) : source.subscribe(this);
	}

	/**
	 * Send the next value to this stream's subscribers.
	 * - Calls `next()` on all subscribers.
	 */
	next(value: Resolvable<I>): void {
		if (this.closed) throw new StreamClosedError(this);
		if (value === SKIP) return;
		if (isAsync(value)) return dispatchNext(this, value);
		this._deriveNext(value);
	}
	protected _deriveNext(value: I): void {
		this._dispatchNext(value as unknown as O); // Normal streams don't do any deriving.
	}
	protected _dispatchNext(value: O): void {
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
		if (this._cleanup) this._cleanup = void this._cleanup();
		this._dispatchError(reason);
	}
	protected _dispatchError(reason: Error | unknown): void {
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
		if (this._cleanup) this._cleanup = void this._cleanup();
		this._dispatchComplete();
	}
	protected _dispatchComplete(): void {
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
		addItem(this._subscribers, observer);
	}

	/** Remove an observer from this stream. */
	off(observer: Observer<O>): void {
		removeItem(this._subscribers, observer);
	}
}
