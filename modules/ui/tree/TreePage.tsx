import type { ReactNode } from "react";
import { NotFoundError } from "../../error/RequestError.js";
import { type Elements, resolveElementPath } from "../../util/element.js";
import { type AbsolutePath, splitAbsolutePath } from "../../util/path.js";
import { DirectoryPage } from "../docs/DirectoryPage.js";
import { DocumentationPage } from "../docs/DocumentationPage.js";
import { FilePage } from "../docs/FilePage.js";
import { createMapper } from "../misc/Mapper.js";

/**
 * Default mappings for the most common tree element types.
 * - Consumers can override individual entries via `<TreePageMapping>`.
 */
export const [TreePageMapping, TreePageMapper] = createMapper({
	"tree-directory": DirectoryPage,
	"tree-file": FilePage,
	"tree-documentation": DocumentationPage,
});

export interface TreePageProps {
	path?: AbsolutePath;
	/** The root elements to search within. */
	elements?: Elements;
}

/**
 * Resolve a URL path to a tree element and render it.
 * - Uses `resolveElement()` to walk the tree matching each path segment to an element's `key`.
 * - Delegates rendering to the component registered in the element mapper.
 * - Throws `NotFoundError` if no element matches at any level.
 */
export function TreePage({ path = "/", elements }: TreePageProps): ReactNode {
	const element = resolveElementPath(elements, splitAbsolutePath(path));
	if (!element) throw new NotFoundError("Element not found", { received: path });
	return <TreePageMapper>{element}</TreePageMapper>;
}
