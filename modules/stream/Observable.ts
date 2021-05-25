import { AsyncCatcher, AsyncDispatcher, AsyncEmptyDispatcher, Unsubscriber } from "../function";
import { isObject } from "../object";
import type { Observer } from "./Observer";

/** Observable is any object that has a `subscribe()` method that allows either an `Observer` or separate `next()`, `error()` and `complete()` functions. */
export interface Observable<T> {
	subscribe(observer: Observer<T>): Unsubscriber;
	subscribe(next: AsyncDispatcher<T>, error?: AsyncCatcher, complete?: AsyncEmptyDispatcher): Unsubscriber;
	subscribe(either: Observer<T> | AsyncDispatcher<T>, error?: AsyncCatcher, complete?: AsyncEmptyDispatcher): Unsubscriber;
}

/** Is an unknown object an object implementing `Observable` */
export const isObservable = <T extends Observable<unknown>>(value: T | unknown): value is T => isObject(value) && typeof value.subscribe === "function";
