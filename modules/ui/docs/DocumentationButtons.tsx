import type { ReactElement } from "react";
import type { DocumentationElementProps } from "../../util/element.js";
import { Flex } from "../style/Flex.js";
import { DocumentationButton } from "./DocumentationButton.js";

/** Props for `DocumentationButtons` — the relational metadata of a documented symbol. */
export interface DocumentationButtonsProps extends Pick<DocumentationElementProps, "class" | "overrides" | "extends" | "implements"> {}

/** One labelled relation — a sentence-case prefix plus the symbol it points at. */
function* _relations({
	class: cls,
	overrides,
	extends: extendsName,
	implements: implementsNames,
}: DocumentationButtonsProps): Iterable<readonly [label: string, to: string]> {
	if (overrides) yield ["overrides", overrides];
	if (extendsName) yield ["extends", extendsName];
	for (const name of implementsNames ?? []) yield ["implements", name];
	// `member of` comes last — it's the broadest relation, the others are more specific.
	if (cls) yield ["member of", cls];
}

/**
 * Render a symbol's relational metadata as a wrapping row of labelled links.
 * - Each relation reads as `"{label} {Target}"` — e.g. `overrides AbstractStore.get`, `implements Serializable`, `member of Store`.
 * - The target is a `<DocumentationButton>`, so it links to the referenced page when it exists in the tree and stays a plain label otherwise.
 * - Renders nothing when the symbol has no relations.
 */
export function DocumentationButtons(props: DocumentationButtonsProps): ReactElement | null {
	const relations = Array.from(_relations(props));
	if (!relations.length) return null;
	return (
		<Flex left wrap>
			{relations.map(([label, to]) => (
				<DocumentationButton key={`${label}-${to}`} to={to}>
					{`${label} ${to}`}
				</DocumentationButton>
			))}
		</Flex>
	);
}
