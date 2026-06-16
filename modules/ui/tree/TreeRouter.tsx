import type { ReactElement, ReactNode } from "react";
import { NotFoundError } from "../../error/RequestError.js";
import type { AbsolutePath } from "../../util/path.js";
import type { TreeElement } from "../../util/tree.js";
import { DocumentationPage } from "../docs/DocumentationPage.js";
import { createMapper } from "../misc/Mapper.js";
import { MetaContext, requireMetaURL } from "../misc/MetaContext.js";
import { RouteCache } from "../router/RouteCache.js";
import type { PossibleMeta } from "../util/index.js";
import { TreeProvider, useTreeMap } from "./TreeContext.js";
import { TreePage } from "./TreePage.js";

/**
 * Mapping + Mapper pair for tree routers — wrap children in `<TreeRouterMapping>` to override the per-type page renderers.
 *
 * @see https://dhoulb.github.io/shelving/ui/tree/TreeRouter/TreeRouterMapping
 */
export const [TreeRouterMapping, TreeRouterMapper] = createMapper({
	"tree-element": TreePage,
	"tree-documentation": DocumentationPage,
});

/**
 * Props for the `TreeRouter` component — the tree to route plus an optional fallback and app meta.
 *
 * @see https://dhoulb.github.io/shelving/ui/tree/TreeRouter/TreeRouterProps
 */
export interface TreeRouterProps extends PossibleMeta {
	/** The tree of elements to match routes for. */
	readonly tree: TreeElement;

	/**
	 * Optional fallback element.
	 * - Explicit `null` means fallback to nothing (router will not throw `NotFoundError`).
	 */
	readonly fallback?: ReactElement | undefined | null;

	/**
	 * Number of recently-visited pages to keep mounted (but hidden) so back/forward navigation
	 * restores their scroll position, toggles, searches, inputs, and focus (see `<RouteCache>`).
	 * - Defaults to `10`. Set to `0` to disable caching and unmount each page as you leave it.
	 */
	readonly cache?: number | undefined;
}

/**
 * Resolve a URL path to a tree element and render it as a full page.
 *
 * - Flattens the tree once (via `<TreeProvider>`) into a `path` → element map, then resolves the current URL with a single `map.get(path)`.
 * - `/` renders the root itself; deeper paths render the matching descendant (composite module names like `/util/string` resolve for free — they're whole keys in the map).
 * - The resolved element is already stamped with its canonical `path`, so the page and its cards link straight to their own paths — nothing needs threading.
 * - To override the renderer for a specific element type, wrap in `<TreeRouterMapping mapping={…}>`.
 *
 * @param props The `tree` to route, an optional `fallback`, and app meta.
 * @returns The resolved element rendered as a page, or the `fallback`.
 * @throws NotFoundError When no element matches the URL and no `fallback` is given.
 * @example <TreeRouter tree={tree} />
 * @see https://dhoulb.github.io/shelving/ui/tree/TreeRouter/TreeRouter
 */
export function TreeRouter({ tree, fallback, cache = 10, ...meta }: TreeRouterProps): ReactNode {
	const { path, ...combined } = requireMetaURL(meta);
	// `<TreeProvider>` sits above the cache: it flattens the tree (memoised, so its map is stable across
	// navigation) and exposes it as a lookup map shared by every cached page — the route resolver below,
	// plus `<TreeButton>` / breadcrumbs — without disturbing hidden pages. Each cached page carries its
	// own frozen `<Meta>` so a hidden page never re-renders for the current URL.
	return (
		<TreeProvider tree={tree}>
			<RouteCache path={path} cache={cache}>
				<MetaContext value={combined}>
					<TreeRoute path={path} fallback={fallback} />
				</MetaContext>
			</RouteCache>
		</TreeProvider>
	);
}

/** Resolve the current URL `path` to a tree element via the flattened map and render it; otherwise fall back, or throw `NotFoundError`. */
function TreeRoute({ path, fallback }: { readonly path: AbsolutePath; readonly fallback: ReactElement | null | undefined }): ReactNode {
	const element = useTreeMap().get(path);
	if (element) return <TreeRouterMapper>{element}</TreeRouterMapper>;
	if (fallback !== undefined) return fallback;
	throw new NotFoundError("Tree route not found", { received: path });
}
