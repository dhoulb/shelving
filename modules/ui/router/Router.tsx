import { Activity, type ReactElement, type ReactNode, useRef } from "react";
import { NotFoundError } from "../../error/RequestError.js";
import { UnexpectedError } from "../../error/UnexpectedError.js";
import { getProps } from "../../util/index.js";
import type { AbsolutePath } from "../../util/path.js";
import { matchPathTemplate, renderPathTemplate } from "../../util/template.js";
import { MetaContext, type MetaURL, requireMetaURL } from "../misc/MetaContext.js";
import type { PossibleMeta } from "../util/meta.js";
import type { Routes } from "./Routes.js";

/**
 * Props for `<Router>` — the `routes` to match against plus an optional `fallback`.
 *
 * @see https://dhoulb.github.io/shelving/ui/router/Router/RouterProps
 */
export interface RouterProps extends PossibleMeta {
	/** List of routes for the router to match against. */
	readonly routes: Routes;

	/**
	 * Optional fallback element.
	 * - Explicit `null` means fallback to nothing (router will not throw `NotFoundError`).
	 */
	readonly fallback?: ReactElement | undefined | null;

	/**
	 * Number of recently-visited pages to keep mounted (but hidden) so their entire state — scroll
	 * position of every scroll container, open/closed toggles, in-progress searches, form inputs,
	 * focus — is restored intact when navigating back or forward to them.
	 * - Defaults to `10`. Once the limit is reached the least-recently-visited page is unmounted.
	 * - Set to `0` to disable caching and unmount each page as you leave it (the original behaviour).
	 */
	readonly cache?: number | undefined;
}

/**
 * Match the current URL against `routes` and render the matched element.
 * - Reads `url` and `base` from the surrounding `<Meta>` context (override via props).
 * - When `base` is set, the effective path is the URL after stripping the base prefix.
 * - Nest by putting another `<Router>` inside a route's value; pass `base="/section"` (or wrap in `<Meta>`) to scope.
 * - Route `{placeholders}` are passed as props to function/component route values along with merged URL `?query` params. They are not published into context — descendants of a `ReactElement`-valued route can't see them automatically.
 * - Returns `null` when there's no URL in context or the URL is outside the base.
 *
 * @kind component
 * @param routes The route table to match the current URL against.
 * @param fallback Element to render when nothing matches; explicit `null` renders nothing instead of throwing.
 * @param meta Optional meta (url/base) overrides for this router scope.
 * @returns The matched route element, or `null`/`fallback` when nothing matches.
 * @throws NotFoundError If no route matches and `fallback` is `undefined`.
 * @example <Router routes={{ "/": HomePage, "/about": AboutPage }} />
 * @see https://dhoulb.github.io/shelving/ui/router/Router/Router
 */
export function Router({ routes, fallback, cache = 10, ...meta }: RouterProps): ReactElement | null {
	const combined = requireMetaURL(meta);
	const route = _matchRoute(routes, fallback, combined);
	if (!route) throw new NotFoundError("Tree route not found", { received: combined });
	// Each cached page carries its own `<MetaContext>` (frozen at the URL it was rendered for), so a
	// hidden page is insulated from the live URL context and never re-renders for someone else's URL.
	return (
		<RouteCache path={combined.path} cache={cache}>
			<MetaContext value={combined}>{route}</MetaContext>
		</RouteCache>
	);
}

/** A cached page: the rendered node plus a monotonic `used` tick for least-recently-used eviction. */
interface CacheEntry {
	node: ReactNode;
	used: number;
}

/**
 * Keep-alive cache for `<Router>`: render the current `path` and keep up to `cache` recently-visited
 * pages mounted but hidden (via `<Activity mode="hidden">`), so returning to a page restores its DOM
 * and component state untouched. When `cache <= 0` the page is rendered directly with no caching.
 */
function RouteCache({ path, cache, children }: { path: AbsolutePath; cache: number; children: ReactNode }): ReactNode {
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

function _matchRoute(
	routes: Routes,
	fallback: ReactElement | null | undefined,
	meta: MetaURL,
	path = meta.path,
	depth = 0,
): ReactElement | null | undefined {
	for (const [route, Route] of getProps(routes)) {
		// Try to match this path.
		const placeholders = matchPathTemplate(route, path);
		if (!placeholders) continue;

		// Skip falsy. Allows a route to be conditionally disabled by setting its value to `null` or `false`.
		if (!Route) continue;

		// String value is a redirect; re-run matching with the new path. Guard against infinite redirect loops by limiting depth.
		if (typeof Route === "string") {
			if (depth > 10) throw new UnexpectedError("Infinite redirect loop", { received: route, expected: path, caller: _matchRoute });
			return _matchRoute(routes, fallback, meta, renderPathTemplate(Route, placeholders), depth + 1);
		}

		// React element — render as-is.
		if (typeof Route !== "function") return Route;

		// Component — render with merged URL query params and route placeholders as props (placeholders win on conflict).
		return <Route key={path} {...meta.params} {...placeholders} />;
	}

	// No match, try the fallback.
	if (fallback !== undefined) return fallback;

	// Fallback is undefined, throw a `NotFoundError`
	throw new NotFoundError("No matching route found", { received: path, caller: _matchRoute });
}
