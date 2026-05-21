import type { ReactNode } from "react";
import { type DocumentationElementProps, type Element, filterElements, type TreeElements, walkElements } from "../../util/element.js";
import type { AbsolutePath } from "../../util/path.js";
import { Heading } from "../block/Heading.js";
import { Section } from "../block/Section.js";
import { DirectoryCard } from "../docs/DirectoryCard.js";
import { DocumentationCard } from "../docs/DocumentationCard.js";
import { FileCard } from "../docs/FileCard.js";
import { createMapper } from "../misc/Mapper.js";

/** Extras threaded through `TreeCardMapper` to every card — currently just the parent URL path. */
export interface TreeCardExtras {
	/** URL path of the parent element. Each card computes its own path as `path + mapped.name`. Defaults to `/`. */
	readonly path: AbsolutePath;
}

/** Mapping + Mapper pair for tree cards — wrap children in `<TreeCardMapping>` to override. */
export const [TreeCardMapping, TreeCardMapper] = createMapper<TreeCardExtras>({
	"tree-directory": DirectoryCard,
	"tree-file": FileCard,
	"tree-documentation": DocumentationCard,
});

/**
 * Section heading for each documentation `kind`, in display order.
 * - Labels are pluralised and sentence case; a section only renders when its group is non-empty.
 */
const KIND_SECTIONS: ReadonlyArray<readonly [kind: string, label: string]> = [
	["function", "Functions"],
	["class", "Classes"],
	["interface", "Interfaces"],
	["type", "Types"],
	["constant", "Constants"],
	["method", "Methods"],
	["property", "Properties"],
];
const KNOWN_KINDS: ReadonlySet<string> = new Set(KIND_SECTIONS.map(([kind]) => kind));

export interface TreeCardsProps {
	/** The children to render as cards. */
	readonly children?: TreeElements;
	/** URL path of the parent element. Each card appends its own name to compute its href. */
	readonly path?: AbsolutePath | undefined;
	/** Group `tree-documentation` children into `kind`-based sections, each under its own heading. */
	readonly grouped?: boolean | undefined;
}

/**
 * Render a list of tree elements as a stack of cards.
 * - Each element is dispatched via `<TreeCardMapper>` to its registered renderer.
 * - `path` is threaded through to each card so it can compute its href as `path + name`.
 * - With `grouped`, `tree-documentation` children are partitioned by `kind` into sections (Functions, Classes, …),
 *   each under its own `<h2>`; elements with no known kind render together in a trailing ungrouped stack.
 * - To override the renderer for a specific element type, wrap in `<TreeCardMapping mapping={…}>`.
 */
export function TreeCards({ path = "/", children, grouped }: TreeCardsProps): ReactNode {
	if (!grouped) return <TreeCardMapper path={path}>{walkElements(children)}</TreeCardMapper>;
	const ungrouped = Array.from(filterElements(children, _isUngrouped));
	return (
		<>
			{KIND_SECTIONS.map(([kind, label]) => {
				const group = Array.from(filterElements(children, el => _getKind(el) === kind));
				return group.length ? (
					<Section key={kind}>
						<Heading>{label}</Heading>
						<TreeCardMapper path={path}>{group}</TreeCardMapper>
					</Section>
				) : null;
			})}
			{!!ungrouped.length && <TreeCardMapper path={path}>{ungrouped}</TreeCardMapper>}
		</>
	);
}

/** Get the documentation `kind` of an element, or `undefined` when it isn't a `tree-documentation` element. */
function _getKind(element: Element): string | undefined {
	return element.type === "tree-documentation" ? (element.props as DocumentationElementProps).kind : undefined;
}

/** An element is ungrouped when it isn't a documentation element or carries no known `kind`. */
function _isUngrouped(element: Element): boolean {
	const kind = _getKind(element);
	return !kind || !KNOWN_KINDS.has(kind);
}
