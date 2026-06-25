import type { ReactNode } from "react";
import { type Element, filterElements } from "../../util/element.js";
import type { TreeElement, TreeElementProps } from "../../util/tree.js";
import { Menu, MenuItem } from "../menu/Menu.js";
import { createMapper } from "../misc/Mapper.js";

/**
 * Match an element that should appear in the sidebar menu.
 *
 * - Generic tree elements (directories and files) always qualify.
 * - For documentation elements, only `kind: "module"` qualifies — functions, classes, methods, properties, etc. are kept off the navigation.
 *
 * @param element The element to test.
 * @returns `true` when the element should appear in the menu, `false` otherwise.
 * @example matchMenuElement(element) // true
 * @see https://shelving.cc/ui/matchMenuElement
 */
export function matchMenuElement(element: Element): boolean {
	const { type, props } = element;
	if (type === "tree-element") return true;
	if (type === "tree-documentation") return (props as { kind?: string }).kind === "module";
	return false;
}

/**
 * Default menu item renderer for any `tree-*` element.
 *
 * - Links straight to the element's own canonical `path` (stamped by `flattenTree()`), so the menu must be fed the flattened tree's elements.
 * - Passes both the label and the nested `<TreeMenuMapper>` to `<MenuItem>`; `<MenuItem>` itself decides whether to reveal the nested submenu based on the current URL.
 *
 * @kind component
 * @example <TreeMenuItem {...element.props} />
 * @see https://shelving.cc/ui/TreeMenuItem
 */
export function TreeMenuItem({ path, name, title, children }: TreeElementProps): ReactNode {
	const submenu = Array.from(filterElements(children, matchMenuElement));
	return (
		<MenuItem href={path}>
			{title ?? name}
			{submenu.length ? (
				<Menu>
					<TreeMenuMapper>{submenu}</TreeMenuMapper>
				</Menu>
			) : null}
		</MenuItem>
	);
}

/**
 * Mapping + Mapper pair for the menu — wrap children in `<TreeMenuMapping>` to override the per-type menu-item renderers.
 *
 * @see https://shelving.cc/ui/TreeMenuMapping
 */
export const [TreeMenuMapping, TreeMenuMapper] = createMapper({
	"tree-element": TreeMenuItem,
	"tree-documentation": TreeMenuItem,
});

/**
 * Props for the `TreeMenu` component — the root tree element plus its URL path.
 *
 * @see https://shelving.cc/ui/TreeMenuProps
 */
export interface TreeMenuProps {
	/** Root element whose children become the navigation links. Must be a flattened element (from `useTreeMap()`) so each child carries its canonical `path`. */
	readonly tree: TreeElement;
}

/**
 * Sidebar navigation menu built from the children of a root tree element.
 *
 * - Renders each child via `<TreeMenuItem>` (the default mapping for `tree-element`), linking to each child's stamped `path`.
 * - Pass a flattened element (e.g. `useTreeMap().get("/")`) so its children carry their canonical `path`.
 * - To customise renderers for specific types, wrap in `<TreeMenuMapping mapping={…}>`.
 * - Only directories and files appear — code symbols are kept off the navigation.
 *
 * @kind component
 * @see https://shelving.cc/ui/TreeMenu
 */
export function TreeMenu({ tree }: TreeMenuProps): ReactNode {
	return (
		<Menu>
			<TreeMenuMapper>{filterElements(tree.props.children, matchMenuElement)}</TreeMenuMapper>
		</Menu>
	);
}
