import type { FunctionComponent, ReactNode } from "react";
import { type Element, type ElementProps, type Elements, getElements } from "../../util/element.js";
import { mapElements } from "../misc/ElementMapper.js";
import TREE_CARDS_CSS from "./TreeCards.module.css";

export interface TreeCardsProps {
	/** Elements to render as cards. */
	children?: Elements;
}

/** Grid of cards built from a tree of elements. */
export function TreeCards({ children }: TreeCardsProps): ReactNode {
	const elements = Array.from(getElements(children)).filter(el => el.key);
	const mapped = mapElements(elements, "TreeCard");
	return (
		<div className={TREE_CARDS_CSS.grid}>
			{mapped.map(el => (
				<TreeCard key={el.key} element={el} />
			))}
		</div>
	);
}

interface TreeCardProps {
	element: Element;
}

/** Single card — delegates to mapped component if available, otherwise renders a default card. */
function TreeCard({ element }: TreeCardProps): ReactNode {
	if (typeof element.type === "function") {
		const Component = element.type as FunctionComponent<ElementProps>;
		return <Component {...element.props} />;
	}
	const title = (element.props.title as string | undefined) ?? element.key;
	const description = element.props.description as string | undefined;
	return (
		<a className={TREE_CARDS_CSS.card} href={`/${element.key}`}>
			<h3 className={TREE_CARDS_CSS.title}>{title}</h3>
			{description ? <p className={TREE_CARDS_CSS.description}>{description}</p> : null}
		</a>
	);
}
