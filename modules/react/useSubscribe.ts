import { useState } from "react";
import { Subscribable, subscribe } from "../util/observe.js";
import { NOVALUE } from "../util/constants.js";
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
	usePureEffect(_subscribeEffect, useState<unknown>(NOVALUE)[1], subscribable);
}

/** Effect that subscribes the component to changes in the subscribable for the lifetime of the component. */
const _subscribeEffect = <T>(onNext: (next: unknown) => void, subscribable?: Subscribable<T>) => (subscribable ? subscribe(subscribable, { next: onNext, error: onNext }) : undefined);
