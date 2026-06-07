import type { ReactElement, ReactNode } from "react";
import { NotFoundError } from "../../error/RequestError.js";
import { type AbsolutePath, splitPath } from "../../util/path.js";
import { resolveTreePath, type TreeElement } from "../../util/tree.js";
import { DocumentationPage } from "../docs/DocumentationPage.js";
import { createMapper } from "../misc/Mapper.js";
import { MetaContext, requireMetaURL } from "../misc/MetaContext.js";
import type { PossibleMeta } from "../util/index.js";
import { TreeProvider } from "./TreeContext.js";
import { TreePage } from "./TreePage.js";

/** Extras threaded through `TreeRouterMapper` to the page renderer — the site-root-relative path of the page. */
interface TreeRouterExtras {
	/** Site-root-relative URL path of the page being rendered. Each page forwards it to its child cards. */
	readonly path: AbsolutePath;
}

/** Mapping + Mapper pair for tree routers — wrap children in `<TreeRouterMapping>` to override. */
export const [TreeRouterMapping, TreeRouterMapper] = createMapper<TreeRouterExtras>({
	"tree-element": TreePage,
	"tree-documentation": DocumentationPage,
});

export interface TreeRouterProps extends PossibleMeta {
	/** The tree of elements to match routes for. */
	readonly tree: TreeElement;

	/**
	 * Optional fallback element.
	 * - Explicit `null` means fallback to nothing (router will not throw `NotFoundError`).
	 */
	readonly fallback?: ReactElement | undefined | null;
}

/**
 * Resolve a URL path to a tree element and render it as a full page.
 * - Walks the tree by matching each path segment to a descendant's `key` (via `resolveTreePath()`).
 * - `/` renders the root itself; deeper paths render the matching descendant.
 * - `path` is the site-root-relative path (already stripped of any `APP_URL` subfolder by `<Router>`); it is threaded to the page renderer so child cards build correct hrefs.
 * - Throws `NotFoundError` if no element matches at any level.
 * - To override the renderer for a specific element type, wrap in `<TreeRouterMapping mapping={…}>`.
 */
export function TreeRouter({ tree, fallback, ...meta }: TreeRouterProps): ReactNode {
	const { path, ...combined } = requireMetaURL(meta);

	// Find a `TreeElement` matching the current URL meta path.
	const element = resolveTreePath(tree, splitPath(path));

	// We render either a mapped version of the tree element, or the fallback element.
	const route = element ? <TreeRouterMapper path={path}>{element}</TreeRouterMapper> : fallback;
	// Expose the tree as a flat lookup so descendants (e.g. `<DocumentationButton>`, breadcrumbs) can resolve cross-references to other pages.
	if (route !== undefined)
		return (
			<MetaContext value={combined}>
				<TreeProvider tree={tree}>{route}</TreeProvider>
			</MetaContext>
		);
	throw new NotFoundError("Tree route not found", { received: path });
}
