import { startTransition, useEffect, useState } from "react";
import type { AnyStore } from "../../store/Store.js";

/**
 * Read a store's value, and re-render inside `startTransition()` when it changes, so `<ViewTransition>` boundaries animate.
 *
 * - `useStore()` uses `useSyncExternalStore()`, and React always applies those updates synchronously. A synchronous update never starts a view transition.
 * - This hook copies the value into React state inside `startTransition()` instead.
 * - Internal for now: not exported from the `shelving/ui` barrel.
 *
 * @param store The store to read. Its value must not be loading or failed.
 * @returns The store's current value.
 */
export function useTransitionValue<S extends AnyStore>(store: S): S["value"] {
	const [value, setValue] = useState<S["value"]>(() => store.value);
	useEffect(() => store.subscribe((v: S["value"]) => startTransition(() => setValue(() => v))), [store]);
	return value;
}
