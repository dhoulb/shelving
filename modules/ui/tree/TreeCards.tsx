import type { ReactNode } from "react";
import type { Elements } from "../../util/element.js";
import { createMapper } from "../misc/Mapper.js";
import TREE_CARDS_CSS from "./TreeCards.module.css";

export const [TreeCardMapping, TreeCardMapper] = createMapper();

export interface TreeCardsProps {
	/** Elements to render as cards. */
	children?: Elements;
}

/** Grid of cards built from a tree of elements. */
export function TreeCards({ children }: TreeCardsProps): ReactNode {
	return (
		<div className={TREE_CARDS_CSS.grid}>
			<TreeCardMapper>{children}</TreeCardMapper>
		</div>
	);
}
