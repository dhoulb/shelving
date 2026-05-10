import type { ReactNode } from "react";
import { type Element, type Elements, getElements } from "../../util/element.js";
import { useElementComponent } from "./ElementContext.js";
import TREE_CARDS_CSS from "./TreeCards.module.css";

export interface TreeCardsProps {
	/** Elements to render as cards. */
	children?: Elements;
}

/** Grid of cards built from a tree of elements. */
export function TreeCards({ children }: TreeCardsProps): ReactNode {
	return (
		<div className={TREE_CARDS_CSS.grid}>
			{Array.from(getElements(children), element => (element.key ? <TreeCard key={element.key} element={element} /> : null))}
		</div>
	);
}

interface TreeCardProps {
	element: Element;
}

/** Single card — delegates to the registered `card.*` component if available, otherwise renders a default card. */
function TreeCard({ element }: TreeCardProps): ReactNode {
	const Component = useElementComponent("card", element.type as string);
	if (Component) return <Component element={element} />;
	const title = (element.props.title as string | undefined) ?? element.key;
	const description = element.props.description as string | undefined;
	return (
		<a className={TREE_CARDS_CSS.card} href={`/${element.key}`}>
			<h3 className={TREE_CARDS_CSS.title}>{title}</h3>
			{description ? <p className={TREE_CARDS_CSS.description}>{description}</p> : null}
		</a>
	);
}
