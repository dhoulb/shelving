import { Activity, type ReactNode, useRef } from "react";
import type { AbsolutePath } from "../../util/path.js";

/** A cached page: the rendered node plus a monotonic `used` tick for least-recently-used eviction. */
interface CacheEntry {
	node: ReactNode;
	used: number;
}

/**
 * Props for `<RouteCache>` — the current page `path`, the `cache` size, and the page `children`.
 *
 * @see https://dhoulb.github.io/shelving/ui/router/RouteCache/RouteCacheProps
 */
export interface RouteCacheProps {
	/** Identity of the current page — the cache key. */
	readonly path: AbsolutePath;
	/** Number of recently-visited pages to keep mounted; `0` or less disables caching entirely. */
	readonly cache: number;
	/** The current page to render and cache (wrap it in its own frozen `<Meta>` so hidden pages stay insulated). */
	readonly children: ReactNode;
}

/**
 * Keep-alive page cache: render the current `path` and keep up to `cache` recently-visited pages
 * mounted but hidden (via React's `<Activity>`), so navigating back/forward to a page restores its
 * entire DOM and component state — scroll position, toggles, searches, inputs, focus — untouched.
 *
 * - Pages are kept in a least-recently-used map keyed by `path`; the oldest is unmounted past the limit.
 * - `<Activity mode="hidden">` preserves a hidden page's state while unmounting its effects, so its
 *   subscriptions/observers/timers pause and resume cleanly as it is hidden and shown.
 * - When `cache <= 0` the page is rendered directly with no caching (it unmounts as you leave it).
 *
 * @param props The current `path`, `cache` size, and page `children`.
 * @returns The visible current page plus any cached pages kept alive but hidden.
 * @example <RouteCache path={path} cache={10}><MetaContext value={meta}>{page}</MetaContext></RouteCache>
 * @see https://dhoulb.github.io/shelving/ui/router/RouteCache/RouteCache
 */
export function RouteCache({ path, cache, children }: RouteCacheProps): ReactNode {
	const mapRef = useRef<Map<AbsolutePath, CacheEntry>>(undefined);
	const usedRef = useRef(0);

	// Caching disabled — render the page directly so it unmounts as soon as you leave it.
	if (cache <= 0) return children;

	// Insert or refresh the current page, then evict the least-recently-used pages beyond the limit.
	const map = (mapRef.current ??= new Map());
	const used = ++usedRef.current;
	const entry = map.get(path);
	if (entry) {
		entry.node = children;
		entry.used = used;
	} else {
		map.set(path, { node: children, used });
	}
	while (map.size > cache) map.delete(_findLeastRecentlyUsed(map));

	// Render every cached page; only the current `path` is visible, the rest are kept alive but hidden.
	return Array.from(map, ([key, cached]) => (
		<Activity key={key} mode={key === path ? "visible" : "hidden"}>
			{cached.node}
		</Activity>
	));
}

/** Find the key of the least-recently-used (lowest `used` tick) entry in the cache map. */
function _findLeastRecentlyUsed(map: Map<AbsolutePath, CacheEntry>): AbsolutePath {
	let lruKey!: AbsolutePath;
	let lruUsed = Number.POSITIVE_INFINITY;
	for (const [key, entry] of map) {
		if (entry.used < lruUsed) {
			lruUsed = entry.used;
			lruKey = key;
		}
	}
	return lruKey;
}
