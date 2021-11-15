import { logError } from "./error.js";
import { Dispatcher, EmptyDispatcher } from "./dispatch.js";
import { isObject } from "./object.js";

/** `Dispatcher` that unsubscribes a subscription. */
export type Unsubscriber = EmptyDispatcher;

/** An object that can initiate a subscription with its `subscribe()`. */
export interface Observable<T> {
	/** Subscribe allows either an `Observer` or separate `next()`, `error()` and `complete()` functions. */
	subscribe(observer: Observer<T>): Unsubscriber;
	subscribe(next: Dispatcher<T>, error?: Dispatcher<unknown>, complete?: EmptyDispatcher): Unsubscriber;
	subscribe(either: Observer<T> | Dispatcher<T>, error?: Dispatcher<unknown>, complete?: EmptyDispatcher): Unsubscriber;
}

/** Any observable (useful for `extends AnyObservable` clauses). */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyObservable = Observable<any>;

/** Is an unknown object an object implementing `Observable` */
export const isObservable = <T extends AnyObservable>(v: T | unknown): v is T => isObject(v) && typeof v.subscribe === "function";

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
	readonly complete?: EmptyDispatcher | undefined;
	/** Whether the subscription has ended (either with success or failure). */
	readonly closed?: boolean;
}

/** Extract the internal type from an `Observer` */
export type ObserverType<T extends AnyObserver> = T extends Observer<infer X> ? X : never;

/** Any observer (useful for `extends AnyObserver` clauses). */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyObserver = Observer<any>;

/** Dispatch the next value to an observer (and if the next value errors, calls the observer's error function). */
export const dispatchNext = <T>(observer: Observer<T>, value: T): void => {
	if (observer.next) {
		try {
			observer.next(value);
		} catch (thrown) {
			dispatchError(observer, thrown);
		}
	}
};

/** Dispatch a complete call an observer (and if the next value errors, calls the observer's error function). */
export const dispatchComplete = <T>(observer: Observer<T>): void => {
	if (observer.complete) {
		try {
			observer.complete();
		} catch (thrown) {
			dispatchError(observer, thrown);
		}
	}
};

/** Dispatch an error value to an observer. */
export const dispatchError = <T>(observer: Observer<T>, reason?: Error | unknown): void => {
	if (observer.error) {
		try {
			observer.error(reason);
		} catch (thrown) {
			logError(thrown);
		}
	}
};

/** Create an `Observer` from a set `next()`, `error()` and `complete()` functions. */
export function createObserver<T>(observer: Observer<T>): Observer<T>;
export function createObserver<T>(next: Dispatcher<T>, error?: Dispatcher<unknown>, complete?: EmptyDispatcher): Observer<T>;
export function createObserver<T>(either: Observer<T> | Dispatcher<T>, error?: Dispatcher<unknown>, complete?: EmptyDispatcher): Observer<T>;
export function createObserver<T>(next: Observer<T> | Dispatcher<T>, error?: Dispatcher<unknown>, complete?: EmptyDispatcher): Observer<T> {
	return typeof next === "object" ? next : { next, error, complete };
}
