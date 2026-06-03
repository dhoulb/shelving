import { createContext, type ReactNode, use, useMemo } from "react";
import { type ElementMapEntry, flattenTree, type TreeElement } from "../../util/tree.js";

/** Empty fallback so `useTreeMap()` always returns a map, even with no provider. */
const EMPTY_MAP: ReadonlyMap<string, ElementMapEntry> = new Map();

/** A flattened `name`/`path` → `{ path, title }` map of the surrounding tree(s), for fast cross-reference lookup. */
export const TreeContext = createContext<ReadonlyMap<string, ElementMapEntry>>(EMPTY_MAP);
TreeContext.displayName = "TreeContext";

/**
 * Provide a tree to descendants as a flattened lookup map (see `flattenTree()`).
 * - Flattens `tree` **once** (memoised) when set — not on every lookup in every element.
 * - Merges onto any parent `<TreeProvider>`'s map, so cross-references resolve across an entire nested set of trees; the outer (parent) tree wins on collision.
 */
export function TreeProvider({ tree, children }: { readonly tree: TreeElement; readonly children: ReactNode }): ReactNode {
	const parent = use(TreeContext);
	const map = useMemo(() => flattenTree(tree, parent), [tree, parent]);
	return <TreeContext value={map}>{children}</TreeContext>;
}

/**
 * Use the flattened tree lookup map from context.
 * - Returns an empty map when there's no `<TreeProvider>` above (e.g. an isolated card rendered outside the tree shell), so callers can look up freely and fall back to plain text on a miss.
 */
export function useTreeMap(): ReadonlyMap<string, ElementMapEntry> {
	return use(TreeContext);
}
