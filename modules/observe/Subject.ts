import type { Mutable } from "../util/data.js";
import { ConditionError } from "../error/ConditionError.js";
import { dispatch, Dispatch } from "../util/function.js";
import { ConnectableObserver, dispatchComplete, dispatchError, dispatchNext, PartialObserver } from "./Observer.js";
import { Observable, Subscribable, subscribe, Unsubscribe } from "./Observable.js";

/**
 * Simple subject
 * - Subject combines `Observer` and `Observable`.
 * - Multiple observers can subscribe and values are multicase to all of them.
 * - Does no deriving (input and output types are the same).
 */
export class Subject<T> implements Observable<T>, ConnectableObserver<T> {
	/** List of sources this subject is subscribed to. */
	protected readonly _cleanups = new Set<Unsubscribe>();

	/** List of subscribed observers that values are forwarded to. */
	protected readonly _subscribers = new Set<PartialObserver<T>>();

	/** Get the number of current subscribers. */
	get connections(): number {
		return this._cleanups.size;
	}

	/** Get the number of current subscribers. */
	get subscribers(): number {
		return this._subscribers.size;
	}

	/** Is this subject open or closed (i.e. `error()` or `complete()` have been called. */
	readonly closed: boolean = false;

	next(value: T): void {
		if (this.closed) throw new ConditionError("Subject is closed");
		this._dispatch(value);
	}

	/** Call `next()` on the subscribers. */
	protected _dispatch(value: T): void {
		for (const observer of this._subscribers) dispatchNext(observer, value);
	}

	error(reason: Error | unknown): void {
		if (this.closed) throw new ConditionError("Subject is closed");
		this._close();
		for (const subscriber of this._subscribers) {
			this._subscribers.delete(subscriber);
			dispatchError(subscriber, reason);
		}
	}

	complete(): void {
		if (this.closed) throw new ConditionError("Subject is closed");
		this._close();
		for (const subscriber of this._subscribers) {
			this._subscribers.delete(subscriber);
			dispatchComplete(subscriber);
		}
	}

	/** Close this subject (called by `error()` and `complete()`). */
	private _close(): void {
		(this as Mutable<this>).closed = true;
		this.disconnect();
	}

	/** Connect this subjet to a source. */
	connect(source: Subscribable<T>): Unsubscribe {
		if (this.closed) throw new ConditionError("Subject is closed");
		const unsubscribe = subscribe(source, this);
		const cleanup = () => {
			dispatch(unsubscribe);
			this._cleanups.delete(cleanup);
		};
		this._cleanups.add(cleanup);
		return cleanup;
	}

	/** Disconnect this subject from all sources. */
	disconnect(): void {
		for (const cleanup of this._cleanups) dispatch(cleanup); // Cleanups are self-cleaning.
	}

	/**
	 * Subscribe to this subject and return an unsubscriber function.
	 * - Allows either an `Observer` object or  separate `next()`, `error()` and `complete()` functions.
	 * - Implements `Observable`
	 */
	subscribe(next: PartialObserver<T> | Dispatch<[T]>): Unsubscribe {
		const observer = typeof next === "function" ? { next } : next;
		this._addObserver(observer);
		return this._removeObserver.bind(this, observer);
	}

	/** Add an observer (called by `subscribe()`). */
	protected _addObserver(observer: PartialObserver<T>): void {
		const size = this._subscribers.size;
		this._subscribers.add(observer);
		if (!size && this._subscribers.size) this._addFirstObserver();
	}

	/** Called after adding the first observer. */
	protected _addFirstObserver(): void {
		//
	}

	/** Remove an observer. */
	protected _removeObserver(observer: PartialObserver<T>): void {
		this._subscribers.delete(observer);
		if (!this._subscribers.size) this._removeLastObserver();
	}

	/** Called after adding the first observer. */
	protected _removeLastObserver(): void {
		// Nothing.
	}
}
