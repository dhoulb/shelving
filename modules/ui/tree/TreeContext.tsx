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
 * Provide a tree to descendants as a flattened lookup map (see [`flattenTree()`](/util/tree/flattenTree)).
 *
 * - Flattens `tree` **once** (memoised) when set — not on every lookup in every element.
 * - Merges onto any parent `<TreeProvider>`'s map, so cross-references resolve across an entire nested set of trees; the outer (parent) tree wins on collision.
 *
 * @param props The `tree` to flatten and provide, plus `children`.
 * @returns A [`<TreeContext>`](/ui/TreeContext) provider wrapping the children with the flattened map.
 * @kind component
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
 * - Returns an empty map when there's no [`<TreeProvider>`](/ui/TreeProvider) above (e.g. an isolated card rendered outside the tree shell), so callers can look up freely and fall back to plain text on a miss.
 *
 * @returns The flattened `key` → `element` map, or an empty map when no `<TreeProvider>` is present.
 * @example const element = useTreeMap().get("Store.get");
 * @see https://dhoulb.github.io/shelving/ui/tree/TreeContext/useTreeMap
 */
export function useTreeMap(): ReadonlyMap<string, TreeElement> {
	return use(TreeContext);
}

/**
 * Resolve a reference string to its tree element — by exact key first, then by the bare type name when the whole reference is a single generic type.
 *
 * - Exact lookup handles flat keys (`"BooleanSchema"`, `"Store.get"`) and canonical paths (`"/schema/BooleanSchema"`).
 * - On a miss, a `Foo<…>`-shaped reference retries with the generics stripped (`"Schema<T>"` → `"Schema"`), so a generic type name still links without the extractor storing a separate un-generic'd key — the generics stay in the displayed label.
 * - A compound reference (`"Schema<T> | null"`, `"Omit<X, 'k'>"`) only retries on the leading identifier when the whole string is `Identifier<…>`; otherwise it stays a miss and the caller falls back to plain text.
 *
 * @param map The flattened tree lookup map (from [`useTreeMap()`](/ui/useTreeMap)).
 * @param ref The reference string — a flat key, canonical path, or raw type expression.
 * @returns The resolved element, or `undefined` on a miss.
 * @example getTreeElement(useTreeMap(), "Schema<T>") // the `Schema` element
 * @see https://dhoulb.github.io/shelving/ui/tree/TreeContext/getTreeElement
 */
export function getTreeElement(map: ReadonlyMap<string, TreeElement>, ref: string): TreeElement | undefined {
	const exact = map.get(ref);
	if (exact || !ref.includes("<")) return exact;
	// Strip a whole-string generic wrapper (`Foo<…>` → `Foo`) and retry; leave compound expressions (unions, etc.) unresolved.
	return map.get(ref.replace(/^([\w$.]+)<.*>$/s, "$1"));
}
