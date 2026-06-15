import type { ReactNode } from "react";
import { isArray } from "../../util/array.js";
import { getLink, isURLActive, isURLProud } from "../../util/index.js";
import { Clickable, type ClickableProps } from "../form/Clickable.js";
import { requireMeta } from "../misc/MetaContext.js";
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
 * @see https://dhoulb.github.io/shelving/ui/menu/Menu/MenuProps
 */
export interface MenuProps extends OptionalChildProps {}

/**
 * A `<menu>` list of `<MenuItem>` children.
 * - Renders as a bare `<menu>` element — semantically equivalent to `<ul>` per HTML spec but more meaningful for menu contexts. Place inside a `<nav>` (or use the sidebar-style nav at the layout level) if a navigation landmark is needed.
 * - Nested `<Menu>` instances (typically inside a `<MenuItem>`) get indented via the `.menu .menu` CSS rule.
 *
 * @kind component
 * @param children The `<MenuItem>` entries to list.
 * @returns The menu element.
 * @example <Menu><MenuItem href="/home">Home</MenuItem></Menu>
 * @see https://dhoulb.github.io/shelving/ui/menu/Menu/Menu
 */
export function Menu({ children }: MenuProps): ReactNode {
	return <menu className={MENU_CLASS}>{children}</menu>;
}

/**
 * Props for `<MenuItem>` — `<Clickable>` props plus `children` whose first node is the label and the rest the submenu.
 *
 * @see https://dhoulb.github.io/shelving/ui/menu/Menu/MenuItemProps
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
 * @param href The link target, used to compute `active`/`proud` against the current URL.
 * @param children The label (first node) and optional submenu (remaining nodes).
 * @param props Additional `<Clickable>` props.
 * @returns The menu item element.
 * @example <MenuItem href="/settings">Settings</MenuItem>
 * @see https://dhoulb.github.io/shelving/ui/menu/Menu/MenuItem
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
