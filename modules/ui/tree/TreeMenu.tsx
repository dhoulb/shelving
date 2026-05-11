import type { ReactNode } from "react";
import { getElements, type PossibleElements } from "../../util/element.js";
import { MapElements } from "../misc/ElementMapper.js";
import TREE_MENU_CSS from "./TreeMenu.module.css";

export interface TreeMenuProps {
	/** Elements to render as navigation links. */
	children?: PossibleElements;
}

/** Sidebar navigation menu built from a tree of elements. */
export function TreeMenu({ children }: TreeMenuProps): ReactNode {
	return (
		<nav className={TREE_MENU_CSS.menu}>
			<ul className={TREE_MENU_CSS.list}>
				<MapElements prefix="TreeMenu">{getElements(children)}</MapElements>
			</ul>
		</nav>
	);
}
