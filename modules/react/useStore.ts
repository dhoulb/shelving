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

/** Subscribe to a Shelving `Store` instance to refresh this component when its value changes. */
export function useStore<T extends AnyStore>(store: T): T;
export function useStore<T extends AnyStore>(store?: T | undefined): T | undefined;
export function useStore<T, TT>(store: Store<T, TT> | undefined): Store<T, TT> | undefined {
	const { subscribe, getSnapshot } = !store
		? EXTERNAL_BLACKHOLE
		: ((store as { [EXTERNAL_STORE]?: ExternalStore })[EXTERNAL_STORE] ??= {
				subscribe: c => store.subscribe(c, c),
				getSnapshot: () => store.snapshot,
			});
	useSyncExternalStore(subscribe, getSnapshot);
	return store;
}
