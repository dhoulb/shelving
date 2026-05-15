import type { ReactNode } from "react";
import type { TreeElement } from "../../util/element.js";
import { DirectoryMenuItem } from "../docs/DirectoryMenuItem.js";
import { FileMenuItem } from "../docs/FileMenuItem.js";
import { Menu } from "../menu/Menu.js";
import { type TreeMapping, TreeRenderer } from "./TreeRenderer.js";

/**
 * Default mapping for menu items.
 * - Only directories and files appear in menus by default — code symbols are kept off the navigation.
 * - Override by passing a different `mapping` prop to `<TreeMenu>`.
 */
export const DEFAULT_TREE_MENU_MAPPING: TreeMapping = {
	"tree-directory": DirectoryMenuItem,
	"tree-file": FileMenuItem,
};

export interface TreeMenuProps {
	/** Root element whose children become the navigation links. */
	tree: TreeElement;
	/** Component dispatch table — defaults to `DEFAULT_TREE_MENU_MAPPING`. */
	mapping?: TreeMapping;
}

/** Sidebar navigation menu built from the children of a root tree element. */
export function TreeMenu({ tree, mapping = DEFAULT_TREE_MENU_MAPPING }: TreeMenuProps): ReactNode {
	return (
		<Menu>
			<TreeRenderer tree={tree.props.children} query={{ type: ["tree-directory", "tree-file"] }} mapping={mapping} />
		</Menu>
	);
}
