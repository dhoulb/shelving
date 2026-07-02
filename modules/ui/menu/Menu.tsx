import type { ReactNode } from "react";
import { isArray } from "../../util/array.js";
import { getLink, isURLActive, isURLProud } from "../../util/index.js";
import { Clickable, type ClickableProps } from "../button/Clickable.js";
import { requireMeta } from "../misc/MetaContext.js";
import { type BlockVariants, getBlockClass } from "../style/Block.js";
import { getClass, getModuleClass } from "../util/css.js";
import type { OptionalChildProps } from "../util/props.js";
import MENU_CSS from "./Menu.module.css";

const MENU_CLASS = getModuleClass(MENU_CSS, "menu");
const MENU_ITEM_CLASS = getModuleClass(MENU_CSS, "item");
const MENU_LINK_CLASS = getModuleClass(MENU_CSS, "link");
const MENU_PROUD_CLASS = getModuleClass(MENU_CSS, "proud");
const MENU_ACTIVE_CLASS = getModuleClass(MENU_CSS, "active");

/**
 * Props for `<Menu>` — optional `<MenuItem>` `children`.
 *
 * @see https://shelving.cc/ui/MenuProps
 */
export interface MenuProps extends BlockVariants, OptionalChildProps {}

/**
 * A `<menu>` list of `<MenuItem>` children.
 * - Renders as a bare `<menu>` element — semantically equivalent to `<ul>` per HTML spec but more meaningful for menu contexts. Place inside a `<nav>` (or use the sidebar-style nav at the layout level) if a navigation landmark is needed.
 * - Nested `<Menu>` instances (typically inside a `<MenuItem>`) get indented via the `.menu .menu` CSS rule.
 *
 * @kind component
 * @see https://shelving.cc/ui/Menu
 */
export function Menu({ children, ...props }: MenuProps): ReactNode {
	return (
		<menu
			className={getClass(
				MENU_CLASS, //
				getBlockClass(props),
			)}
		>
			{children}
		</menu>
	);
}

/**
 * Props for `<MenuItem>` — `<Clickable>` props plus `children` whose first node is the label and the rest the submenu.
 *
 * @see https://shelving.cc/ui/MenuItemProps
 */
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
 *
 * @kind component
 * @see https://shelving.cc/ui/MenuItem
 */
export function MenuItem({ href, children, ...props }: MenuItemProps): ReactNode {
	const { url, root } = requireMeta();
	const link = getLink(href, url, root);
	const proud = isURLProud(url, link);
	const active = isURLActive(url, link);
	const [label, ...after] = isArray(children) ? children : [children];
	return (
		<li className={MENU_ITEM_CLASS}>
			<Clickable
				href={href}
				{...props}
				className={getClass(
					MENU_LINK_CLASS, //
					proud && MENU_PROUD_CLASS,
					active && MENU_ACTIVE_CLASS,
				)}
			>
				{label}
			</Clickable>
			{proud && after}
		</li>
	);
}
