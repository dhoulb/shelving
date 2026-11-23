import type { ReactNode } from "react";
import { isArray } from "../../util/array.js";
import { getLink, isURLActive, isURLProud } from "../../util/index.js";
import { Label, type LabelProps } from "../block/Label.js";
import { Clickable, type ClickableProps } from "../button/Clickable.js";
import { requireMeta } from "../misc/MetaContext.js";
import { type BlockVariants, getBlockClass } from "../style/Block.js";
import { getClass, getModuleClass } from "../util/css.js";
import type { ClassProps, OptionalChildProps } from "../util/props.js";
import MENU_CSS from "./Menu.module.css";

const MENU_CLASS = getModuleClass(MENU_CSS, "menu");
const MENU_ITEM_CLASS = getModuleClass(MENU_CSS, "item");
const MENU_LINK_CLASS = getModuleClass(MENU_CSS, "link");
const MENU_PROUD_CLASS = getModuleClass(MENU_CSS, "proud");
const MENU_ACTIVE_CLASS = getModuleClass(MENU_CSS, "active");
const MENU_SELECTED_CLASS = getModuleClass(MENU_CSS, "selected");
const MENU_SMALL_CLASS = getModuleClass(MENU_CSS, "small");
const MENU_HEADING_CLASS = getModuleClass(MENU_CSS, "heading");

/**
 * Props for `<Menu>` — optional `<MenuItem>` `children`.
 *
 * @see https://shelving.cc/ui/MenuProps
 */
export interface MenuProps extends BlockVariants, OptionalChildProps, ClassProps {
	/** Make every item in the menu (and in any nested menu) small, as if each `<MenuItem>` had `small`. */
	readonly small?: boolean | undefined;
}

/**
 * A `<menu>` list of `<MenuItem>` children.
 * - Renders as a bare `<menu>` element — semantically equivalent to `<ul>` per HTML spec but more meaningful for menu contexts. Place inside a `<nav>` (or use the sidebar-style nav at the layout level) if a navigation landmark is needed.
 * - Nested `<Menu>` instances (typically inside a `<MenuItem>`) get indented via the `.menu .menu` CSS rule.
 * - Pass `small` to make every item smaller, for example in a dense sidebar.
 *
 * @kind component
 * @see https://shelving.cc/ui/Menu
 */
export function Menu({ children, small, className, ...props }: MenuProps): ReactNode {
	return (
		<menu
			className={getClass(
				MENU_CLASS, //
				small && MENU_SMALL_CLASS,
				getBlockClass(props),
				className,
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
export interface MenuItemProps extends ClickableProps, ClassProps {
	/**
	 * The first child becomes the link label (rendered inside the `<a>`).
	 * - Any additional children form the submenu — only rendered when this item is "proud" (an ancestor of the current page). The caller is responsible for wrapping the submenu in a nested `<Menu>` if it wants the CSS `.menu .menu` descendant rules to apply.
	 */
	readonly children: ReactNode | readonly [ReactNode, ...ReactNode[]];
	/** Make the item smaller: less padding and no minimum height. By default an item is as tall as a `<Button>`, so it is easy to tap. */
	readonly small?: boolean | undefined;
}

/**
 * A `<li>` containing an `<a>` link, plus optional submenu content shown when this item is "proud".
 * - Reads the current page URL from `<Meta>` and computes `active` / `proud` against its own `href`.
 * - Pass `selected` to give an item the hover fill, for example the item that the arrow keys move to in a list of suggestions.
 * - Splits `children` into `[label, ...after]`: label goes inside the `<a>`; `after` is rendered as siblings below it, only when proud.
 * - As tall as a `<Button>` by default, so it is easy to tap. Pass `small` for a denser item.
 *
 * @kind component
 * @see https://shelving.cc/ui/MenuItem
 */
export function MenuItem({ href, children, small, selected, className, ...props }: MenuItemProps): ReactNode {
	const { url, root } = requireMeta();
	const link = getLink(href, url, root);
	const proud = isURLProud(url, link);
	const active = isURLActive(url, link);
	const [label, ...after] = isArray(children) ? children : [children];
	return (
		<li className={getClass(MENU_ITEM_CLASS, className)}>
			<Clickable
				href={href}
				selected={selected}
				{...props}
				className={getClass(
					MENU_LINK_CLASS, //
					small && MENU_SMALL_CLASS,
					proud && MENU_PROUD_CLASS,
					active && MENU_ACTIVE_CLASS,
					selected && MENU_SELECTED_CLASS,
				)}
			>
				{label}
			</Clickable>
			{proud && after}
		</li>
	);
}

/**
 * Props for `<MenuHeading>` — `<Label>` props plus `small`.
 *
 * @see https://shelving.cc/ui/MenuHeadingProps
 */
export interface MenuHeadingProps extends LabelProps {
	/** Line up with small items, as in a `<Menu small>`. */
	readonly small?: boolean | undefined;
}

/**
 * A heading for a `<Menu>`, with the `<Label>` style, indented so its text lines up with the text of each `<MenuItem>`.
 * - Place it directly above the `<Menu>` it names.
 * - Pass `small` when the menu below it is small.
 *
 * @kind component
 * @see https://shelving.cc/ui/MenuHeading
 */
export function MenuHeading({ small, className, ...props }: MenuHeadingProps): ReactNode {
	return (
		<Label
			{...props}
			className={getClass(
				MENU_HEADING_CLASS, //
				small && MENU_SMALL_CLASS,
				className,
			)}
		/>
	);
}
