import { useSyncExternalStore } from "react";
import type { AnyStore, Store } from "../store/Store.js";
import { NONE } from "../util/constants.js";
import { BLACKHOLE, type Callback } from "../util/function.js";
import { runSequence } from "../util/sequence.js";
import type { StopCallback } from "../util/start.js";
import { useProps } from "./useProps.js";

/** Subscribe to a Shelving `Store` instance to refresh this component when its value changes. */
export function useStore<T extends AnyStore>(store: T): T;
export function useStore<T extends AnyStore>(store?: T | undefined): T | undefined;
export function useStore<T, TT>(store: Store<T, TT> | undefined): Store<T, TT> | undefined {
	// Store memoized versions of `subscribe()` and `getSnapshot()` so `useSyncExternalStore()` doesn't re-subscribe on every render.
	const internals = useProps<{
		subscribe: (onStoreChange: Callback) => StopCallback;
		getSnapshot: () => T | undefined | typeof NONE;
		store: Store<T, TT> | undefined;
	}>();

	// Update `internals` if `store` changes.
	if (store !== internals.store || !internals.subscribe || !internals.getSnapshot) {
		internals.subscribe = onStoreChange => (store ? runSequence(store, onStoreChange, onStoreChange) : BLACKHOLE);
		internals.getSnapshot = () => (!store ? undefined : store.loading ? NONE : store.value);
		internals.store = store;
	}

	useSyncExternalStore(internals.subscribe, internals.getSnapshot);
	return store;
}
