import { type ComponentType, createContext, type ReactNode, use } from "react";
import type { ImmutableDictionary } from "../../util/dictionary.js";
import { type Element, type Elements, queryElements } from "../../util/element.js";
import type { Query } from "../../util/query.js";
import { TreePathContext } from "./TreePathContext.js";

/**
 * Dispatch table from element `type` to a React component that renders the element's props.
 * - Component prop type is intentionally permissive (`any`) — different element types have different prop shapes (e.g. `DirectoryElementProps`, `FileElementProps`, `DocumentationElementProps`).
 */
// biome-ignore lint/suspicious/noExplicitAny: Different element types have different prop shapes.
export type TreeMapping = ImmutableDictionary<ComponentType<any>>;

/**
 * Context carrying the active `TreeMapping` for nested `<TreeRenderer>` calls.
 * - Lets a mapped component recurse via `<TreeRenderer tree={…}/>` without re-specifying the mapping.
 */
const TreeMappingContext = createContext<TreeMapping>({});
TreeMappingContext.displayName = "TreeMappingContext";

/**
 * Context carrying the active fallback component for nested `<TreeRenderer>` calls.
 * - Lets a mapped component recurse via `<TreeRenderer tree={…}/>` without re-specifying the fallback.
 */
// biome-ignore lint/suspicious/noExplicitAny: Different element types have different prop shapes.
const TreeFallbackContext = createContext<ComponentType<any> | undefined>(undefined);
TreeFallbackContext.displayName = "TreeFallbackContext";

export interface TreeRendererProps {
	/** The tree (or collection of elements) to render. */
	tree: Elements;
	/** Optional query to filter which elements get rendered (e.g. `{ type: ["tree-directory", "tree-file"] }`). */
	query?: Query<Element>;
	/** How many levels of children to walk into. Defaults to `0` (just the top level). */
	depth?: number;
	/** Component dispatch table by element `type` for "special" types. Falls back to the surrounding `TreeMappingContext` if omitted. */
	mapping?: TreeMapping | undefined;
	/** Component used when no `mapping` entry matches an element's `type`. If omitted, unmapped elements are silently skipped. */
	// biome-ignore lint/suspicious/noExplicitAny: Different element types have different prop shapes.
	fallback?: ComponentType<any> | undefined;
}

/**
 * Walk a tree and render each matched element via the supplied `mapping`.
 * - Wraps each rendered element in `<TreePathContext>` so descendants can read their path via `requireTreePath()` / `requireTreeHref()`.
 * - Elements whose `type` isn't in `mapping` are silently skipped — handy for filtering whole categories out.
 * - Composable: a mapped component can recurse with `<TreeRenderer tree={children}/>` and inherits the surrounding mapping via context.
 */
export function TreeRenderer({ tree, query, depth = 0, mapping, fallback }: TreeRendererProps): ReactNode {
	const inheritedMapping = use(TreeMappingContext);
	const inheritedFallback = use(TreeFallbackContext);
	const parentPath = use(TreePathContext);
	const effectiveMapping: TreeMapping = mapping ?? inheritedMapping;
	const effectiveFallback = fallback ?? inheritedFallback;
	const walked = queryElements(tree, query ?? {}, depth);
	const items: ReactNode[] = [];
	for (const element of walked) {
		const type = element.type as string;
		const Component = effectiveMapping[type] ?? effectiveFallback;
		if (!Component) continue;
		const fullPath: readonly string[] = parentPath.length ? [...parentPath, ...element.path] : element.path;
		items.push(
			<TreePathContext key={fullPath.join("/")} value={fullPath}>
				<Component {...element.props} />
			</TreePathContext>,
		);
	}
	return (
		<TreeMappingContext value={effectiveMapping}>
			<TreeFallbackContext value={effectiveFallback}>{items}</TreeFallbackContext>
		</TreeMappingContext>
	);
}
