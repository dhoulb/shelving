import type { ReactNode } from "react";
import type { Elements } from "../../util/element.js";
import { createMapper } from "../misc/Mapper.js";
import TREE_MENU_CSS from "./TreeMenu.module.css";

export const [TreeMenuMapping, TreeMenuMapper] = createMapper();

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
