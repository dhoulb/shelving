import type { Observer } from "../observe";
import type { Arguments } from "./types";
import type { Unsubscriber, AsyncDispatcher, AsyncEmptyDispatcher, AsyncCatcher } from "./Dispatcher";

/**
 * Subscriptor: a function that starts a subcription and reports back to an `Observer`
 *
 * @param observer An `Observer` object that the value/error from the subscription should be reported to.
 * @param ...args Any additional arguments the subscriptor needs.
 * @returns Function to call to end the subscription.
 */
export type Subscriptor<T, A extends Arguments = []> = (observer: Observer<T>, ...args: A) => Unsubscriber;

/** `Subscriptor` that is polymorphic to also allow either the `(observer)` or `(next, error, complete)` argument formats. */
export interface PolymorphicSubscriptor<T> {
	(observer: Observer<T>): Unsubscriber;
	(next: AsyncDispatcher<T>, error?: AsyncCatcher, complete?: AsyncEmptyDispatcher): Unsubscriber;
	(either: Observer<T> | AsyncDispatcher<T>, error?: AsyncCatcher, complete?: AsyncEmptyDispatcher): Unsubscriber;
}
