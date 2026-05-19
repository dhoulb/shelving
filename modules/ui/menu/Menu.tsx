import type { ReactNode } from "react";
import { getModuleClass } from "../util/css.js";
import MENU_CSS from "./Menu.module.css";

export interface MenuProps {
	readonly children?: ReactNode;
}

/**
 * A `<menu>` list of `<MenuItem>` children.
 * - Renders as a bare `<menu>` element — semantically equivalent to `<ul>` per HTML spec but more meaningful for menu contexts. Place inside a `<nav>` (or use the sidebar-style nav at the layout level) if a navigation landmark is needed.
 * - Nested `<Menu>` instances (typically inside a `<MenuItem>`) get indented via the `.menu .menu` CSS rule.
 */
export function Menu({ children }: MenuProps): ReactNode {
	return <menu className={getModuleClass(MENU_CSS, "menu")}>{children}</menu>;
}
