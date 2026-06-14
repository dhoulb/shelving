import type { ReactNode } from "react";
import { filterElements } from "../../util/element.js";
import type { AbsolutePath } from "../../util/path.js";
import type { TreeElement } from "../../util/tree.js";
import { Menu, MenuItem } from "../menu/Menu.js";
import { matchMenuElement, TreeMenuMapper } from "./TreeMenu.js";

export interface TreeSidebarProps {
	/** Root element of the tree. */
	readonly tree: TreeElement;
	/** URL path of the root — defaults to `/`. Children are rendered with `path + their.name`. */
	readonly path?: AbsolutePath | undefined;
}

/**
 * Sidebar built from a tree element.
 * - Renders a single "home" `<MenuItem>` for the root element itself, then the root's children as a `<TreeMenuMapper>` underneath.
 * - The home link uses `path` as its href (defaulting to `/`). The children's hrefs are computed by appending their `name` to the root's path.
 * - To customise child renderers wrap in `<TreeMenuMapping mapping={…}>` (same context as `<TreeMenu>`).
 */
export function TreeSidebar({ tree, path = "/" as AbsolutePath }: TreeSidebarProps): ReactNode {
	return (
		<Menu>
			<MenuItem href={path}>{tree.props.title ?? tree.props.name}</MenuItem>
			<TreeMenuMapper path={path}>{filterElements(tree.props.children, matchMenuElement)}</TreeMenuMapper>
		</Menu>
	);
}
