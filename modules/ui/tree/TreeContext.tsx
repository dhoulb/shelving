import { createContext, type ReactNode, use, useMemo } from "react";
import { flattenTree, type TreeElement } from "../../util/tree.js";

/**
 * React context holding a flattened `key` → `element` map of the surrounding tree(s).
 *
 * - Keyed by flat name (`"BooleanSchema"`, `"Class.member"`) and canonical path (`"/schema/BooleanSchema"`) for fast cross-reference lookup.
 *
 * @see https://dhoulb.github.io/shelving/ui/tree/TreeContext/TreeContext
 */
export const TreeContext = createContext<ReadonlyMap<string, TreeElement>>(new Map());
TreeContext.displayName = "TreeContext";

/**
 * Provide a tree to descendants as a flattened lookup map (see `flattenTree()`).
 *
 * - Flattens `tree` **once** (memoised) when set — not on every lookup in every element.
 * - Merges onto any parent `<TreeProvider>`'s map, so cross-references resolve across an entire nested set of trees; the outer (parent) tree wins on collision.
 *
 * @param props The `tree` to flatten and provide, plus `children`.
 * @returns A `<TreeContext>` provider wrapping the children with the flattened map.
 * @example <TreeProvider tree={tree}>{children}</TreeProvider>
 * @see https://dhoulb.github.io/shelving/ui/tree/TreeContext/TreeProvider
 */
export function TreeProvider({ tree, children }: { readonly tree: TreeElement; readonly children: ReactNode }): ReactNode {
	const parent = use(TreeContext);
	const map = useMemo(() => flattenTree(tree, parent), [tree, parent]);
	return <TreeContext value={map}>{children}</TreeContext>;
}

/**
 * Use the flattened tree lookup map from context.
 *
 * - Returns an empty map when there's no `<TreeProvider>` above (e.g. an isolated card rendered outside the tree shell), so callers can look up freely and fall back to plain text on a miss.
 *
 * @returns The flattened `key` → `element` map, or an empty map when no `<TreeProvider>` is present.
 * @example const element = useTreeMap().get("Store.get");
 * @see https://dhoulb.github.io/shelving/ui/tree/TreeContext/useTreeMap
 */
export function useTreeMap(): ReadonlyMap<string, TreeElement> {
	return use(TreeContext);
}
