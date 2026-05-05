import { type RefObject, useEffect, useRef } from "react";
import type { Callback, Nullish } from "shelving";

/**
 * Fires a callback when an element enters the visible scrolling area on the client.
 * - Checks that is the last element in its parent.
 * - Finds the closest parent above this that scrolls (e.g. `.page`, customisable with `selector` param), then fires the callbacks appropriately.
 */
export function useScrollIntersect<T extends HTMLElement>(onEnter?: Nullish<Callback>, onLeave?: Nullish<Callback>): RefObject<T | null> {
	const ref = useRef<T | null>(null);
	useEffect(() => {
		const el = ref.current;
		if (el) {
			const observer = new IntersectionObserver(
				([entry]) => {
					if (entry) {
						if (entry.isIntersecting) onEnter?.();
						if (!entry.isIntersecting) onLeave?.();
					}
				},
				{ threshold: [1] },
			);
			observer.observe(el);
			return () => observer.disconnect();
		}
	}, [onEnter, onLeave]);
	return ref;
}

/** Go through a list of `IntersectionObserverEntry` (from `IntersectionObserver`) and return the index of the one with the highest `intersectionRatio` */
export function getMostVisibleObserverEntry(entries: IntersectionObserverEntry[]): IntersectionObserverEntry | undefined {
	return entries.reduce<IntersectionObserverEntry | undefined>(_reduceMostVisibleObserverEntry, undefined);
}
function _reduceMostVisibleObserverEntry(
	mostVisible: IntersectionObserverEntry | undefined,
	current: IntersectionObserverEntry,
): IntersectionObserverEntry | undefined {
	return mostVisible && mostVisible.intersectionRatio > current.intersectionRatio ? mostVisible : current;
}
