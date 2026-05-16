import type { ReactNode } from "react";
import type { FileElementProps } from "../../util/element.js";
import TREE_CARDS_CSS from "../tree/TreeCards.module.css";
import { requireTreeHref } from "../tree/TreePathContext.js";

/** Card renderer for a `tree-file` element. */
export function FileCard({ title, name, description }: FileElementProps): ReactNode {
	const href = requireTreeHref();
	return (
		<a className={TREE_CARDS_CSS.card} href={href}>
			<h3 className={TREE_CARDS_CSS.title}>{title ?? name}</h3>
			{description && <p className={TREE_CARDS_CSS.description}>{description}</p>}
		</a>
	);
}
