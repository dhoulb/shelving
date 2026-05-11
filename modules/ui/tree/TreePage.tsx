import type { ReactNode } from "react";
import { NotFoundError } from "../../error/RequestError.js";
import { type Elements, type PossibleElementPath, resolveElement } from "../../util/element.js";
import { createMapper } from "../misc/Mapper.js";

export const [TreePageMapping, TreePageMapper] = createMapper();

export interface TreePageProps {
	path?: PossibleElementPath;
	/** The root elements to search within. */
	elements?: Elements;
}

/**
 * Resolve a URL path to a tree element and render it.
 * - Uses `resolveElement()` to walk the tree matching each path segment to an element's `key`.
 * - Delegates rendering to the component registered in the element mapper.
 * - Throws `NotFoundError` if no element matches at any level.
 */
export function TreePage({ path = "", elements }: TreePageProps): ReactNode {
	const element = resolveElement(elements, path);
	if (!element) throw new NotFoundError("Element not found", { received: path });
	return <TreePageMapper>{element}</TreePageMapper>;
}
