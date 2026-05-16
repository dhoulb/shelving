import type { ReactNode } from "react";
import { NotFoundError } from "../../error/RequestError.js";
import { resolveElementPath, type TreeElement } from "../../util/element.js";
import { type AbsolutePath, splitAbsolutePath } from "../../util/path.js";
import { DirectoryPage } from "../docs/DirectoryPage.js";
import { DocumentationPage } from "../docs/DocumentationPage.js";
import { FilePage } from "../docs/FilePage.js";
import { TreePathContext } from "./TreePathContext.js";
import type { TreeMapping } from "./TreeRenderer.js";

/**
 * Default mapping for full-page renderers, keyed by element `type`.
 * - Override by passing a different `mapping` prop to `<TreePage>`.
 */
export const DEFAULT_TREE_PAGE_MAPPING: TreeMapping = {
	"tree-directory": DirectoryPage,
	"tree-file": FilePage,
	"tree-documentation": DocumentationPage,
};

export interface TreePageProps {
	path?: AbsolutePath;
	tree: TreeElement;
	/** Component dispatch table — defaults to `DEFAULT_TREE_PAGE_MAPPING`. */
	mapping?: TreeMapping;
}

/**
 * Resolve a URL path to a tree element and render it.
 * - Uses `resolveElementPath()` to walk the tree matching each path segment to a descendant's `key`.
 * - `/` renders `tree` itself; deeper paths render the matching descendant.
 * - Wraps the rendered element in `<TreePathContext>` so descendants can read their path.
 * - Throws `NotFoundError` if no element matches at any level.
 */
export function TreePage({ path = "/", tree, mapping = DEFAULT_TREE_PAGE_MAPPING }: TreePageProps): ReactNode {
	const segments = splitAbsolutePath(path);
	const element = resolveElementPath(tree, segments);
	if (!element) throw new NotFoundError("Element not found", { received: path });
	const Component = mapping[element.type as string];
	if (!Component) return null;
	return (
		<TreePathContext value={segments}>
			<Component {...element.props} />
		</TreePathContext>
	);
}
