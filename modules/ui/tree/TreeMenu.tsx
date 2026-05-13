import type { ReactNode } from "react";
import type { TreeElement } from "../../util/element.js";
import { DirectoryMenuItem } from "../docs/DirectoryMenuItem.js";
import { FileMenuItem } from "../docs/FileMenuItem.js";
import { createMapper } from "../misc/Mapper.js";
import TREE_MENU_CSS from "./TreeMenu.module.css";

/**
 * Default mappings for the most common tree element types.
 * - Consumers can override individual entries via `<TreeMenuMapping>`.
 * - Only directories and files appear in menus by default — code symbols are kept off the navigation.
 */
export const [TreeMenuMapping, TreeMenuMapper] = createMapper({
	"tree-directory": DirectoryMenuItem,
	"tree-file": FileMenuItem,
});

export interface TreeMenuProps {
	/** Root element whose children become the navigation links. */
	tree: TreeElement;
}

/** Sidebar navigation menu built from the children of a root tree element. */
export function TreeMenu({ tree }: TreeMenuProps): ReactNode {
	return (
		<nav className={TREE_MENU_CSS.menu}>
			<ul className={TREE_MENU_CSS.list}>
				<TreeMenuMapper>{tree.props.children}</TreeMenuMapper>
			</ul>
		</nav>
	);
}
