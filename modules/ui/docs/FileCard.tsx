import type { ReactNode } from "react";
import type { FileElementProps } from "../../util/element.js";
import { TREE_CARD_CLASS, TREE_CARD_DESCRIPTION_CLASS, TREE_CARD_TITLE_CLASS } from "../tree/TreeCards.js";
import { requireTreeHref } from "../tree/TreePathContext.js";

/** Card renderer for a `tree-file` element. */
export function FileCard({ title, name, description }: FileElementProps): ReactNode {
	const href = requireTreeHref();
	return (
		<a className={TREE_CARD_CLASS} href={href}>
			<h3 className={TREE_CARD_TITLE_CLASS}>{title ?? name}</h3>
			{description && <p className={TREE_CARD_DESCRIPTION_CLASS}>{description}</p>}
		</a>
	);
}
