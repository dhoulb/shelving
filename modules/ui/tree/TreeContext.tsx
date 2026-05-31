import { createContext, use, useMemo } from "react";
import { getElementIndex, type TreeElement } from "../../util/element.js";

/** The root tree element, shared so descendant components can resolve cross-references to other elements. */
export const TreeContext = createContext<TreeElement | undefined>(undefined);
TreeContext.displayName = "TreeContext";

/**
 * Use the root tree element from context.
 * - Returns `undefined` when no `<TreeContext>` is present (e.g. an isolated card rendered outside the tree shell).
 */
export function useTree(): TreeElement | undefined {
	return use(TreeContext);
}

/**
 * Use a flattened `name` → path-segments index of the whole tree for fast cross-reference lookup.
 * - Memoised per root so repeated lookups (every `<DocumentationButton>` on a page) share one walk.
 * - Returns an empty map when there's no tree in context.
 *
 * @returns A map from reference string (`"Store"`, `"Store.get"`) to its path segments — feed to `joinPath()` to build an href.
 */
export function useTreeIndex(): Map<string, readonly string[]> {
	const tree = useTree();
	return useMemo(() => (tree ? getElementIndex(tree) : new Map()), [tree]);
}
