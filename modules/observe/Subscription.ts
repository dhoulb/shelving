import { SKIP } from "../constants";
import { Resolvable } from "../data";
import { AsyncDeriver, dispatch, thispatch, Unsubscriber } from "../function";
import { Subscribable } from "./Subscribable";
import { Observer } from "./Observer";

/**
 * Subscription: represents a subscription between a source observable and a target observer.
 * - Repeats all values/errors/completes from source to target.
 * - Unsubscribes from the source on complete or error.
 * - Can be manually unsubscribed by calling `complete()`
 * - Knows how to deal with `Promises` and `SKIP` in
 */
class Subscription<T> implements Observer<T> {
	private _target: Observer<T>;
	private _cleanup: Unsubscriber | undefined;
	constructor(source: Subscribable<T>, target: Observer<T>) {
		this._target = target;
		try {
			this._cleanup = source.subscribe(this);
		} catch (thrown) {
			thispatch(this._target, "error", thrown);
		}
	}
	get closed(): boolean {
		return !this._cleanup;
	}
	next(next: Resolvable<T>): void {
		if (this._cleanup) {
			thispatch(this._target, "next", next, this, "error");
		}
	}
	error(error: Error | unknown): void {
		if (this._cleanup) {
			dispatch(this._cleanup);
			this._cleanup = undefined;
			thispatch(this._target, "error", error);
		}
	}
	complete(): void {
		if (this._cleanup) {
			dispatch(this._cleanup);
			this._cleanup = undefined;
			thispatch(this._target, "complete", undefined);
		}
	}
}
export const repeatFrom = <T>(source: Subscribable<T>, target: Observer<T>): Subscription<T> => new Subscription(source, target);

/** Deriving subscription: a subscription that modifies the next value before repeating it. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
class DerivingSubscription<I, O> extends Subscription<any> implements Observer<I> {
	private _deriver: AsyncDeriver<I, O>;
	constructor(source: Subscribable<I>, deriver: AsyncDeriver<I, O>, target: Observer<O>) {
		super(source, target);
		this._deriver = deriver;
	}
	next(value: Resolvable<I>): void {
		if (this.closed || value === SKIP) return;
		if (value instanceof Promise) return thispatch(this, "next", value);
		try {
			this.derived(this._deriver(value));
		} catch (thrown) {
			this.error(thrown); // Deriving break the subscription.
		}
	}

	/** Send the next derived value to the target. */
	derived(value: Resolvable<O>): void {
		super.next(value);
	}
}
export const deriveFrom = <I, O>(source: Subscribable<I>, deriver: AsyncDeriver<I, O>, target: Observer<O>): DerivingSubscription<I, O> =>
	new DerivingSubscription(source, deriver, target);

/** Taking subscription: a subscription that takes a specified number of values then completes itself. */
class TakingSubscription<T> extends Subscription<T> {
	private _remaining: number;
	constructor(source: Subscribable<T>, target: Observer<T>, num: number) {
		super(source, target);
		this._remaining = num;
		if (this._remaining <= 0) this.complete();
	}
	next(value: Resolvable<T>): void {
		if (this.closed) return;
		super.next(value);
		this._remaining--;
		if (this._remaining <= 0) this.complete();
	}
}
export const takeFrom = <T>(source: Subscribable<T>, num: number, target: Observer<T>): TakingSubscription<T> => new TakingSubscription(source, target, num);
