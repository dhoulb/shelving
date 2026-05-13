import type { ReactNode } from "react";
import type { TreeElements } from "../../util/element.js";
import { DirectoryCard } from "../docs/DirectoryCard.js";
import { DocumentationCard } from "../docs/DocumentationCard.js";
import { FileCard } from "../docs/FileCard.js";
import { createMapper } from "../misc/Mapper.js";
import TREE_CARDS_CSS from "./TreeCards.module.css";

/**
 * Default mappings for the most common tree element types.
 * - Consumers can override individual entries via `<TreeCardMapping>`.
 */
export const [TreeCardMapping, TreeCardMapper] = createMapper({
	"tree-directory": DirectoryCard,
	"tree-file": FileCard,
	"tree-documentation": DocumentationCard,
});

export interface TreeCardsProps {
	/** Elements to render as cards. */
	children: TreeElements;
}

/** Grid of cards rendered from a flat collection of tree elements. */
export function TreeCards({ children }: TreeCardsProps): ReactNode {
	return (
		<div className={TREE_CARDS_CSS.grid}>
			<TreeCardMapper>{children}</TreeCardMapper>
		</div>
	);
}
