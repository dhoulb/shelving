import { useCallback, useSyncExternalStore } from "react";
import type { AnyStore, Store } from "../store/Store.js";
import { NONE } from "../util/constants.js";
import { BLACKHOLE } from "../util/function.js";
import type { Optional } from "../util/optional.js";
import { runSequence } from "../util/sequence.js";

/** Subscribe to a Shelving `Store` instance to refresh this component when its value changes. */
export function useStore<T extends AnyStore>(store: T): T;
export function useStore<T extends AnyStore>(store?: Optional<T>): T | undefined;
export function useStore<T>(store: Optional<Store<T>>): Store<T> | undefined {
	useSyncExternalStore(
		useCallback(onStoreChange => (store ? runSequence(store, onStoreChange, onStoreChange) : BLACKHOLE), [store]),
		() => (!store ? store : store.loading ? NONE : store.value),
	);
	return store ?? undefined;
}
