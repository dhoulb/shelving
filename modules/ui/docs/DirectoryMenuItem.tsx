import type { ReactNode } from "react";
import type { DirectoryElementProps } from "../../util/element.js";
import { MenuItem } from "../menu/MenuItem.js";
import { TreeRenderer } from "../tree/TreeRenderer.js";

/**
 * Menu item renderer for a `tree-directory` element.
 * - Renders a `<MenuItem>` with the directory's title (or name).
 * - When the item is "proud" (the current page is at or below this directory), nested children are rendered beneath.
 */
export function DirectoryMenuItem({ title, name, children }: DirectoryElementProps): ReactNode {
	return (
		<MenuItem nested={children ? <TreeRenderer tree={children} query={{ type: ["tree-directory", "tree-file"] }} /> : undefined}>
			{title ?? name}
		</MenuItem>
	);
}
