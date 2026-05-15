import type { ReactNode } from "react";
import type { TreeElementProps } from "../../util/element.js";
import { MenuItem } from "../menu/MenuItem.js";
import { TreeRenderer } from "./TreeRenderer.js";

/**
 * Default menu item renderer for any `tree-*` element.
 * - Renders a `<MenuItem>` with the element's `title ?? name` as the label.
 * - If the element has `children`, they're rendered into the `nested` slot — `<MenuItem>` shows them when the item is "proud".
 * - Nested children inherit the surrounding `<TreeRenderer>`'s mapping and fallback via context.
 */
export function TreeMenuItem({ title, name, children }: TreeElementProps): ReactNode {
	return (
		<MenuItem nested={children ? <TreeRenderer tree={children} query={{ type: ["tree-directory", "tree-file"] }} /> : undefined}>
			{title ?? name}
		</MenuItem>
	);
}
