import type { ReactNode } from "react";
import type { Elements } from "../../util/element.js";
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
	/** Elements to render as navigation links. */
	children?: Elements;
}

/** Sidebar navigation menu built from a tree of elements. */
export function TreeMenu({ children }: TreeMenuProps): ReactNode {
	return (
		<nav className={TREE_MENU_CSS.menu}>
			<ul className={TREE_MENU_CSS.list}>
				<TreeMenuMapper>{children}</TreeMenuMapper>
			</ul>
		</nav>
	);
}
