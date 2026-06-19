import type { ReactNode } from "react";
import { type Element, filterElements } from "../../util/element.js";
import { type AbsolutePath, joinPath } from "../../util/path.js";
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
 * @see https://dhoulb.github.io/shelving/ui/tree/TreeMenu/matchMenuElement
 */
export function matchMenuElement(element: Element): boolean {
	const { type, props } = element;
	if (type === "tree-element") return true;
	if (type === "tree-documentation") return (props as { kind?: string }).kind === "module";
	return false;
}

/** Extras threaded through `TreeMenuMapper` to every menu item — the parent's URL path. */
interface TreeMenuExtras {
	/** URL path of the parent element. Each item appends its own `name` to compute its own path. Defaults to `/`. */
	readonly path: AbsolutePath;
}

/**
 * Default menu item renderer for any `tree-*` element.
 *
 * - Computes its own URL path by appending its `name` to the parent's `path`.
 * - Passes both the label and the nested `<TreeMenuMapper>` to `<MenuItem>`; `<MenuItem>` itself decides whether to reveal the nested submenu based on the current URL.
 *
 * @param props The tree element props plus the parent's `path`.
 * @returns A `<MenuItem>` for the element, with a nested `<Menu>` when it has menu-eligible children.
 * @kind component
 * @example <TreeMenuItem {...element.props} path="/" />
 * @see https://dhoulb.github.io/shelving/ui/tree/TreeMenu/TreeMenuItem
 */
export function TreeMenuItem({ path = "/", name, title, children }: TreeElementProps & TreeMenuExtras): ReactNode {
	const href = joinPath(path, name);
	const submenu = Array.from(filterElements(children, matchMenuElement));
	return (
		<MenuItem href={href}>
			{title ?? name}
			{submenu.length ? (
				<Menu>
					<TreeMenuMapper path={href}>{submenu}</TreeMenuMapper>
				</Menu>
			) : null}
		</MenuItem>
	);
}

/**
 * Mapping + Mapper pair for the menu — wrap children in `<TreeMenuMapping>` to override the per-type menu-item renderers.
 *
 * @see https://dhoulb.github.io/shelving/ui/tree/TreeMenu/TreeMenuMapping
 */
export const [TreeMenuMapping, TreeMenuMapper] = createMapper<TreeMenuExtras>({
	"tree-element": TreeMenuItem,
	"tree-documentation": TreeMenuItem,
});

/**
 * Props for the `TreeMenu` component — the root tree element plus its URL path.
 *
 * @see https://dhoulb.github.io/shelving/ui/tree/TreeMenu/TreeMenuProps
 */
export interface TreeMenuProps {
	/** Root element whose children become the navigation links. */
	readonly tree: TreeElement;
	/** URL path of the root — children get `path + their.name`. Defaults to `/`. */
	readonly path?: AbsolutePath | undefined;
}

/**
 * Sidebar navigation menu built from the children of a root tree element.
 *
 * - Renders each child via `<TreeMenuItem>` (the default mapping for `tree-element`).
 * - To customise renderers for specific types, wrap in `<TreeMenuMapping mapping={…}>`.
 * - Only directories and files appear — code symbols are kept off the navigation.
 *
 * @kind component
 * @returns A `<Menu>` of navigation links to the root's children.
 * @example <TreeMenu tree={tree} />
 * @see https://dhoulb.github.io/shelving/ui/tree/TreeMenu/TreeMenu
 */
export function TreeMenu({ path = "/", tree }: TreeMenuProps): ReactNode {
	return (
		<Menu>
			<TreeMenuMapper path={path}>{filterElements(tree.props.children, matchMenuElement)}</TreeMenuMapper>
		</Menu>
	);
}
