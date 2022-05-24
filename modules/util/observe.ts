import { ConditionError } from "../error/ConditionError.js";
import type { Entries } from "./entry.js";
import { dispatch, Dispatcher } from "./function.js";
import { Handler, logError } from "./error.js";
import { Data, isData, Results } from "./data.js";
import { transform, Transformable, Transformer } from "./transform.js";
import { validate, Validator } from "./validate.js";
import { getMap } from "./map.js";

/** Function that ends a subscription. */
export type Unsubscriber = () => void;

/** An object that can initiate a subscription with its `subscribe()`. */
export interface Observable<T> {
	subscribe(observer: Observer<T> | Dispatcher<[T]>): Unsubscriber;
}

/** Any observable (useful for `extends AnyObservable` clauses). */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyObservable = Observable<any>;

/** Is an unknown object an object implementing `Observable` */
export const isObservable = <T extends AnyObservable>(v: T | unknown): v is T => isData(v) && typeof v.subscribe === "function";

/** Extract the internal type from an `Observable` */
export type ObservableType<T extends AnyObservable> = T extends Observable<infer X> ? X : never;

/** Subscribable is either an observable object or a function that initiates a subscription to an observer. */
export type Subscribable<X> = Observable<X> | ((observer: Observer<X>) => Unsubscriber);

/** Any subscribable (useful for `extends AnySubscribable` clauses). */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnySubscribable = Subscribable<any>;

/** Is an unknown value a `Subscribable` */
export const isSubscribable = <T extends Subscribable<unknown>>(v: T | unknown): v is T => typeof v === "function" || isObservable(v);

/** Extract the internal type from an `Subscribable` */
export type SubscribableType<T extends AnySubscribable> = T extends Subscribable<infer X> ? X : never;

/** Start a subscription to a `Subscribable` and return the `Unsubscriber` function. */
export function subscribe<X>(source: Subscribable<X>, target: Observer<X>): Unsubscriber {
	if (target.closed) throw new ConditionError("Target is closed");
	return typeof source === "function" ? source(target) : source.subscribe(target);
}

/**
 * Observer
 * - An Observer is used to receive data from an Observable, and is supplied as an argument to subscribe.
 * - All methods are optional.
 * - Compatible with https://github.com/tc39/proposal-observable/
 */
export interface Observer<T> {
	/**
	 * Start a subscription from a source to a target.
	 * - Started subscriptions should be cleaned up when this observer is closed.
	 * - If `target` is undefiend it should default to this observer instance.
	 */
	readonly from?: (source: Subscribable<T>) => this;
	/** Receive the next value. */
	readonly next?: Dispatcher<[T]>;
	/** End the subscription with an error. */
	readonly error?: Handler;
	/** End the subscription with success. */
	readonly complete?: Dispatcher;
	/** Whether the subscription has ended (either with success or failure). */
	readonly closed?: boolean;
}

/** Extract the internal type from an `Observer` */
export type ObserverType<T extends AnyObserver> = T extends Observer<infer X> ? X : never;

/** Any observer (useful for `extends AnyObserver` clauses). */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyObserver = Observer<any>;

/** Dispatch the next value to an observer (and if the next value errors, calls a handler). */
export function dispatchNext<T>(observer: Observer<T>, value: T): void {
	try {
		observer.next?.(value);
	} catch (thrown) {
		logError(thrown);
	}
}

/** Dispatch the next value to an observer (and if the next value errors, calls a handler). */
export function dispatchAsyncNext<T>(observer: Observer<T>, value: PromiseLike<T>): void {
	value.then(
		v => dispatchNext(observer, v),
		e => dispatchError(observer, e),
	);
}

/** Dispatch a complete call an observer (and if the next value errors, calls a handler). */
export function dispatchComplete<T>(observer: Observer<T>): void {
	try {
		observer.complete?.();
	} catch (thrown) {
		logError(thrown);
	}
}

/** Dispatch an error value to an observer. */
export function dispatchError<T>(observer: Observer<T>, reason: Error | unknown): void {
	try {
		observer.error?.(reason);
	} catch (thrown) {
		logError(thrown);
	}
}

/** Abstract observer designed to pass values through to an observer. */
export abstract class AbstractObserver<I, O> implements Observer<I> {
	protected _cleanup: Unsubscriber | undefined;
	protected _target: Observer<O> | undefined;
	get closed(): boolean {
		return !this._target;
	}
	constructor(target: Observer<O>) {
		if (target.closed) throw new ConditionError("Target is closed");
		this._target = target;
	}
	from(source: Subscribable<I>): this {
		if (this._cleanup) throw new ConditionError("Observer already started");
		if (!this._target) throw new ConditionError("Observer is closed");
		const cleanup = subscribe(source, this);
		if (this._target) this._cleanup = cleanup;
		return this;
	}
	abstract next(value: I): void;
	error(reason: Error | unknown): void {
		const target = this._target;
		if (!target) throw new ConditionError("Observer is closed");
		this._close();
		dispatchError(target, reason);
	}
	complete(): void {
		const target = this._target;
		if (!target) throw new ConditionError("Observer is closed");
		this._close();
		dispatchComplete(target);
	}
	protected _close(): void {
		if (this._target) this._target = undefined;
		if (this._cleanup) this._cleanup = void dispatch(this._cleanup);
	}
}

/** Observer that unsubscribes.*/
export class ThroughObserver<T> extends AbstractObserver<T, T> {
	next(value: T): void {
		if (!this._target) throw new ConditionError("Observer is closed");
		dispatchNext(this._target, value);
	}
}

/** Observer that fires once then ends itself. */
export class OnceObserver<T> extends ThroughObserver<T> {
	override next(value: T) {
		super.next(value);
		this.complete();
	}
}

/** Observer implementing `Transformable` that implements a `transform()` property that is called to transform the next value before dispatching it. */
export abstract class TransformableObserver<I, O> extends AbstractObserver<I, O> implements Transformable<I, O> {
	next(value: I) {
		const target = this._target;
		if (!target) throw new ConditionError("Observer is closed");
		dispatchNext(target, this.transform(value));
	}
	abstract transform(input: I): O;
}

/** Observer that transforms its next values with a transformer. */
export class TransformObserver<I, O> extends TransformableObserver<I, O> {
	protected _transformer: Transformer<I, O>;
	constructor(transformer: Transformer<I, O>, target: Observer<O>) {
		super(target);
		this._transformer = transformer;
	}
	transform(value: I) {
		return transform(value, this._transformer);
	}
}

/** Observer that transforms a set of entries into a results map. */
export class ResultsObserver<T extends Data> extends TransformableObserver<Entries<T>, Results<T>> {
	transform(entries: Entries<T>): Results<T> {
		return getMap(entries);
	}
}

/** Observer that validates its next values with a validator. */
export class ValidateObserver<T> extends TransformableObserver<unknown, T> {
	protected _validator: Validator<T>;
	constructor(validator: Validator<T>, target: Observer<T>) {
		super(target);
		this._validator = validator;
	}
	transform(value: unknown) {
		return validate(value, this._validator);
	}
}

/** Observer that allows promised values to be passed to `next()`. */
export class AsyncObserver<T> extends AbstractObserver<PromiseLike<T>, T> {
	next(value: PromiseLike<T>) {
		const target = this._target;
		if (!target) throw new ConditionError("Observer is closed");
		dispatchAsyncNext(target, value);
	}
}

/** Get a promise that resolves to the next value of a source subscribable. */
export function awaitNext<T>(source: Subscribable<T>): Promise<T> {
	return new Promise((next, error) => new OnceObserver<T>({ next, error }).from(source));
}

/** Get a promise that resolves when a source subscribable is complete. */
export function awaitComplete<T>(source: Subscribable<T>): Promise<void> {
	return new Promise((complete, error) => new ThroughObserver<T>({ complete, error }).from(source));
}
