import type { ReactNode } from "react";
import { walkElements } from "../../util/element.js";
import type { AbsolutePath } from "../../util/path.js";
import type { TreeElements } from "../../util/tree.js";
import { DocumentationCard } from "../docs/DocumentationCard.js";
import { createMapper } from "../misc/Mapper.js";
import { TreeCard } from "./TreeCard.js";

/** Extras threaded through `TreeCardMapper` to every card — currently just the parent URL path. */
export interface TreeCardExtras {
	/** URL path of the parent element. Each card computes its own path as `path + mapped.name`. Defaults to `/`. */
	readonly path: AbsolutePath;
}

/** Mapping + Mapper pair for tree cards — wrap children in `<TreeCardMapping>` to override. */
export const [TreeCardMapping, TreeCardMapper] = createMapper<TreeCardExtras>({
	"tree-element": TreeCard,
	"tree-documentation": DocumentationCard,
});

export interface TreeCardsProps {
	/** The children to render as cards. */
	readonly children?: TreeElements;
	/** URL path of the parent element. Each card appends its own name to compute its href. */
	readonly path?: AbsolutePath | undefined;
}

/**
 * Render a list of tree elements as a stack of cards.
 * - Each element is dispatched via `<TreeCardMapper>` to its registered renderer.
 * - `path` is threaded through to each card so it can compute its href as `path + name`.
 * - To override the renderer for a specific element type, wrap in `<TreeCardMapping mapping={…}>`.
 */
export function TreeCards({ path = "/", children }: TreeCardsProps): ReactNode {
	return <TreeCardMapper path={path}>{walkElements(children)}</TreeCardMapper>;
}
