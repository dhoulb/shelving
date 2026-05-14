import { useRef } from "react";

/** Create a mutable Map that persists for the lifetime of the component. */
export function useMap<K, V>(): Map<K, V> {
	return (useRef<Map<K, V>>(undefined).current ??= new Map());
}
