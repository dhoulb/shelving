import type { ReactNode } from "react";
import type { TreeElement } from "../../util/element.js";
import { Menu } from "../menu/Menu.js";
import { TreeMenuItem } from "./TreeMenuItem.js";
import { type TreeMapping, TreeRenderer } from "./TreeRenderer.js";

/**
 * Sidebar navigation menu built from the children of a root tree element.
 * - Renders each child element via `<TreeMenuItem>` by default (label + optional nested expansion when proud).
 * - Pass `mapping` to override specific element types with custom renderers; unmapped types fall back to `<TreeMenuItem>`.
 * - Only directories and files appear by default — code symbols are kept off the navigation.
 */
export interface TreeMenuProps {
	/** Root element whose children become the navigation links. */
	tree: TreeElement;
	/** Type-specific overrides. Anything not mapped uses the fallback `<TreeMenuItem>`. */
	mapping?: TreeMapping;
}

export function TreeMenu({ tree, mapping }: TreeMenuProps): ReactNode {
	return (
		<Menu>
			<TreeRenderer
				tree={tree.props.children}
				query={{ type: ["tree-directory", "tree-file"] }}
				mapping={mapping}
				fallback={TreeMenuItem}
			/>
		</Menu>
	);
}
