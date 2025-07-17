import { useRef } from "react";

/** Create a mutable Map that persist for the lifetime of the component. */
export function useMap<K, V>(): Map<K, V> {
	const ref = useRef<Map<K, V>>(undefined);
	if (!ref.current) ref.current = new Map<K, V>();
	return ref.current;
}
