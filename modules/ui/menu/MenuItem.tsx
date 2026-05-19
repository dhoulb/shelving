import type { ReactNode } from "react";
import { type AbsolutePath, isPathActive, isPathProud } from "../../util/path.js";
import { requireMeta } from "../misc/MetaContext.js";
import { getModuleClass } from "../util/css.js";
import MENU_CSS from "./Menu.module.css";

export interface MenuItemProps {
	/** Link target — rendered as the `<a>`'s `href`. */
	readonly href?: AbsolutePath | undefined;
	/**
	 * The first child becomes the link label (rendered inside the `<a>`).
	 * - Any additional children form the submenu — only rendered when this item is "proud" (an ancestor of the current page). The caller is responsible for wrapping the submenu in a nested `<Menu>` if it wants the CSS `.menu .menu` descendant rules to apply.
	 */
	readonly children?: ReactNode;
}

/**
 * A `<li>` containing an `<a>` link, plus optional submenu content shown when this item is "proud".
 * - Reads the current page URL from `<Meta>` and computes `active` / `proud` against its own `href`.
 * - Splits `children` into `[label, ...after]`: label goes inside the `<a>`; `after` is rendered as siblings below it, only when proud.
 */
export function MenuItem({ href, children }: MenuItemProps): ReactNode {
	const { url } = requireMeta();
	const current = url?.pathname;
	const active = !!href && !!current && isPathActive(current, href);
	const proud = !!href && !!current && isPathProud(current, href);
	const list = Array.isArray(children) ? children : [children];
	const [label, ...after] = list;
	return (
		<li className={getModuleClass(MENU_CSS, "item", { proud })}>
			<a className={getModuleClass(MENU_CSS, "link")} href={href} aria-current={active ? "page" : undefined}>
				{label}
			</a>
			{proud && after}
		</li>
	);
}
