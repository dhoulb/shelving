import { createContext, type ReactNode, use, useMemo } from "react";
import { flattenTree, type TreeElement } from "../../util/tree.js";

/**
 * React context holding a flattened `key` → `element` map of the surrounding tree(s).
 *
 * - Keyed by flat name (`"BooleanSchema"`, `"Class.member"`) and canonical path (`"/schema/BooleanSchema"`) for fast cross-reference lookup.
 *
 * @see https://shelving.cc/ui/TreeContext
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
 * @kind component
 * @example <TreeProvider tree={tree}>{children}</TreeProvider>
 * @see https://shelving.cc/ui/TreeProvider
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
 * @see https://shelving.cc/ui/useTreeMap
 */
export function useTreeMap(): ReadonlyMap<string, TreeElement> {
	return use(TreeContext);
}

/**
 * Resolve a reference string to its tree element — by exact key first, then by a normalised key with the prose display decorations stripped.
 *
 * - Exact lookup handles flat keys (`"BooleanSchema"`, `"Store.get"`) and canonical paths (`"/schema/BooleanSchema"`).
 * - On a miss, the reference is normalised so a token written in its prose display form still resolves: generics (`"Schema<T>"` → `"Schema"`), call parens (`"formatDate()"` / `"Store.get()"` → bare name), component angle brackets (`"<Section>"` → `"Section"`), and the module package prefix (`"shelving/schema"` → the `"/schema"` canonical path). This is what lets a bare backtick reference in markup auto-link.
 * - A qualified `"Owner.member"` whose member has no page of its own falls back to the owner's (class/interface) page — so `"StringSchema.validate()"` still links even when `validate` isn't a standalone token.
 * - A compound reference (`"Schema<T> | null"`, `"Omit<X, 'k'>"`) only retries on the leading identifier when the whole string is `Identifier<…>`; otherwise it stays a miss and the caller falls back to plain text.
 *
 * @param map The flattened tree lookup map (from `useTreeMap()`).
 * @param ref The reference string — a flat key, canonical path, or token written in its display form.
 * @returns The resolved element, or `undefined` on a miss.
 * @example getTreeElement(useTreeMap(), "formatDate()") // the `formatDate` element
 * @see https://shelving.cc/ui/getTreeElement
 */
export function getTreeElement(map: ReadonlyMap<string, TreeElement>, ref: string): TreeElement | undefined {
	const exact = map.get(ref);
	if (exact) return exact;
	// Retry against a normalised key with the display decorations stripped.
	const key = _normaliseRef(ref);
	const found = key !== ref ? map.get(key) : undefined;
	if (found) return found;
	// A qualified `Owner.member` whose member has no page falls back to the owner (class/interface) page.
	const dot = key.lastIndexOf(".");
	return dot > 0 && !key.startsWith("/") ? map.get(key.slice(0, dot)) : undefined;
}

/**
 * Strip the prose display decorations a token name carries so a backtick reference resolves to its tree key.
 * - `shelving/schema` → `/schema` (module package prefix → canonical path), `<Section>` → `Section` (component), `formatDate()` / `Store.get()` → bare name (call parens), `Schema<T>` → `Schema` (generics).
 */
function _normaliseRef(ref: string): string {
	// Module package prefix (`shelving/schema`, `shelving/util/array`) maps to a canonical module path (`/schema`, `/util/array`).
	if (ref.startsWith("shelving/")) return ref.slice("shelving".length);
	// Component angle brackets, then a trailing call (empty or with example args — `formatDate()`, `DATA(props)`), then a whole-string generic wrapper — leave compound expressions (unions, etc.) unresolved.
	return ref
		.replace(/^<(.+)>$/s, "$1")
		.replace(/\([^)]*\)$/, "")
		.replace(/^([\w$.]+)<.*>$/s, "$1");
}
