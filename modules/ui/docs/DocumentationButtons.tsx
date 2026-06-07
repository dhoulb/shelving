import type { ReactElement } from "react";
import type { DocumentationElementProps } from "../../util/tree.js";
import { PARAGRAPH_CLASS } from "../block/Paragraph.js";
import { getFlexClass } from "../style/Flex.js";
import { getSpacingClass, type SpacingVariants } from "../style/Spacing.js";
import { getClass } from "../util/css.js";
import { DocumentationButton } from "./DocumentationButton.js";

/** Props for `DocumentationButtons` — the relational metadata of a documented symbol, plus block-spacing overrides. */
export interface DocumentationButtonsProps
	extends Pick<DocumentationElementProps, "class" | "overrides" | "extends" | "implements">,
		SpacingVariants {}

/** One labelled relation — a sentence-case prefix plus the symbol it points at. */
function* _relations({
	class: className,
	overrides,
	extends: extendsName,
	implements: implementsNames,
}: DocumentationButtonsProps): Iterable<readonly [label: string, to: string]> {
	if (overrides) yield ["overrides", overrides];
	if (extendsName) yield ["extends", extendsName];
	for (const name of implementsNames ?? []) yield ["implements", name];
	// `member of` comes last — it's the broadest relation, the others are more specific.
	if (className) yield ["member of", className];
}

/**
 * Render a symbol's relational metadata as a `<nav>` column of labelled links.
 * - Each relation reads as `"{label} {Target}"` — e.g. `overrides AbstractStore.get`, `implements Serializable`, `member of Store`.
 * - The target is a `<DocumentationButton>`, so it links to the referenced page when it exists in the tree and stays a plain label otherwise.
 * - Block spacing defaults to paragraph spacing (via `PARAGRAPH_CLASS`); pass a `space-*` variant to override. Inner spacing is the flex gap.
 * - Renders nothing when the symbol has no relations.
 */
export function DocumentationButtons(props: DocumentationButtonsProps): ReactElement | null {
	const relations = Array.from(_relations(props));
	if (!relations.length) return null;
	return (
		<nav className={getClass(PARAGRAPH_CLASS, getFlexClass({ column: true, left: true }), getSpacingClass(props))}>
			{relations.map(([label, to]) => (
				<DocumentationButton key={`${label}-${to}`} to={to}>
					{`${label} ${to}`}
				</DocumentationButton>
			))}
		</nav>
	);
}
