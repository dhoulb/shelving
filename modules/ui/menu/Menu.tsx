import type { ReactNode } from "react";
import { getModuleClass } from "../util/css.js";
import MENU_CSS from "./Menu.module.css";

export interface MenuProps {
	readonly children?: ReactNode;
}

/** A `<nav>` containing a `<ul>` list of `<MenuItem>` children. */
export function Menu({ children }: MenuProps): ReactNode {
	return (
		<nav className={getModuleClass(MENU_CSS, "menu")}>
			<ul className={getModuleClass(MENU_CSS, "list")}>{children}</ul>
		</nav>
	);
}
