import type { ReactNode } from "react";
import { walkElements } from "../../util/element.js";
import type { TreeElements } from "../../util/tree.js";
import { DocumentationCard } from "../docs/DocumentationCard.js";
import { createMapper } from "../misc/Mapper.js";
import { TreeCard } from "./TreeCard.js";

/** Mapping + Mapper pair for tree cards — wrap children in `<TreeCardMapping>` to override. */
export const [TreeCardMapping, TreeCardMapper] = createMapper({
	"tree-element": TreeCard,
	"tree-documentation": DocumentationCard,
});

export interface TreeCardsProps {
	/** The children to render as cards. */
	readonly children?: TreeElements;
}

/**
 * Render a list of tree elements as a stack of cards.
 * - Each element is dispatched via `<TreeCardMapper>` to its registered renderer; each card links to its own stamped `path`.
 * - To override the renderer for a specific element type, wrap in `<TreeCardMapping mapping={…}>`.
 */
export function TreeCards({ children }: TreeCardsProps): ReactNode {
	return <TreeCardMapper>{walkElements(children)}</TreeCardMapper>;
}
