import { AsyncDispatcher, AsyncEmptyDispatcher, Unsubscriber, AsyncCatcher, thispatch, Dispatcher, Catcher, EmptyDispatcher } from "./dispatch.js";
import { isObject } from "./object.js";

/** Observable is any object that has a `subscribe()` method that allows either an `Observer` or separate `next()`, `error()` and `complete()` functions. */
export interface Observable<T> {
	subscribe(observer: Observer<T>): Unsubscriber;
	subscribe(next: AsyncDispatcher<T>, error?: AsyncCatcher, complete?: AsyncEmptyDispatcher): Unsubscriber;
	subscribe(either: Observer<T> | AsyncDispatcher<T>, error?: AsyncCatcher, complete?: AsyncEmptyDispatcher): Unsubscriber;
}

/** Is an unknown object an object implementing `Observable` */
export const isObservable = <T extends AnyObservable>(v: T | unknown): v is T => isObject(v) && typeof v.subscribe === "function";

/** Extract the internal type from an `Observable` */
export type ObservableType<T extends AnyObservable> = T extends Observable<infer X> ? X : never;

/** Any observer (useful for `extends AnyObserver` clauses). */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyObservable = Observable<any>;

/** Subscribable is either an observable object or a function that initiates a subscription to an observer. */
export type Subscribable<X> = Observable<X> | ((observer: Observer<X>) => Unsubscriber);

/** Is an unknown value a `Subscribable` */
export const isSubscribable = <T extends Subscribable<unknown>>(v: T | unknown): v is T => typeof v === "function" || isObservable(v);

/** Start a subscription to a `Subscribable`. */
export function startSubscription<X>(subscribable: Subscribable<X>, observer: Observer<X>): Unsubscriber {
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
	readonly next?: Dispatcher<T>;
	/** End the subscription with an error. */
	readonly error?: Catcher;
	/** End the subscription with success. */
	readonly complete?: EmptyDispatcher;
	/** Whether the subscription has ended (either with success or failure). */
	readonly closed?: boolean;
}

/** Extract the internal type from an `Observer` */
export type ObserverType<T extends AnyObserver> = T extends Observer<infer X> ? X : never;

/** Any observer (useful for `extends AnyObserver` clauses). */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyObserver = Observer<any>;

/** Dispatch the next value to an observer (and if the next value errors, calls the observer's error function). */
export const dispatchNext = <T>(observer: Observer<T>, value: T): void => thispatch(observer, "next", value, observer, "error");

/** Dispatch a complete call an observer (and if the next value errors, calls the observer's error function). */
export const dispatchComplete = <T>(observer: Observer<T>): void => thispatch(observer, "complete", undefined, observer, "error");

/** Dispatch an error value to an observer. */
export const dispatchError = <T>(observer: Observer<T>, error: Error | unknown): void => thispatch(observer, "error", error);

/** Create an `Observer` from a set `next()`, `error()` and `complete()` functions. */
export function createObserver<T>(observer: Observer<T>): Observer<T>;
export function createObserver<T>(next: AsyncDispatcher<T>, error?: AsyncCatcher, complete?: AsyncEmptyDispatcher): Observer<T>;
export function createObserver<T>(either: Observer<T> | AsyncDispatcher<T>, error?: AsyncCatcher, complete?: AsyncEmptyDispatcher): Observer<T>;
export function createObserver<T>(next: Observer<T> | AsyncDispatcher<T>, error?: AsyncCatcher, complete?: AsyncEmptyDispatcher): Observer<T> {
	return typeof next === "object" ? next : ({ next, error, complete } as Observer<T>);
}
