import { createContext, type ReactNode, use } from "react";
import { isElement, type TreeElement, type TreeElements } from "../../util/element.js";
import { DirectoryMenuItem } from "../docs/DirectoryMenuItem.js";
import { FileMenuItem } from "../docs/FileMenuItem.js";
import { createMapper } from "../misc/Mapper.js";
import TREE_MENU_CSS from "./TreeMenu.module.css";

/**
 * Default mappings for the most common tree element types.
 * - Consumers can override individual entries via `<TreeMenuMapping>`.
 * - Only directories and files appear in menus by default — code symbols are kept off the navigation.
 */
export const [TreeMenuMapping, TreeMenuMapper] = createMapper({
	"tree-directory": DirectoryMenuItem,
	"tree-file": FileMenuItem,
});

/** Context published to each menu item carrying its computed href and tree depth. */
const _MenuItemContext = createContext<{ href: string; depth: number }>({ href: "/", depth: 0 });

/** Read the current menu item's `href` and `depth` from context. */
export function requireMenuItem(): { href: string; depth: number } {
	return use(_MenuItemContext);
}

export interface TreeMenuProps {
	/** Root element whose children become the navigation links. */
	tree: TreeElement;
}

/**
 * Sidebar navigation menu built recursively from a root tree element.
 * - Each menu item receives its computed `href` (from the chain of element keys) and `depth` via `requireMenuItem()`.
 * - Renders nested `<ul>` lists for sub-trees.
 */
export function TreeMenu({ tree }: TreeMenuProps): ReactNode {
	return (
		<nav className={TREE_MENU_CSS.menu}>
			<_MenuList elements={tree.props.children} parentPath="/" depth={0} />
		</nav>
	);
}

function _MenuList({ elements, parentPath, depth }: { elements: TreeElements; parentPath: string; depth: number }): ReactNode {
	const items = Array.from(_walkTreeElements(elements));
	if (!items.length) return null;
	return (
		<ul className={TREE_MENU_CSS.list}>
			{items.map(element => {
				const href = depth === 0 ? `${parentPath}${element.key}` : `${parentPath}/${element.key}`;
				return (
					<li key={element.key} className={TREE_MENU_CSS.item}>
						<_MenuItemContext value={{ href, depth }}>
							<TreeMenuMapper>{element}</TreeMenuMapper>
						</_MenuItemContext>
						{element.props.children ? <_MenuList elements={element.props.children} parentPath={href} depth={depth + 1} /> : null}
					</li>
				);
			})}
		</ul>
	);
}

/** Flatten possibly-nested `TreeElements` into `tree-directory` / `tree-file` entries — code symbols don't belong in nav. */
function* _walkTreeElements(elements: TreeElements): Iterable<TreeElement> {
	if (!elements) return;
	if (isElement(elements)) {
		if ((elements.type === "tree-directory" || elements.type === "tree-file") && typeof elements.key === "string") {
			yield elements as TreeElement;
		}
		return;
	}
	for (const child of elements) yield* _walkTreeElements(child);
}
