import type { ReactNode } from "react";
import { queryElements, type TreeElement, type TreeElementProps } from "../../util/element.js";
import { type AbsolutePath, joinPath } from "../../util/path.js";
import type { Query } from "../../util/query.js";
import { Menu } from "../menu/Menu.js";
import { MenuItem } from "../menu/MenuItem.js";
import { createMapper } from "../misc/Mapper.js";

/** Tree element types that appear in the menu — directories and files only, no code symbols. */
export const MENU_QUERY: Query<{ type: string }> = { type: ["tree-directory", "tree-file"] };

/** Extras threaded through `TreeMenuMapper` to every menu item — the parent's URL path. */
interface TreeMenuExtras {
	/** URL path of the parent element. Each item appends its own `name` to compute its own path. Defaults to `/`. */
	readonly path?: AbsolutePath | undefined;
}

/**
 * Default menu item renderer for any `tree-*` element.
 * - Computes its own URL path by appending its `name` to the parent's `path`.
 * - Passes both the label and the nested `<TreeMenuMapper>` to `<MenuItem>`; `<MenuItem>` itself decides whether to reveal the nested submenu based on the current URL.
 */
export function TreeMenuItem({ path = "/", name, title, children }: TreeElementProps & TreeMenuExtras): ReactNode {
	const href = joinPath(path, name);
	const submenu = Array.from(queryElements(children, MENU_QUERY));
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

/** Mapping + Mapper pair for the menu — wrap children in `<TreeMenuMapping>` to override. */
export const [TreeMenuMapping, TreeMenuMapper] = createMapper<TreeMenuExtras>({
	"tree-directory": TreeMenuItem,
	"tree-file": TreeMenuItem,
});

export interface TreeMenuProps {
	/** Root element whose children become the navigation links. */
	readonly tree: TreeElement;
	/** URL path of the root — children get `path + their.name`. Defaults to `/`. */
	readonly path?: AbsolutePath | undefined;
}

/**
 * Sidebar navigation menu built from the children of a root tree element.
 * - Renders each child via `<TreeMenuItem>` (the default mapping for `tree-directory` / `tree-file`).
 * - To customise renderers for specific types, wrap in `<TreeMenuMapping mapping={…}>`.
 * - Only directories and files appear — code symbols are kept off the navigation.
 */
export function TreeMenu({ tree, path = "/" }: TreeMenuProps): ReactNode {
	return (
		<Menu>
			<TreeMenuMapper path={path}>{queryElements(tree.props.children, MENU_QUERY)}</TreeMenuMapper>
		</Menu>
	);
}
