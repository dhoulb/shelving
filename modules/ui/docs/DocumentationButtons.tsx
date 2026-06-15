import type { ReactElement } from "react";
import type { DocumentationElementProps } from "../../util/tree.js";
import { PARAGRAPH_CLASS } from "../block/Paragraph.js";
import { type FlexVariants, getFlexClass } from "../style/Flex.js";
import { getSpaceClass, type SpaceVariants } from "../style/Space.js";
import { TreeButton } from "../tree/TreeButton.js";
import { getClass } from "../util/css.js";

/**
 * Props for `DocumentationButtons` — the relational metadata of a documented symbol (`class`, `extends`, `implements`), plus block-space and flex overrides.
 *
 * @see https://dhoulb.github.io/shelving/ui/docs/DocumentationButtons/DocumentationButtonsProps
 */
export interface DocumentationButtonsProps
	extends Pick<DocumentationElementProps, "class" | "extends" | "implements">,
		SpaceVariants,
		FlexVariants {}

/** One labelled relation — a sentence-case prefix plus the symbol it points at. */
function* _relations({
	class: className,
	extends: extendsName,
	implements: implementsNames,
}: DocumentationButtonsProps): Iterable<readonly [label: string, to: string]> {
	if (extendsName) yield ["extends", extendsName];
	for (const name of implementsNames ?? []) yield ["implements", name];
	// `member of` comes last — it's the broadest relation, the others are more specific.
	if (className) yield ["member of", className];
}

/**
 * Render a symbol's relational metadata as a `<nav>` column of labelled links.
 * - Each relation reads as `"{label} {Target}"` — e.g. `extends AbstractStore`, `implements Serializable`, `member of Store`.
 * - The target is a `<DocumentationButton>`, so it links to the referenced page when it exists in the tree and stays a plain label otherwise.
 * - Block spacing defaults to paragraph spacing (via `PARAGRAPH_CLASS`); pass `space` to override. Inner spacing is the flex gap.
 * - Renders nothing when the symbol has no relations.
 *
 * @kind component
 */
export function DocumentationButtons({ wrap = true, left = true, gap = "none", ...props }: DocumentationButtonsProps): ReactElement | null {
	const relations = Array.from(_relations(props));
	if (!relations.length) return null;
	return (
		<nav
			className={getClass(
				PARAGRAPH_CLASS, //
				getFlexClass({ wrap, left, gap, ...props }),
				getSpaceClass(props),
			)}
		>
			{relations.map(([label, to]) => (
				<TreeButton key={`${label}-${to}`} name={to}>
					{label} {to}
				</TreeButton>
			))}
		</nav>
	);
}
