import { Activity, type ReactNode, useRef } from "react";
import type { AbsolutePath } from "../../util/path.js";
import { MetaContext, requireMetaURL } from "../misc/MetaContext.js";
import { mergeMeta } from "../util/meta.js";

/** A cached page: the rendered node, where it is in its stack, and a `used` tick for least-recently-used eviction. */
interface _CacheEntry {
	node: ReactNode;
	used: number;
	readonly stack: AbsolutePath | null;
	readonly ordinal: number;
}

/**
 * Props for `<RouteCache>`: the `maxCached` size and the content `children` to keep alive for each page in the stacks.
 *
 * @see https://shelving.cc/ui/RouteCacheProps
 */
export interface RouteCacheProps {
	/**
	 * Number of pages to keep mounted (but hidden), so the whole state of each one (scroll position, toggles, searches, form input, focus) is still there when you come back to it.
	 * - The root page and the last page you saw in each listed stack are never dropped, even past the limit, so a tab always shows the page you left and always has its root below.
	 * - Floating pages get no such protection.
	 * - Keep it at `2` or more, so a swipe-back can show the page below and still keep the page you are leaving.
	 * - Set to `0` (or less) to turn the cache off and unmount each page as you leave it.
	 *
	 * @default 10
	 */
	readonly maxCached?: number | undefined;
	/** The content to render for the current page and keep alive (hidden) for the other pages in the stacks. */
	readonly children: ReactNode;
}

/**
 * Keep-alive page cache for the pages in the navigation stacks. Put it in a layout's content slot, around a `<Scroll vertical cover>` box.
 *
 * - Put a page transition around it, and a `<Scroll vertical cover>` inside it, so each kept page scrolls in its own box.
 * - Keeps each page mounted but hidden (with React's `<Activity>`), so going back to a page, or switching back to a tab, shows it exactly as you left it.
 * - Each page is keyed by the `stack` and `ordinal` in `Meta`, not by its URL. So `NavigationSequence.replace()` (a canonical URL, an in-page tab) keeps the same page mounted, and the same URL open in two tabs is two separate pages.
 * - It knows nothing about history. It only drops pages when it has more than `maxCached`: first the pages deeper than the current page in its stack (pages you went back from), then the least recently used. So after a back, a forward shows the page as you left it, and a cancelled swipe-back still has the page it started from.
 * - The root page and the last page you saw in each listed stack are never dropped. Floating pages (stack `null`) get no such protection.
 * - When the current page is deeper than its stack's root and the root page is not cached (for example after a deep link), the root page is rendered hidden, so a swipe-back can show it.
 * - Each kept page is frozen under its own `<MetaContext>`, so the same `children` element renders a different page for each URL, and a hidden page never re-renders for another page's URL.
 * - `<Activity mode="hidden">` keeps a hidden page's state but unmounts its effects, so its subscriptions and timers pause and resume as it is hidden and shown.
 * - With no `ordinal` in `Meta` (older browsers, server renders), or with `maxCached` of `0`, it renders the current page directly with no cache.
 *
 * @kind component
 * @see https://shelving.cc/ui/RouteCache
 */
export function RouteCache({ maxCached = 10, children }: RouteCacheProps): ReactNode {
	// Read the page from meta; each navigation re-renders this with the new page.
	const meta = requireMetaURL();
	const { stack = null, ordinal } = meta;
	const mapRef = useRef<Map<string, _CacheEntry>>(undefined);
	const usedRef = useRef(0);

	// Caching turned off: render the page directly, so it unmounts as soon as you leave it.
	if (maxCached <= 0) return <MetaContext value={meta}>{children}</MetaContext>;

	// No stacks (server render, or no Navigation API): render only the current page.
	// It is still inside an `<Activity>`, so a server render has the same structure as the first render in the browser, and hydration matches.
	if (ordinal === undefined)
		return (
			<Activity mode="visible">
				<MetaContext value={meta}>{children}</MetaContext>
			</Activity>
		);

	// Find (or make) the entry for the current page.
	const map = (mapRef.current ??= new Map());
	const key = `${stack} ${ordinal}`;
	const entry = map.get(key) ?? { node: null, used: 0, stack, ordinal };
	map.set(key, entry);

	// Snapshot the children under the live meta (frozen), so each kept page keeps rendering for the URL it last had.
	entry.node = <MetaContext value={meta}>{children}</MetaContext>;
	entry.used = ++usedRef.current;

	// A listed stack always has its root page below a deeper page, so render the root (hidden) if it is not cached.
	const rootKey = `${stack} 0`;
	if (stack !== null && ordinal > 0 && !map.has(rootKey)) {
		const rootMeta = { ...mergeMeta(meta, { url: stack, stack, ordinal: 0 }, RouteCache), path: stack, params: {} };
		map.set(rootKey, { node: <MetaContext value={rootMeta}>{children}</MetaContext>, used: 0, stack, ordinal: 0 });
	}

	// Past the limit, drop pages: never the current page, a stack's root, or the last page seen in each listed stack.
	const last = _getLastUsed(map);
	const droppable = (k: string, e: _CacheEntry) => k !== key && (e.stack === null || (e.ordinal !== 0 && last.get(e.stack) !== k));
	while (map.size > maxCached) {
		// First the pages deeper than the current page in its stack (pages you went back from), then the least recently used.
		const lru =
			_findLeastRecentlyUsed(map, (k, e) => e.stack === stack && e.ordinal > ordinal && droppable(k, e)) ??
			_findLeastRecentlyUsed(map, droppable);
		if (lru === undefined) break;
		map.delete(lru);
	}

	// Render every cached page; only the current one is visible, the rest are kept alive but hidden.
	return Array.from(map, ([k, cached]) => (
		<Activity key={k} mode={k === key ? "visible" : "hidden"}>
			{cached.node}
		</Activity>
	));
}

/** Get the key of the most recently used page in each stack. */
function _getLastUsed(map: Map<string, _CacheEntry>): Map<AbsolutePath | null, string> {
	const last = new Map<AbsolutePath | null, string>();
	const used = new Map<AbsolutePath | null, number>();
	for (const [key, entry] of map) {
		if (entry.used > (used.get(entry.stack) ?? -1)) {
			used.set(entry.stack, entry.used);
			last.set(entry.stack, key);
		}
	}
	return last;
}

/** Find the key of the least-recently-used entry that may be dropped, or `undefined` if none may. */
function _findLeastRecentlyUsed(
	map: Map<string, _CacheEntry>,
	droppable: (key: string, entry: _CacheEntry) => boolean,
): string | undefined {
	let lruKey: string | undefined;
	let lruUsed = Number.POSITIVE_INFINITY;
	for (const [key, entry] of map) {
		if (entry.used < lruUsed && droppable(key, entry)) {
			lruUsed = entry.used;
			lruKey = key;
		}
	}
	return lruKey;
}
