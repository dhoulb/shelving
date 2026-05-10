import type { FunctionComponent, ReactNode } from "react";
import { type Element, type ElementProps, getElements, type PossibleElements } from "../../util/element.js";
import { mapElements } from "../misc/ElementMapper.js";
import TREE_MENU_CSS from "./TreeMenu.module.css";

export interface TreeMenuProps {
	/** Elements to render as navigation links. */
	children?: PossibleElements;
}

/** Sidebar navigation menu built from a tree of elements. */
export function TreeMenu({ children }: TreeMenuProps): ReactNode {
	return (
		<nav className={TREE_MENU_CSS.menu}>
			<ul className={TREE_MENU_CSS.list}>
				{mapElements(getElements(children), "TreeMenu").map((el, i) => (
					<TreeMenuItem key={el.key ?? `index-${i}`} element={el} />
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
