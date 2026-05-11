import type { ReactNode } from "react";
import { NotFoundError } from "../../error/RequestError.js";
import { type PossibleElementPath, type PossibleElements, resolveElement } from "../../util/element.js";
import { MapElement } from "../misc/ElementMapper.js";

export interface TreePageProps {
	path?: PossibleElementPath;
	/** The root elements to search within. */
	elements?: PossibleElements;
}

/**
 * Resolve a URL path to a tree element and render it.
 * - Uses `resolveElement()` to walk the tree matching each path segment to an element's `key`.
 * - Delegates rendering to the component registered in the element map for `"TreePage.{type}"`.
 * - Throws `NotFoundError` if no element matches at any level.
 */
export function TreePage({ path = "", elements }: TreePageProps): ReactNode {
	const element = resolveElement(elements, path);
	if (!element) throw new NotFoundError("Element not found", { received: path });
	return <MapElement prefix="TreePage">{element}</MapElement>;
}
