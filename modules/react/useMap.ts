import { useRef } from "react";

/**
 * Create a mutable Map that persists for the lifetime of the component.
 * - The same `Map` instance is returned on every render; mutations are not reactive (won't trigger a re-render).
 *
 * @returns Stable `Map` instance that lives for the lifetime of the component.
 *
 * @example
 * const cache = useMap<string, number>();
 * cache.set("a", 1);
 *
 * @see https://dhoulb.github.io/shelving/react/useMap
 */
export function useMap<K, V>(): Map<K, V> {
	return (useRef<Map<K, V>>(undefined).current ??= new Map());
}
