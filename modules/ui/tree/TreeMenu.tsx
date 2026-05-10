import type { ReactNode } from "react";
import { type Element, type Elements, getElements } from "../../util/element.js";
import { useElementComponent } from "./ElementContext.js";
import TREE_MENU_CSS from "./TreeMenu.module.css";

export interface TreeMenuProps {
	/** Elements to render as navigation links. */
	children?: Elements;
}

/** Sidebar navigation menu built from a tree of elements. */
export function TreeMenu({ children }: TreeMenuProps): ReactNode {
	return (
		<nav className={TREE_MENU_CSS.menu}>
			<ul className={TREE_MENU_CSS.list}>
				{Array.from(getElements(children), element => (element.key ? <TreeMenuItem key={element.key} element={element} /> : null))}
			</ul>
		</nav>
	);
}

interface TreeMenuItemProps {
	element: Element;
}

/** Single menu item — delegates to the registered `menu.*` component if available, otherwise renders a plain link. */
function TreeMenuItem({ element }: TreeMenuItemProps): ReactNode {
	const Component = useElementComponent("menu", element.type as string);
	if (Component) return <Component element={element} />;
	const title = (element.props.title as string | undefined) ?? element.key;
	return (
		<li className={TREE_MENU_CSS.item}>
			<a className={TREE_MENU_CSS.link} href={`/${element.key}`}>
				{title}
			</a>
		</li>
	);
}
