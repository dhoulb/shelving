import type { ReactNode } from "react";
import { NotFoundError } from "../../error/RequestError.js";
import { resolveElementPath, type TreeElement } from "../../util/element.js";
import { type AbsolutePath, splitPath } from "../../util/path.js";
import { DirectoryPage } from "../docs/DirectoryPage.js";
import { DocumentationPage } from "../docs/DocumentationPage.js";
import { FilePage } from "../docs/FilePage.js";
import { createMapper } from "../misc/Mapper.js";

/** Mapping + Mapper pair for tree pages — wrap children in `<TreePageMapping>` to override. */
export const [TreePageMapping, TreePageMapper] = createMapper({
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
 * - Throws `NotFoundError` if no element matches at any level.
 * - To override the renderer for a specific element type, wrap in `<TreePageMapping mapping={…}>`.
 */
export function TreePage({ path = "/", tree }: TreePageProps): ReactNode {
	const segments = splitPath(path);
	const element = resolveElementPath(tree, segments);
	if (!element) throw new NotFoundError("Element not found", { received: path });
	return <TreePageMapper>{element}</TreePageMapper>;
}
