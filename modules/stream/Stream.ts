import type { Mutable } from "../object";
import type { Resolvable } from "../data";
import { Observer, Subscribable, takeFrom, deriveFrom } from "../observe";
import { addItem, MutableArray, removeItem } from "../array";
import { AsyncEmptyDispatcher, AsyncDispatcher, AsyncCatcher, thispatch, Unsubscriber, AsyncDeriver } from "../function";
import { SKIP } from "../constants";
import { bindMethod } from "../class";

/**
 * Stream: a subscribable observer.
 *
 * - Wraps multiple sub-observers.
 * - Provide a normalised `.closed` property that is `true` initially and `false` after `complete()` has been called.
 * - Ensure that `next()`, `error()`, `complete()` aren't called again after `.closed` is true.
 * - Logs everything that's passed to `error()` to the console.
 * - Catches synchronously thrown errors in `next()`, `error()` and `complete()` and logs them to the console.
 * - Catches asynchronously rejected errors in `next()`, `error()` and `complete()` and logs them to the console.
 *
 * @param I The input type, used for `next()`
 * @param O The output type, used for `subscribe()`
 */
export class Stream<T> implements Observer<T>, Subscribable<T> {
	/**
	 * Create a new stream.
	 * - Static function so you can use it with `useLazy()` and for consistency with `Stream.take()`
	 */
	static create<X>(source?: Subscribable<X>): Stream<X> {
		return new Stream<X>(source);
	}

	/** Create a new stream that only targets some of its subscribers when `next()` is called. */
	static target<X>(num: number, source?: Subscribable<X>): Stream<X> {
		const stream = new Stream<X>(source);
		stream._target = num;
		return stream;
	}

	private _subscribers: MutableArray<Observer<T>> = []; // List of subscribed observers.
	private _cleanup: Unsubscriber | undefined = undefined; // Function that unsubscribes from the source on error or complete.
	private _target = 0; // Number of subscribers to call when calling `next()`

	/** Is this observer open or closed. */
	readonly closed: boolean = false;

	/** Get the current subscriber count. */
	get subscribers(): number {
		return this._subscribers.length;
	}

	constructor(source?: Subscribable<T>) {
		if (source) {
			try {
				this._cleanup = source.subscribe(this);
			} catch (thrown) {
				this.error(thrown);
			}
		}
	}

	/**
	 * Send the next value to this stream's subscribers.
	 * - Calls `next()` on all subscribers.
	 * - Skips subscribers where `subscriber.closed` is truthy.
	 */
	next(value: Resolvable<T>): void {
		if (this.closed || value === SKIP) return;
		if (value instanceof Promise) return thispatch(this, "next", value, this, "error");

		const start = this._target && this._target < 0 ? this._target : 0;
		const end = this._target && this._target > 0 ? this._target : undefined;
		for (const subscriber of this._subscribers.slice(start, end)) thispatch(subscriber, "next", value);
	}

	/**
	 * Complete this stream with an error.
	 * - Calls `error()` on the subscribers.
	 * - Unsubscribe from the source (if there is one).
	 * - Close this stream.
	 */
	error(reason: Error | unknown): void {
		if (this.closed) return;
		if (reason instanceof Promise) return thispatch(this, "error", reason);

		(this as Mutable<this>).closed = true;
		if (this._cleanup) this._cleanup = void this._cleanup();
		for (const subscriber of this._subscribers.slice()) thispatch(subscriber, "error", reason);
	}

	/**
	 * Complete this stream successfully.
	 * - Calls `complete()` on the subscribers.
	 * - Unsubscribe from the source (if there is one).
	 * - Close this stream.
	 */
	complete(): void {
		if (this.closed) return;

		(this as Mutable<this>).closed = true;
		if (this._cleanup) this._cleanup = void this._cleanup();
		for (const subscriber of this._subscribers.slice()) thispatch(subscriber, "complete");
	}

	/** Subscribe to this `Stream` and return an `UnsubscribeDispatcher` */
	subscribe(next: Observer<T> | AsyncDispatcher<T>, error?: AsyncCatcher, complete?: AsyncEmptyDispatcher): Unsubscriber {
		const subscriber: Observer<T> = typeof next === "function" ? { next, error, complete } : next;
		addItem(this._subscribers, subscriber);
		return () => removeItem(this._subscribers, subscriber);
	}

	/**
	 * Create a new derived stream that completes itself after a limited number of values.
	 * - The name `take()` matches RxJS.
	 *
	 * @param num Number of values to take before `complete()` is called.
	 */
	derive(): Stream<T>;
	derive<TT>(deriver: AsyncDeriver<T, TT>): Stream<TT>;
	derive<TT>(deriver?: AsyncDeriver<T, TT>): Stream<T> | Stream<TT> {
		if (deriver) {
			const stream = new Stream<TT>();
			deriveFrom(this, deriver, stream);
			return stream;
		} else {
			return new Stream<T>(this);
		}
	}

	/**
	 * Create a new derived stream that completes itself after a limited number of values.
	 * - The name `take()` matches RxJS.
	 *
	 * @param num Number of values to take before `complete()` is called.
	 */
	take(num: number): Stream<T> {
		const stream = new Stream<T>();
		takeFrom(this, num, stream);
		return stream;
	}

	/**
	 * Create a new derived stream that only targets some of its subscribers when `next()` is called.
	 * @param num Number of subscribers to call, e.g. `3` for the first three, or `-1` for the last one.
	 */
	target(num: number): Stream<T> {
		const stream = new Stream<T>(this);
		stream._target = num;
		return stream;
	}

	/** Get a Promise that resolves to the next value. */
	get promise(): Promise<T> {
		return new Promise<T>(this._promiseExecutor);
	}

	@bindMethod
	private _promiseExecutor(resolve: AsyncDispatcher<T>, reject: AsyncCatcher): void {
		takeFrom(this, 1, { next: resolve, error: reject });
	}
}

/**
 * Is an unknown value a `Stream` instance?
 * - This is a TypeScript assertion function, so if this function returns `true` the type is also asserted to be a `Stream`.
 */
export const isStream = <T extends Stream<unknown>>(state: T | unknown): state is T => state instanceof Stream;
