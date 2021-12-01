import { useState } from "react";
import { Dispatcher, LOADING, Subscribable, subscribe } from "../index.js";
import { usePureEffect } from "./usePureEffect.js";

/**
 * Subscribe to an `Subscribable` such that when the observer issues a next value or an error the component refreshes.
 * - Unsubscribes again when the component detaches.
 *
 * @param subscribable An object implementing the `Subscribable` interface, or `undefined` to skip subscribing to anything.
 * - Every time `subscribable` changes the subscription will be recreated.
 * - Memoise this value if you want the subscription to persist for the life of the component.
 */
export function useSubscribe<T>(subscribable?: Subscribable<T>): void {
	// Effect that subscribes the component to changes in the `State` instance for the lifetime of the component.
	usePureEffect(subscribeEffect, useState<unknown>(LOADING)[1], subscribable);
}

/** Effect that subscribes the component to changes in the `State` instance for the lifetime of the component. */
const subscribeEffect = <T>(setChange: Dispatcher<unknown>, subscribable?: Subscribable<T>) =>
	subscribable ? subscribe(subscribable, { next: setChange, error: setChange }) : undefined;
