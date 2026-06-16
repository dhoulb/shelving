import type { ReactNode } from "react";
import { MetaContext, requireMetaURL } from "../misc/MetaContext.js";
import { RouteCache } from "./RouteCache.js";

/**
 * Props for `<NavigationCache>` — the `cache` size and the content `children` to keep alive per URL.
 *
 * @see https://dhoulb.github.io/shelving/ui/router/NavigationCache/NavigationCacheProps
 */
export interface NavigationCacheProps {
	/**
	 * Number of recently-visited URLs to keep mounted (but hidden) so the entire state of their subtree —
	 * scroll position of every scroll container, open/closed toggles, in-progress searches, form inputs,
	 * focus — is restored intact when navigating back or forward to them.
	 * - Defaults to `10`. Once the limit is reached the least-recently-visited entry is unmounted.
	 * - Set to `0` to disable caching and unmount the subtree as you leave each URL (the original behaviour).
	 */
	readonly cache?: number | undefined;
	/** The content to render for the current URL and keep alive (hidden) for recently-visited URLs. */
	readonly children: ReactNode;
}

/**
 * Keep-alive cache keyed by the current URL — drop it into a layout around its scrolling content region.
 *
 * - Reads the live URL from the surrounding `<Meta>` context and flips its cached entries visible/hidden
 *   by `pathname`, delegating the least-recently-used keep-alive engine to `<RouteCache>`.
 * - Snapshots `children` under a frozen `<MetaContext>` so each kept-alive copy keeps rendering for the
 *   URL it was captured at — the same single `children` element resolves a different page per path, and a
 *   hidden page never re-renders for someone else's URL.
 * - Because it wraps the scroll container itself (rather than sitting below it inside the router), the
 *   scroll position of every cached page is preserved — `<Activity>` keeps each container's `scrollTop`
 *   intact while it is hidden. Surrounding chrome (sidebar, drawer state) stays outside the cache, so it
 *   is neither duplicated nor remounted on navigation.
 *
 * @kind component
 * @param cache Number of recently-visited URLs to keep alive (defaults to `10`; `0` disables caching).
 * @param children The content region to render and cache (typically a layout's scrollable column).
 * @returns The visible current subtree plus any cached subtrees kept alive but hidden.
 * @example <SidebarLayout sidebar={<Menu />}><NavigationCache><ScrollColumn><Router … /></ScrollColumn></NavigationCache></SidebarLayout>
 * @see https://dhoulb.github.io/shelving/ui/router/NavigationCache/NavigationCache
 */
export function NavigationCache({ cache = 10, children }: NavigationCacheProps): ReactNode {
	// Read the live URL from context; each navigation re-renders this with the new path.
	const meta = requireMetaURL();
	return (
		<RouteCache path={meta.path} cache={cache}>
			<MetaContext value={meta}>{children}</MetaContext>
		</RouteCache>
	);
}
