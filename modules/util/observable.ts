import { logError } from "./error.js";
import { Dispatcher } from "./dispatch.js";
import { isAsync } from "./promise.js";
import { isData } from "./data.js";

/** `Dispatcher` that unsubscribes a subscription. */
export type Unsubscriber = () => void;

/** An object that can initiate a subscription with its `subscribe()`. */
export interface Observable<T> {
	/** Subscribe allows either an `Observer` or separate `next()`, `error()` and `complete()` functions. */
	subscribe(observer: Observer<T>): Unsubscriber;
	subscribe(next: Dispatcher<T>, error?: Dispatcher<unknown>, complete?: Dispatcher<void>): Unsubscriber;
	subscribe(either: Observer<T> | Dispatcher<T>, error?: Dispatcher<unknown>, complete?: Dispatcher<void>): Unsubscriber;
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

/** Start a subscription to a `Subscribable`. */
export function subscribe<X>(subscribable: Subscribable<X>, observer: Observer<X>): Unsubscriber {
	return typeof subscribable === "function" ? subscribable(observer) : subscribable.subscribe(observer);
}

/**
 * Observer
 * - An Observer is used to receive data from an Observable, and is supplied as an argument to subscribe.
 * - All methods are optional.
 * - Compatible with https://github.com/tc39/proposal-observable/
 */
export interface Observer<T> {
	/** Receive the next value. */
	readonly next?: Dispatcher<T> | undefined;
	/** End the subscription with an error. */
	readonly error?: Dispatcher<unknown> | undefined;
	/** End the subscription with success. */
	readonly complete?: Dispatcher<void> | undefined;
	/** Whether the subscription has ended (either with success or failure). */
	readonly closed?: boolean;
}

/** Extract the internal type from an `Observer` */
export type ObserverType<T extends AnyObserver> = T extends Observer<infer X> ? X : never;

/** Any observer (useful for `extends AnyObserver` clauses). */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyObserver = Observer<any>;

/** Dispatch the next value to an observer (and if the next value errors, calls the observer's error function). */
export function dispatchNext<T>(value: T, observer: Observer<T>, handler = logError): void {
	if (observer.next) {
		try {
			const returned = observer.next(value);
			if (isAsync(returned)) returned.then(undefined, handler);
		} catch (thrown) {
			if (observer.error) dispatchError(thrown, observer, handler);
			else handler(thrown);
		}
	}
}

/** Dispatch the next value to an observer (and if the next value errors, calls the observer's error function). */
export function dispatchAsyncNext<T>(value: T | Promise<T>, observer: Observer<T>, handler = logError): void {
	if (observer.next) {
		if (isAsync(value)) value.then(v => dispatchNext(v, observer)).catch(observer.error ? thrown => dispatchError(thrown, observer, handler) : handler);
		else dispatchNext(value, observer);
	}
}

/** Dispatch a complete call an observer (and if the next value errors, calls a handler). */
export function dispatchComplete<T>(observer: Observer<T>, handler = logError): void {
	if (observer.complete) {
		try {
			const returned = observer.complete();
			if (isAsync(returned)) returned.then(undefined, handler);
		} catch (thrown) {
			handler(thrown);
		}
	}
}

/** Dispatch an error value to an observer. */
export function dispatchError<T>(reason: Error | unknown, observer: Observer<T>, handler = logError): void {
	if (observer.error) {
		try {
			const returned = observer.error(reason);
			if (isAsync(returned)) returned.then(undefined, handler);
		} catch (thrown) {
			handler(thrown);
		}
	}
}

/** Create an `Observer` from a set `next()`, `error()` and `complete()` functions. */
export function createObserver<T>(next: Observer<T> | Dispatcher<T>, error?: Dispatcher<unknown>, complete?: Dispatcher<void>): Observer<T> {
	return typeof next === "object" ? next : { next, error, complete };
}
