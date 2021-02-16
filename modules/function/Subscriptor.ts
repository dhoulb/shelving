import type { Dependencies } from "../array";
import type { Observer } from "../observe";
import type { Unsubscriber, AsyncDispatcher, AsyncEmptyDispatcher, AsyncCatcher } from "./Dispatcher";

/**
 * Subscriptor: a function that starts a subcription and reports back to an `Observer`
 *
 * @param observer An `Observer` object that the value/error from the subscription should be reported to.
 * @param deps Any other parameters that are needed to configure the subscription.
 * @returns Function to call to end the subscription.
 */
export type Subscriptor<T, D extends Dependencies> = (observer: Observer<T>, ...deps: D) => Unsubscriber;

/** `Subscriptor` that is polymorphic to also allow either the `(observer)` or `(next, error, complete)` argument formats. */
export interface PolymorphicSubscriptor<T> {
	(observer: Observer<T>): Unsubscriber;
	(next: AsyncDispatcher<T>, error: AsyncCatcher, complete: AsyncEmptyDispatcher): Unsubscriber;
	(either: Observer<T> | AsyncDispatcher<T>, error: AsyncCatcher, complete: AsyncEmptyDispatcher): Unsubscriber;
}
