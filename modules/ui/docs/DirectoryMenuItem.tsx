import type { CSSProperties, ReactNode } from "react";
import type { DirectoryElementProps } from "../../util/element.js";
import { requireMeta } from "../misc/MetaContext.js";
import { requireMenuItem } from "../tree/TreeMenu.js";
import TREE_MENU_CSS from "../tree/TreeMenu.module.css";

/** Menu item renderer for a `tree-directory` element. */
export function DirectoryMenuItem({ title, name }: DirectoryElementProps): ReactNode {
	const { href, depth } = requireMenuItem();
	const { url } = requireMeta();
	const isActive = url?.pathname === href;
	return (
		<a
			className={TREE_MENU_CSS.entry}
			href={href}
			style={{ "--menu-depth": depth } as CSSProperties}
			aria-current={isActive ? "page" : undefined}
		>
			{title ?? name}
		</a>
	);
}
