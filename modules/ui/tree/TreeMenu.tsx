import type { FunctionComponent, ReactNode } from "react";
import { type Element, type ElementProps, type Elements, getElements } from "../../util/element.js";
import { mapElements } from "../misc/ElementMapper.js";
import TREE_MENU_CSS from "./TreeMenu.module.css";

export interface TreeMenuProps {
	/** Elements to render as navigation links. */
	children?: Elements;
}

/** Sidebar navigation menu built from a tree of elements. */
export function TreeMenu({ children }: TreeMenuProps): ReactNode {
	const elements = Array.from(getElements(children)).filter(el => el.key);
	const mapped = mapElements(elements, "TreeMenu");
	return (
		<nav className={TREE_MENU_CSS.menu}>
			<ul className={TREE_MENU_CSS.list}>
				{mapped.map(el => (
					<TreeMenuItem key={el.key} element={el} />
				))}
			</ul>
		</nav>
	);
}

interface TreeMenuItemProps {
	element: Element;
}

/** Single menu item — delegates to mapped component if available, otherwise renders a plain link. */
function TreeMenuItem({ element }: TreeMenuItemProps): ReactNode {
	if (typeof element.type === "function") {
		const Component = element.type as FunctionComponent<ElementProps>;
		return <Component {...element.props} />;
	}
	const title = (element.props.title as string | undefined) ?? element.key;
	return (
		<li className={TREE_MENU_CSS.item}>
			<a className={TREE_MENU_CSS.link} href={`/${element.key}`}>
				{title}
			</a>
		</li>
	);
}
