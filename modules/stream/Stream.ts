import {
	AsyncObserver,
	TransformObserver,
	Transformer,
	ObserverType,
	Subscribable,
	Mutable,
	Unsubscriber,
	dispatchNext,
	Observer,
	dispatchError,
	dispatchComplete,
	Observable,
	subscribe,
	Constructor,
	dispatch,
	Dispatcher,
} from "../util/index.js";
import { ConditionError } from "../error/index.js";

/** Any stream (useful for `extends AnyStream` clauses). */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyStream = Stream<any>;

/**
 * Simple stream.
 * - Does no deriving (input and output types are the same).
 */
export class Stream<T> implements Observer<T>, Observable<T> {
	/** Use species to power functions like `derive()` (similar to `Array.prototype.map()` etc). */
	static [Symbol.species]: Constructor<AnyStream, []> = Stream;

	/** List of sources this stream is subscribed to. */
	protected readonly _cleanups = new Set<Unsubscriber>();

	/** List of subscribed observers that values are forwarded to. */
	protected readonly _observers = new Set<Observer<T>>();

	/** Get the number of current subscribers. */
	get subscribers(): number {
		return this._observers.size;
	}

	/** Is this stream open or closed (i.e. `error()` or `complete()` have been called. */
	readonly closed: boolean = false;

	/**
	 * Send a next value.
	 * - Calls `this._derive()` which calls `this._dispatch()` which calls `next()` on the subscribers.
	 */
	next(value: T): void {
		if (this.closed) throw new ConditionError("Stream is closed");
		this._dispatch(value);
	}

	/** Call `next()` on the subscribers. */
	protected _dispatch(value: T): void {
		for (const observer of this._observers) dispatchNext(observer, value);
	}

	/**
	 * Complete this stream with an error.
	 * - Calls `error()` on the subscribers.
	 * - Closes this stream.
	 */
	error(reason: Error | unknown): void {
		if (this.closed) throw new ConditionError("Stream is closed");
		this._close();
		for (const subscriber of this._observers) {
			this._observers.delete(subscriber);
			dispatchError(subscriber, reason);
		}
	}

	/**
	 * Complete this stream successfully.
	 * - Calls `complete()` on the subscribers.
	 * - Closes this stream.
	 */
	complete(): void {
		if (this.closed) throw new ConditionError("Stream is closed");
		this._close();
		for (const subscriber of this._observers) {
			this._observers.delete(subscriber);
			dispatchComplete(subscriber);
		}
	}

	/** Close this stream. */
	private _close(): void {
		(this as Mutable<this>).closed = true;
		for (const cleanup of this._cleanups) {
			this._cleanups.delete(cleanup);
			dispatch(cleanup);
		}
	}

	/** Start a subscription that gets cleaned up when this subscriber ends. */
	during<X>(source: Subscribable<X>, target: Observer<X>): void {
		if (this.closed) throw new ConditionError("Stream is closed");
		if (target.closed) throw new ConditionError("Target is closed");
		const cleanup = subscribe(source, target);
		if (this.closed || target.closed) void cleanup();
		else this._cleanups.add(cleanup);
	}

	/** Start a subscription from a source to this stream that's ended when this stream closes. */
	from(source: Subscribable<T>): this {
		this.during(source, this);
		return this;
	}

	/** Create a new stream from this stream. */
	to<O extends AnyStream>(target: O): O;
	to(): Stream<T>;
	to(target: Stream<T> = new (this.constructor as typeof Stream)[Symbol.species]()): Stream<T> {
		target.during(this, target);
		return target;
	}

	/** Derive a new stream from this stream using a transformer. */
	derive<O extends AnyStream>(transformer: Transformer<T, ObserverType<O>>, target: O): O;
	derive<TT>(transformer: Transformer<T, TT>): Stream<T>;
	derive<TT>(transformer: Transformer<T, TT>, target: Stream<TT> = new (this.constructor as typeof Stream)[Symbol.species]()): Stream<TT> {
		target.during(this, new TransformObserver(transformer, target));
		return target;
	}

	/** Derive a new stream from this stream using an async transformer. */
	deriveAsync<O extends AnyStream>(transformer: Transformer<T, Promise<ObserverType<O>>>, target: O): O;
	deriveAsync<TT>(transformer: Transformer<T, PromiseLike<TT>>): Stream<T>;
	deriveAsync<TT>(transformer: Transformer<T, PromiseLike<TT>>, target: Stream<TT> = new (this.constructor as typeof Stream)[Symbol.species]()): Stream<TT> {
		target.during(this, new TransformObserver(transformer, new AsyncObserver(target)));
		return target;
	}

	/**
	 * Subscribe to this stream and return an unsubscriber function.
	 * - Allows either an `Observer` object or  separate `next()`, `error()` and `complete()` functions.
	 * - Implements `Observable`
	 */
	subscribe(next: Observer<T> | Dispatcher<[T]>): Unsubscriber {
		const observer = typeof next === "function" ? { next } : next;
		this._on(observer);
		return this._off.bind(this, observer);
	}

	/** Add an observer. */
	_on(observer: Observer<T>): void {
		this._observers.add(observer);
	}

	/** Remove an observer. */
	_off(observer: Observer<T>): void {
		this._observers.delete(observer);
	}
}
