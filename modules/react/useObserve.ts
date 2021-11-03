import { useState as useReactState } from "react";
import { Dispatcher, LOADING, Observable } from "../index.js";
import { usePureEffect } from "./usePureEffect.js";

/**
 * Subscribe to an `Observable` such that when the observer issues a next value or an error the component refreshes.
 * - Unsubscribes again when the component detaches.
 *
 * @param observer An object implementing the `Observer` interface, or `undefined` to skip subscribing to anything.
 */
export function useObserve<T>(observer?: Observable<T>): void {
	// Effect that subscribes the component to changes in the `State` instance for the lifetime of the component.
	usePureEffect(subscribeEffect, useReactState<unknown>(LOADING)[1], observer);
}

/** Effect that subscribes the component to changes in the `State` instance for the lifetime of the component. */
const subscribeEffect = <T>(setChange: Dispatcher<unknown>, observer?: Observable<T>) => (observer ? observer.subscribe(setChange, setChange) : undefined);
