import type { ReactNode } from "react";
import { NotFoundError } from "../../error/RequestError.js";
import { resolveElementPath, type TreeElement } from "../../util/element.js";
import { type AbsolutePath, splitPath } from "../../util/path.js";
import { DirectoryPage } from "../docs/DirectoryPage.js";
import { DocumentationPage } from "../docs/DocumentationPage.js";
import { FilePage } from "../docs/FilePage.js";
import { createMapper } from "../misc/Mapper.js";

/** Extras threaded through `TreePageMapper` to the page renderer — the site-root-relative path of the page. */
interface TreePageExtras {
	/** Site-root-relative URL path of the page being rendered. Each page forwards it to its child cards. */
	readonly path: AbsolutePath;
}

/** Mapping + Mapper pair for tree pages — wrap children in `<TreePageMapping>` to override. */
export const [TreePageMapping, TreePageMapper] = createMapper<TreePageExtras>({
	"tree-directory": DirectoryPage,
	"tree-file": FilePage,
	"tree-documentation": DocumentationPage,
});

export interface TreePageProps {
	readonly path?: AbsolutePath;
	readonly tree: TreeElement;
}

/**
 * Resolve a URL path to a tree element and render it as a full page.
 * - Walks the tree by matching each path segment to a descendant's `key` (via `resolveElementPath()`).
 * - `/` renders the root itself; deeper paths render the matching descendant.
 * - `path` is the site-root-relative path (already stripped of any `APP_URL` subfolder by `<Router>`); it is threaded to the page renderer so child cards build correct hrefs.
 * - Throws `NotFoundError` if no element matches at any level.
 * - To override the renderer for a specific element type, wrap in `<TreePageMapping mapping={…}>`.
 */
export function TreePage({ path = "/", tree }: TreePageProps): ReactNode {
	const segments = splitPath(path);
	const element = resolveElementPath(tree, segments);
	if (!element) throw new NotFoundError("Element not found", { received: path });
	return <TreePageMapper path={path}>{element}</TreePageMapper>;
}
