import { Activity, type ReactNode, useRef } from "react";
import type { AbsolutePath } from "../../util/path.js";
import { matchPathTemplate } from "../../util/template.js";
import { MetaContext, requireMetaURL } from "../misc/MetaContext.js";
import { RoutePathContext, type RoutePathOwner } from "./RoutePath.js";

/** A cached page: the rendered node plus a monotonic `used` tick for least-recently-used eviction. */
interface CacheEntry {
	node: ReactNode;
	used: number;
	readonly owner: RoutePathOwner;
}

/**
 * Props for `<RouteCache>` — the `maxCached` size and the content `children` to keep alive per URL.
 *
 * @see https://shelving.cc/ui/RouteCacheProps
 */
export interface RouteCacheProps {
	/**
	 * Number of recently-visited URLs to keep mounted (but hidden) so the entire state of their subtree —
	 * scroll position of every scroll container, open/closed toggles, in-progress searches, form inputs,
	 * focus — is restored intact when navigating back or forward to them.
	 * - Defaults to `10`. Once the limit is reached the least-recently-visited entry is unmounted.
	 * - Set to `0` (or less) to disable caching and unmount the subtree as you leave each URL.
	 */
	readonly maxCached?: number | undefined;
	/** The content to render for the current URL and keep alive (hidden) for recently-visited URLs. */
	readonly children: ReactNode;
}

/**
 * Keep-alive page cache keyed by the current URL — drop it into a layout around its scrolling content region.
 *
 * - Reads the live URL from the surrounding `<Meta>` context and keeps up to `maxCached` recently-visited
 *   pages mounted but hidden (via React's `<Activity>`), so navigating back/forward to a page restores its
 *   entire DOM and component state — scroll position, toggles, searches, inputs, focus — untouched.
 * - Pages are kept in a least-recently-used map keyed by `path`; the oldest is unmounted past the limit.
 * - A page that owns other paths with `<RoutePath>` stays mounted when the URL changes to one of them.
 * - Each snapshot is frozen under its own `<MetaContext>`, so the same single `children` element resolves a
 *   different page per path and a hidden page never re-renders for someone else's URL.
 * - `<Activity mode="hidden">` preserves a hidden page's state while unmounting its effects, so its
 *   subscriptions/observers/timers pause and resume cleanly as it is hidden and shown.
 * - Because it wraps the scroll container itself (rather than sitting below it inside the router), the
 *   scroll position of every cached page is preserved — surrounding chrome (sidebar, drawer state) stays
 *   outside the cache, so it is neither duplicated nor remounted on navigation.
 * - When `maxCached <= 0` the page is rendered directly with no caching (it unmounts as you leave it).
 *
 * @kind component
 * @see https://shelving.cc/ui/RouteCache
 */
export function RouteCache({ maxCached = 10, children }: RouteCacheProps): ReactNode {
	// Read the live URL from context; each navigation re-renders this with the new path.
	const meta = requireMetaURL();
	const mapRef = useRef<Map<AbsolutePath, CacheEntry>>(undefined);
	const usedRef = useRef(0);

	// Caching disabled — render the page directly so it unmounts as soon as you leave it.
	if (maxCached <= 0) return <MetaContext value={meta}>{children}</MetaContext>;

	// Find the page for this path: its own entry, else the most recent page that owns the path with `<RoutePath>`.
	const map = (mapRef.current ??= new Map());
	const key = map.has(meta.path) ? meta.path : (_findOwner(map, meta.path) ?? meta.path);
	const entry = map.get(key) ?? { node: null, used: 0, owner: {} };
	map.set(key, entry);

	// Snapshot the children under the live URL (frozen) so each kept-alive copy keeps rendering for the URL
	// it was captured at — the same `children` element resolves a different page per path.
	entry.node = (
		<RoutePathContext value={entry.owner}>
			<MetaContext value={meta}>{children}</MetaContext>
		</RoutePathContext>
	);
	entry.used = ++usedRef.current;

	// Evict the least-recently-used pages beyond the limit.
	while (map.size > maxCached) map.delete(_findLeastRecentlyUsed(map));

	// Render every cached page; only the current one is visible, the rest are kept alive but hidden.
	return Array.from(map, ([k, cached]) => (
		<Activity key={k} mode={k === key ? "visible" : "hidden"}>
			{cached.node}
		</Activity>
	));
}

/** Find the key of the most-recently-used entry whose `<RoutePath>` owns a path, or `undefined` if none does. */
function _findOwner(map: Map<AbsolutePath, CacheEntry>, path: AbsolutePath): AbsolutePath | undefined {
	let ownerKey: AbsolutePath | undefined;
	let ownerUsed = Number.NEGATIVE_INFINITY;
	for (const [key, { owner, used }] of map) {
		if (owner.path && used > ownerUsed && matchPathTemplate(owner.path, path)) {
			ownerUsed = used;
			ownerKey = key;
		}
	}
	return ownerKey;
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
