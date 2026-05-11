import type { ReactNode } from "react";
import { getElements, type PossibleElements } from "../../util/element.js";
import { MapElements } from "../misc/ElementMapper.js";
import TREE_CARDS_CSS from "./TreeCards.module.css";

export interface TreeCardsProps {
	/** Elements to render as cards. */
	children?: PossibleElements;
}

/** Grid of cards built from a tree of elements. */
export function TreeCards({ children }: TreeCardsProps): ReactNode {
	return (
		<div className={TREE_CARDS_CSS.grid}>
			<MapElements prefix="TreeCard">{getElements(children)}</MapElements>
		</div>
	);
}
