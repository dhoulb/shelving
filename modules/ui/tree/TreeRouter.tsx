import type { ReactElement, ReactNode } from "react";
import { NotFoundError } from "../../error/RequestError.js";
import type { AbsolutePath } from "../../util/path.js";
import type { TreeElement } from "../../util/tree.js";
import { DocumentationPage } from "../docs/DocumentationPage.js";
import { createMapper } from "../misc/Mapper.js";
import { MetaContext, requireMetaURL } from "../misc/MetaContext.js";
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
	 * - Explicit `null` means fallback to nothing (router will not throw [`NotFoundError`](/error/NotFoundError)).
	 */
	readonly fallback?: ReactElement | undefined | null;
}

/**
 * Resolve a URL path to a tree element and render it as a full page.
 *
 * - Flattens the tree once (via [`<TreeProvider>`](/ui/TreeProvider)) into a `path` → element map, then resolves the current URL with a single `map.get(path)`.
 * - `/` renders the root itself; deeper paths render the matching descendant (composite module names like `/util/string` resolve for free — they're whole keys in the map).
 * - The resolved element is already stamped with its canonical `path`, so the page and its cards link straight to their own paths — nothing needs threading.
 * - To override the renderer for a specific element type, wrap in `<TreeRouterMapping mapping={…}>`.
 *
 * @returns The resolved element rendered as a page, or the `fallback`.
 * @throws [`NotFoundError`](/error/NotFoundError) When no element matches the URL and no `fallback` is given.
 * @kind component
 * @example <TreeRouter tree={tree} />
 * @see https://dhoulb.github.io/shelving/ui/tree/TreeRouter/TreeRouter
 */
export function TreeRouter({ tree, fallback, ...meta }: TreeRouterProps): ReactNode {
	const { path, ...combined } = requireMetaURL(meta);
	// `<TreeProvider>` flattens the tree (memoised) and exposes it as a lookup map so descendants — the route resolver below, plus `<TreeButton>` / breadcrumbs — all resolve against the one map.
	return (
		<MetaContext value={combined}>
			<TreeProvider tree={tree}>
				<TreeRoute path={path} fallback={fallback} />
			</TreeProvider>
		</MetaContext>
	);
}

/** Resolve the current URL `path` to a tree element via the flattened map and render it; otherwise fall back, or throw [`NotFoundError`](/error/NotFoundError). */
function TreeRoute({ path, fallback }: { readonly path: AbsolutePath; readonly fallback: ReactElement | null | undefined }): ReactNode {
	const element = useTreeMap().get(path);
	if (element) return <TreeRouterMapper>{element}</TreeRouterMapper>;
	if (fallback !== undefined) return fallback;
	throw new NotFoundError("Tree route not found", { received: path });
}
