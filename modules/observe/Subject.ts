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
	private readonly _sources = new Set<Unsubscribe>();
	get sources(): Iterable<Unsubscribe> {
		return this._sources.values();
	}

	/** List of subscribed observers that values are forwarded to. */
	private readonly _observers = new Set<PartialObserver<T>>();
	get observers(): Iterable<PartialObserver<T>> {
		return this._observers.values();
	}

	/** Get the number of current connections. */
	get connections(): number {
		return this._sources.size;
	}

	/** Get the number of current subscribers. */
	get subscribers(): number {
		return this._observers.size;
	}

	/** Is this subject open or closed (i.e. `error()` or `complete()` have been called. */
	readonly closed: boolean = false;

	next(value: T): void {
		if (this.closed) throw new ConditionError(`Observer is closed`);
		this._dispatch(value);
	}

	/** Call `next()` on the subscribers. */
	protected _dispatch(value: T): void {
		for (const observer of this._observers) dispatchNext(observer, value);
	}

	error(reason: Error | unknown): void {
		if (this.closed) throw new ConditionError(`Observer is closed`);
		this._close();
		for (const observer of this._observers) {
			this._removeObserver(observer);
			dispatchError(observer, reason);
		}
	}

	complete(): void {
		if (this.closed) throw new ConditionError(`Observer is closed`);
		this._close();
		for (const observer of this._observers) {
			this._removeObserver(observer);
			dispatchComplete(observer);
		}
	}

	/** Close this subject (called by `error()` and `complete()`). */
	protected _close(): void {
		(this as Mutable<this>).closed = true;
		for (const cleanup of this._sources) dispatch(cleanup); // Cleanups are self-cleaning.
	}

	/** Connect this subject to a source. */
	connect(source: Subscribable<T>): Unsubscribe {
		if (this.closed) throw new ConditionError(`Connectable is closed`);
		const unsubscribe = subscribe(source, this);
		const cleanup = () => {
			this._sources.delete(cleanup);
			dispatch(unsubscribe);
		};
		this._sources.add(cleanup);
		return cleanup;
	}

	/**
	 * Subscribe to this subject and return an unsubscriber function.
	 * - Allows either an `Observer` object or  separate `next()", `error()` and `complete()` functions.
	 * - Implements `Observable`
	 */
	subscribe(target: PartialObserver<T> | Dispatch<[T]>): Unsubscribe {
		if (this.closed) throw new ConditionError(`Observable is closed`);
		const observer = typeof target === `function` ? { next: target } : target;
		if (observer.closed) throw new ConditionError("Target is closed");
		this._addObserver(observer);
		return this._removeObserver.bind(this, observer);
	}

	/** Add an observer (called by `subscribe()`). */
	protected _addObserver(observer: PartialObserver<T>): void {
		this._observers.add(observer);
	}

	/** Remove an observer. */
	protected _removeObserver(observer: PartialObserver<T>): void {
		this._observers.delete(observer);
	}
}
