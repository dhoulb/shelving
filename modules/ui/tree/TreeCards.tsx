import type { ReactNode } from "react";
import type { TreeElements } from "../../util/element.js";
import { DirectoryCard } from "../docs/DirectoryCard.js";
import { DocumentationCard } from "../docs/DocumentationCard.js";
import { FileCard } from "../docs/FileCard.js";
import { type TreeMapping, TreeRenderer } from "./TreeRenderer.js";

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

/**
 * Stack of cards rendered from a flat collection of tree elements.
 * - Each rendered card supplies its own `<Card>`-based styling; this component just sequences them.
 */
export function TreeCards({ children, mapping = DEFAULT_TREE_CARD_MAPPING }: TreeCardsProps): ReactNode {
	return <TreeRenderer tree={children} mapping={mapping} />;
}
