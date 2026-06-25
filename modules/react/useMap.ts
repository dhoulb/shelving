import { useRef } from "react";

/**
 * Create a mutable Map that persists for the lifetime of the component.
 * - The same `Map` instance is returned on every render; mutations are not reactive (won't trigger a re-render).
 *
 * @see https://shelving.cc/react/useMap
 */
export function useMap<K, V>(): Map<K, V> {
	return (useRef<Map<K, V>>(undefined).current ??= new Map());
}
