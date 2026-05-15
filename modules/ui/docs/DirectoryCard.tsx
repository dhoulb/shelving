import type { ReactNode } from "react";
import type { DirectoryElementProps } from "../../util/element.js";
import { requireTreeHref } from "../tree/TreePathContext.js";
import TREE_CARDS_CSS from "../tree/TreeCards.module.css";

/** Card renderer for a `tree-directory` element. */
export function DirectoryCard({ title, name, description }: DirectoryElementProps): ReactNode {
	const href = requireTreeHref();
	return (
		<a className={TREE_CARDS_CSS.card} href={href}>
			<h3 className={TREE_CARDS_CSS.title}>{title ?? name}</h3>
			{description && <p className={TREE_CARDS_CSS.description}>{description}</p>}
		</a>
	);
}
