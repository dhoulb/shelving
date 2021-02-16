import type { Mutable } from "../object";
import type { Observer, Subscribable } from "../observe";
import { logError } from "../console";
import { addItem, MutableArray, removeItem } from "../array";
import { AsyncDeriver, AsyncEmptyDispatcher, AsyncDispatcher, AsyncCatcher, thispatch, Unsubscriber } from "../function";
import { SKIP } from "../constants";

/**
 * A 'normalised' observer.
 *
 * - Wraps multiple sub-observers.
 * - Provide a `.closed` property that is `true` initially and `false` after `complete()` has been called.
 * - Ensure that `next()`, `error()`, `complete()` aren't called again after `.closed` is true.
 * - Logs everything that's passed to `error()` to the console.
 * - Catches synchronously thrown errors in `next()`, `error()` and `complete()` and logs them to the console.
 * - Catches asynchronously rejected errors in `next()`, `error()` and `complete()` and logs them to the console.
 */
export class Stream<T> implements Observer<T>, Subscribable<T> {
	private _subscribers: MutableArray<Observer<T>> = [];
	private _sliceStart = 0;
	private _sliceEnd: number | undefined = undefined;

	/** Is this observer open or closed. */
	readonly closed: boolean = false;

	/** Count the number of currently attached observers. */
	get subscribers(): number {
		return this._subscribers.length;
	}

	/**
	 * Send the next value to this stream's subscribers.
	 * - Calls `next()` on all subscribers.
	 * - Skips subscribers where `subscriber.closed` is truthy.
	 */
	next(next: T | typeof SKIP): void {
		if (this.closed) return;
		if (next === SKIP) return;

		const subscribers = this._subscribers.slice(this._sliceStart, this._sliceEnd);
		for (const subscriber of subscribers) {
			if (!subscriber.closed) {
				const cb = subscriber.next;
				if (cb) thispatch(subscriber, cb, next);
			}

			// Remove any closed subscribers to free up memory.
			if (subscriber.closed) removeItem(this._subscribers, subscriber);
		}
	}

	/**
	 * Complete this stream with an error.
	 * - Calls `error()` on the subscribers.
	 * - Skips subscribers where `subscriber.closed` is truthy.
	 */
	error(error: Error | unknown): void {
		logError(error); // Just in case.

		// Remove all subscribers (to free memory) since this stream has definitely closed now.
		const subscribers = this._subscribers.splice(0);

		if (this.closed) return;
		(this as Mutable<this>).closed = true;
		for (const subscriber of subscribers) {
			if (!subscriber.closed) {
				const cb = subscriber.error;
				if (cb) thispatch(subscriber, cb, error);
			}
		}
	}

	/**
	 * Complete this stream successfully.
	 * - Calls `complete()` on the subscribers.
	 * - Skips subscribers where `subscriber.closed` is truthy.
	 */
	complete(): void {
		// Remove all subscribers (to free memory) since this stream has definitely closed now.
		const subscribers = this._subscribers.splice(0);

		if (this.closed) return;
		(this as Mutable<this>).closed = true;

		for (const subscriber of subscribers)
			if (!subscriber.closed) {
				const cb = subscriber.complete;
				if (cb) thispatch(subscriber, cb, undefined);
			}
	}

	/** Subscribe to this `Stream` and return an `UnsubscribeDispatcher` */
	subscribe(next: Observer<T> | AsyncDispatcher<T>, error?: AsyncCatcher, complete?: AsyncEmptyDispatcher): Unsubscriber {
		const subscriber: Observer<T> = typeof next === "function" ? { next, error, complete } : next;
		addItem(this._subscribers, subscriber);
		return () => removeItem(this._subscribers, subscriber);
	}

	/**
	 * Create a new steam with a value that derives its values from this stream.
	 * @param deriver Optional deriver function that modifies values before they're sent to the new stream.
	 */
	derive(): Stream<T>;
	derive<TT>(deriver?: AsyncDeriver<T, TT | typeof SKIP>): Stream<TT>;
	derive<TT>(deriver?: AsyncDeriver<T, TT | typeof SKIP>): Stream<T> | Stream<TT> {
		if (deriver) {
			const derivedStream = new Stream<TT>();
			const derivingStream = new DerivingStream<T, TT>(deriver);
			derivingStream.subscribe(derivedStream);
			this.subscribe(derivingStream);
			return derivedStream;
		} else {
			const stream = new Stream<T>();
			this.subscribe(stream);
			return stream;
		}
	}

	/**
	 * Create a new stream that completes itself after a limited number of values.
	 * - Called `take()` because it matches RxJS.
	 */
	take(limit: number): Stream<T> {
		const stream = new LimitedStream<T>(limit);
		this.subscribe(stream);
		return stream;
	}

	/**
	 * Create a new stream that only sends next values to a specified slice of the subscribers.
	 * e.g. `stream.slice(0, 1).next(123)` only fires the first subscriber.
	 * e.g. `stream.slice(-1).next(123)` only fires the last subscriber.
	 */
	slice(start = 0, end?: number | undefined): Stream<T> {
		const stream = new Stream<T>();
		stream._subscribers = this._subscribers;
		stream._sliceStart = start;
		stream._sliceEnd = end;
		return stream;
	}

	/**
	 * PromiseLike implementation.
	 * - Allows you to `await` this stream to get the next value.
	 */
	then<U = T, V = never>(next?: (value: T) => PromiseLike<U> | U, error?: (thrown: Error | unknown) => PromiseLike<V> | V): Promise<U | V> {
		return new Promise<T>((resolve: AsyncDispatcher<T>, reject: AsyncCatcher): void => {
			this.take(1).subscribe({ next: resolve, error: reject });
		}).then<U, V>(next, error);
	}
}

/**
 * Create a new `Stream` instance.
 * - Allows either `(observer)` or `(next, error, complete)` argument order.
 * - Optionally pass in an observer that subscribes to the stream (in either `(observer)` or `(next, error, complete)` argument order).
 */
export const createStream = <T>(next?: Observer<T> | AsyncDispatcher<T>, error?: AsyncCatcher, complete?: AsyncEmptyDispatcher): Stream<T> => {
	const stream = new Stream<T>();
	if (next) stream.subscribe(next, error, complete);
	return stream;
};

/**
 * Is an unknown value a `Stream` instance?
 * - This is a TypeScript assertion function, so if this function returns `true` the type is also asserted to be a `Stream`.
 */
export const isStream = <T extends Stream<unknown>>(state: T | unknown): state is T => state instanceof Stream;

/** Derived stream: when `next()` is called, derives a new value using an async deriving function, */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
class DerivingStream<T, TT> extends Stream<any> implements Observer<T> {
	private _deriver: AsyncDeriver<T, TT | typeof SKIP>;
	constructor(deriver: AsyncDeriver<T, TT | typeof SKIP>) {
		super();
		this._deriver = deriver;
	}
	next(next: T | typeof SKIP): void {
		if (this.closed) return;
		if (next === SKIP) return;
		thispatch(this, super.next, this._deriver(next));
	}
}

/** Limited stream: allows `next()` to be called a fixed number of times then completes itself. */
class LimitedStream<T> extends Stream<T> implements Observer<T> {
	private _limit: number;
	private _count = 0;
	constructor(limit: number) {
		super();
		this._limit = limit;
	}
	next(next: T | typeof SKIP): void {
		if (this.closed) return;
		if (next === SKIP) return;
		super.next(next);
		this._count++;
		if (this._count >= this._limit) this.complete();
	}
}
