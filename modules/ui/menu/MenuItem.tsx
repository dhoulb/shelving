import type { ReactNode } from "react";
import { getLink, isArray, isURLProud } from "../../util/index.js";
import { Clickable, type ClickableProps } from "../form/Clickable.js";
import { requireMeta } from "../misc/MetaContext.js";
import { getModuleClass } from "../util/css.js";
import MENU_CSS from "./Menu.module.css";

export interface MenuItemProps extends ClickableProps {
	/**
	 * The first child becomes the link label (rendered inside the `<a>`).
	 * - Any additional children form the submenu — only rendered when this item is "proud" (an ancestor of the current page). The caller is responsible for wrapping the submenu in a nested `<Menu>` if it wants the CSS `.menu .menu` descendant rules to apply.
	 */
	readonly children: ReactNode | [ReactNode, ...ReactNode[]];
}

/**
 * A `<li>` containing an `<a>` link, plus optional submenu content shown when this item is "proud".
 * - Reads the current page URL from `<Meta>` and computes `active` / `proud` against its own `href`.
 * - Splits `children` into `[label, ...after]`: label goes inside the `<a>`; `after` is rendered as siblings below it, only when proud.
 */
export function MenuItem({ href, children, ...props }: MenuItemProps): ReactNode {
	const { url, root } = requireMeta();
	const link = getLink(href, url, root);
	const proud = isURLProud(url, link);
	const [label, ...after] = isArray(children) ? children : [children];
	return (
		<li className={getModuleClass(MENU_CSS, "item", { proud })}>
			<Clickable href={href} {...props} className={getModuleClass(MENU_CSS, "link")}>
				{label}
			</Clickable>
			{proud && after}
		</li>
	);
}
