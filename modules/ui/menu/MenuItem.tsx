import type { ReactNode } from "react";
import { isPathActive, isPathProud } from "../../util/path.js";
import { requireMeta } from "../misc/MetaContext.js";
import { requireTreeHref } from "../tree/TreePathContext.js";
import { getModuleClass } from "../util/css.js";
import MENU_CSS from "./Menu.module.css";

export interface MenuItemProps {
	/** Label/content for the menu item — typically `title ?? name`. */
	readonly children?: ReactNode;
	/** Nested content rendered beneath the link when this item is "proud" (active or ancestor of active). */
	readonly nested?: ReactNode;
}

/**
 * A `<li>` containing an `<a>` link, plus optional nested children rendered when "proud".
 * - Reads its own `href` from the surrounding `<TreePathContext>` (the path-chain of the currently-rendering tree element).
 * - Reads the page URL from the surrounding `<Meta>` context and computes `active` / `proud` via `isPathActive` / `isPathProud`.
 * - Works without `<Navigation>` — a static site sets `<Meta url>` once and the comparison still works.
 */
export function MenuItem({ children, nested }: MenuItemProps): ReactNode {
	const href = requireTreeHref();
	const { url } = requireMeta();
	const current = url?.pathname;
	const active = current ? isPathActive(current, href) : false;
	const proud = current ? isPathProud(current, href) : false;

	return (
		<li className={getModuleClass(MENU_CSS, "item", { proud })}>
			<a className={getModuleClass(MENU_CSS, "link")} href={href} aria-current={active ? "page" : undefined}>
				{children}
			</a>
			{proud && nested ? <div className={getModuleClass(MENU_CSS, "nested")}>{nested}</div> : null}
		</li>
	);
}
