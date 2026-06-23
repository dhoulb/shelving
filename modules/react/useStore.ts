import { useSyncExternalStore } from "react";
import type { AnyStore, Store } from "../store/Store.js";
import { BLACKHOLE, type Callback } from "../util/function.js";
import { STOPHOLE, type StopCallback } from "../util/index.js";

// We add an `[EXTERNAL_STORE]` symbol key to the `Store` instance to cache the subscribe and getSnapshot functions for `useSyncExternalStore()`.
const EXTERNAL_STORE: unique symbol = Symbol();
type SubscribeCallback = (onChange: () => void) => StopCallback;
type ExternalStore = {
	subscribe: SubscribeCallback;
	getSnapshot: Callback;
};
const EXTERNAL_BLACKHOLE: ExternalStore = {
	subscribe: STOPHOLE,
	getSnapshot: BLACKHOLE,
};

/**
 * Subscribe to a Shelving `Store` instance to refresh this component when its value changes.
 * - Re-renders the component whenever the store's value changes for as long as it is mounted.
 * - Pass `undefined` to subscribe to nothing (e.g. for conditional subscriptions).
 *
 * @param store `Store` instance to subscribe to, or `undefined` to subscribe to nothing.
 * @returns The same `store` that was passed in (or `undefined`).
 *
 * @example
 * const store = useStore(myStore);
 * return <>{store.value}</>;
 *
 * @see https://shelving.cc/react/useStore
 */
export function useStore<T extends AnyStore>(store: T): T;
export function useStore<T extends AnyStore>(store?: T | undefined): T | undefined;
export function useStore<T, TT>(store: Store<T, TT> | undefined): Store<T, TT> | undefined {
	const { subscribe, getSnapshot } = !store
		? EXTERNAL_BLACKHOLE
		: ((store as { [EXTERNAL_STORE]?: ExternalStore })[EXTERNAL_STORE] ??= {
				subscribe: c => store.subscribe(c, c),
				getSnapshot: () => store.snapshot,
			});
	useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
	return store;
}
