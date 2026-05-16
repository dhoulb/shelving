import type { ReactNode } from "react";
import type { TreeElements } from "../../util/element.js";
import { DirectoryCard } from "../docs/DirectoryCard.js";
import { DocumentationCard } from "../docs/DocumentationCard.js";
import { FileCard } from "../docs/FileCard.js";
import { getModuleClass } from "../util/css.js";
import TREE_CARDS_CSS from "./TreeCards.module.css";
import { type TreeMapping, TreeRenderer } from "./TreeRenderer.js";

// Classes.
export const TREE_CARDS_GRID_CLASS = getModuleClass(TREE_CARDS_CSS, "grid");
export const TREE_CARD_CLASS = getModuleClass(TREE_CARDS_CSS, "card");
export const TREE_CARD_TITLE_CLASS = getModuleClass(TREE_CARDS_CSS, "title");
export const TREE_CARD_DESCRIPTION_CLASS = getModuleClass(TREE_CARDS_CSS, "description");

/**
 * Default mapping for card renderers.
 * - Override by passing a different `mapping` prop to `<TreeCards>`.
 */
export const DEFAULT_TREE_CARD_MAPPING: TreeMapping = {
	"tree-directory": DirectoryCard,
	"tree-file": FileCard,
	"tree-documentation": DocumentationCard,
};

export interface TreeCardsProps {
	/** Elements to render as cards. */
	children: TreeElements;
	/** Component dispatch table — defaults to `DEFAULT_TREE_CARD_MAPPING`. */
	mapping?: TreeMapping;
}

/** Grid of cards rendered from a flat collection of tree elements. */
export function TreeCards({ children, mapping = DEFAULT_TREE_CARD_MAPPING }: TreeCardsProps): ReactNode {
	return (
		<div className={TREE_CARDS_GRID_CLASS}>
			<TreeRenderer tree={children} mapping={mapping} />
		</div>
	);
}
