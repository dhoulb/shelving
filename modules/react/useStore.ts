import { useRef, useSyncExternalStore } from "react";
import type { AnyStore, Store } from "../store/Store.js";
import type { Callback } from "../util/callback.js";
import { NONE } from "../util/constants.js";
import { BLACKHOLE } from "../util/function.js";
import { runSequence } from "../util/sequence.js";

/** Subscribe to a Shelving `Store` instance to refresh this component when its value changes. */
export function useStore<T extends AnyStore>(store: T): T;
export function useStore<T extends AnyStore>(store?: T | undefined): T | undefined;
export function useStore<T>(store: Store<T> | undefined): Store<T> | undefined {
	// Store memoized versions of `subscribe()` and `getSnapshot()` so `useSyncExternalStore()` doesn't re-subscribe on every render.
	// biome-ignore lint/suspicious/noAssignInExpressions: This is the most efficient way to do this.
	const internals = (useRef<{
		subscribe: (onStoreChange: Callback) => Callback;
		getSnapshot: () => T | undefined | typeof NONE;
		store: Store<T> | undefined;
	}>().current ||= {
		subscribe: (onStoreChange: Callback): Callback => (store ? runSequence(store, onStoreChange, onStoreChange) : BLACKHOLE),
		getSnapshot: (): T | undefined | typeof NONE => (!internals.store ? undefined : internals.store.loading ? NONE : internals.store.value),
		store,
	});

	// Update `subscribe` if `store` changes.
	if (store !== internals.store) {
		internals.subscribe = onStoreChange => (store ? runSequence(store, onStoreChange, onStoreChange) : BLACKHOLE);
		internals.store = store;
	}

	useSyncExternalStore(internals.subscribe, internals.getSnapshot);
	return store;
}
