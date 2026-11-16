import { Activity, type ReactNode, use, useRef } from "react";
import type { AbsolutePath } from "../../util/path.js";
import { MetaContext, requireMetaURL } from "../misc/MetaContext.js";
import { NavigationPositionContext } from "./NavigationContext.js";

/** A cached page: the rendered node, where it is in its stack, and a `used` tick for least-recently-used eviction. */
interface _CacheEntry {
	node: ReactNode;
	used: number;
	readonly stack: AbsolutePath;
	readonly depth: number;
}

/**
 * Props for `<RouteCache>`: the `maxCached` size and the content `children` to keep alive for each page in the stacks.
 *
 * @see https://shelving.cc/ui/RouteCacheProps
 */
export interface RouteCacheProps {
	/**
	 * Number of pages to keep mounted (but hidden), so the whole state of each one (scroll position, toggles, searches, form input, focus) is still there when you come back to it.
	 * - The top page of each stack is never dropped, even past the limit, so a tab always shows the page you left.
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
 * - Keeps each page in the stacks mounted but hidden (with React's `<Activity>`), so going back to a page, or switching back to a tab, shows it exactly as you left it.
 * - Each page is keyed by its stack and its depth in that stack, not by its URL. So `NavigationStore.replace()` (a canonical URL, an in-page tab) keeps the same page mounted, and the same URL open in two tabs is two separate pages.
 * - A page leaves the cache as soon as it leaves its stack: when you go back from it, or when a stack is popped to its root. After a browser back, a browser forward shows that page fresh.
 * - The top page of each stack is never dropped. Other pages can be dropped past `maxCached`, and show fresh (from the top) when you come back to them.
 * - Each kept page is frozen under its own `<MetaContext>`, so the same `children` element renders a different page for each URL, and a hidden page never re-renders for another page's URL.
 * - `<Activity mode="hidden">` keeps a hidden page's state but unmounts its effects, so its subscriptions and timers pause and resume as it is hidden and shown.
 * - Without the browser Navigation API (older browsers, server renders), or with `maxCached` of `0`, it renders the current page directly with no cache.
 *
 * @kind component
 * @see https://shelving.cc/ui/RouteCache
 */
export function RouteCache({ maxCached = 10, children }: RouteCacheProps): ReactNode {
	// Read the live URL and the position in the stacks; each navigation re-renders this with both.
	const meta = requireMetaURL();
	const position = use(NavigationPositionContext);
	const mapRef = useRef<Map<string, _CacheEntry>>(undefined);
	const usedRef = useRef(0);

	// Caching turned off: render the page directly, so it unmounts as soon as you leave it.
	if (maxCached <= 0) return <MetaContext value={meta}>{children}</MetaContext>;

	// No stacks (server render, or no Navigation API): render only the current page.
	// It is still inside an `<Activity>`, so a server render has the same structure as the first render in the browser, and hydration matches.
	if (!position)
		return (
			<Activity mode="visible">
				<MetaContext value={meta}>{children}</MetaContext>
			</Activity>
		);

	// Find (or make) the entry for the current page.
	const { stack, depth, tops } = position;
	const map = (mapRef.current ??= new Map());
	const key = `${stack} ${depth}`;
	const entry = map.get(key) ?? { node: null, used: 0, stack, depth };
	map.set(key, entry);

	// Snapshot the children under the live URL (frozen), so each kept page keeps rendering for the URL it last had.
	entry.node = <MetaContext value={meta}>{children}</MetaContext>;
	entry.used = ++usedRef.current;

	// Drop the pages that have left their stack.
	for (const [k, { stack: s, depth: d }] of map) if (k !== key && !(d <= (tops[s] ?? -1))) map.delete(k);

	// Drop the least-recently-used pages past the limit, but never the current page or the top page of a stack.
	while (map.size > maxCached) {
		const lru = _findLeastRecentlyUsed(map, (k, { stack: s, depth: d }) => k !== key && tops[s] !== d);
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
