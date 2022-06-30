import { ConditionError } from "../error/ConditionError.js";
import type { Dispatch } from "../util/function.js";
import type { PartialObserver } from "./Observer.js";

/** Function that ends a subscription. */
export type Unsubscribe = () => void;

/** An object that can subscribed to. */
export interface Observable<T> {
	/** Subscribe an observer to this observable. */
	subscribe(observer: PartialObserver<T> | Dispatch<[T]>): Unsubscribe;
}

/** Subscribe function is a function that initiates a subscription to an observer. */
export type Subscribe<T> = (observer: PartialObserver<T>) => Unsubscribe;

/** Subscribable is either an observable object or a subscribe function. */
export type Subscribable<T> = Observable<T> | Subscribe<T>;

/** Start a subscription to a `Subscribable` and return the `Unsubscriber` function. */
export function subscribe<T>(source: Subscribable<T>, target: PartialObserver<T>): Unsubscribe {
	if (target.closed) throw new ConditionError("Target is closed");
	return typeof source === "function" ? source(target) : source.subscribe(target);
}

/** Function that disconnects a souce. */
export type Disconnect = () => void;

/** An object that can be connected to a subscribable. */
export interface Connectable<T> {
	/** Subscribe this entity to a subscribable. */
	connect(subscribable: Subscribable<T>): Disconnect;
}
