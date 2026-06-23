import { type RefObject, useEffect, useRef } from "react";
import type { Callback } from "../../util/function.js";
import type { Nullish } from "../../util/null.js";

/**
 * Fire callbacks when a referenced element enters or leaves the visible scrolling area.
 *
 * - Returns a `ref` to attach to the element you want to observe — typically the last item in a scrolling list, for infinite-scroll loading.
 * - Uses an `IntersectionObserver` with a full-visibility threshold and disconnects it on unmount or when callbacks change.
 *
 * @param onEnter Called when the element becomes fully visible.
 * @param onLeave Called when the element stops being fully visible.
 * @returns A React `ref` to attach to the element to observe.
 * @example const ref = useScrollIntersect(loadMore); return <div ref={ref} />;
 * @see https://shelving.cc/ui/useScrollIntersect
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

/**
 * Find the most-visible entry in a list of `IntersectionObserverEntry` objects.
 *
 * - Returns the entry with the highest `intersectionRatio`, or `undefined` for an empty list.
 *
 * @param entries The observer entries to compare (e.g. from an `IntersectionObserver` callback).
 * @returns The entry with the largest visible ratio, or `undefined` when `entries` is empty.
 * @example getMostVisibleObserverEntry(entries)?.target;
 * @see https://shelving.cc/ui/getMostVisibleObserverEntry
 */
export function getMostVisibleObserverEntry(entries: IntersectionObserverEntry[]): IntersectionObserverEntry | undefined {
	return entries.reduce<IntersectionObserverEntry | undefined>(_reduceMostVisibleObserverEntry, undefined);
}
function _reduceMostVisibleObserverEntry(
	mostVisible: IntersectionObserverEntry | undefined,
	current: IntersectionObserverEntry,
): IntersectionObserverEntry | undefined {
	return mostVisible && mostVisible.intersectionRatio > current.intersectionRatio ? mostVisible : current;
}
