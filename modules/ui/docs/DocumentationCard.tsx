import type { ReactNode } from "react";
import type { DocumentationElementProps } from "../../util/tree.js";
import { Card } from "../block/Card.js";
import { Paragraph } from "../block/Paragraph.js";
import { Row } from "../block/Row.js";
import { Subheading } from "../block/Subheading.js";
import { CollapseTransition } from "../transition/CollapseTransition.js";
import { DocumentationButtons } from "./DocumentationButtons.js";
import { DocumentationKind, getDocumentationKindColor } from "./DocumentationKind.js";
import { DocumentationSignatures } from "./DocumentationSignatures.js";

/**
 * Card renderer for a `tree-documentation` element — a compact summary card linking to the symbol's detail page.
 * - Leads with the symbol's signature(s) as calm code blocks (`<DocumentationSignatures>`, same as the detail page), which already carry the name; falls back to the bare name for symbols with no signature (classes, interfaces, modules).
 * - The card is tinted by `kind` (colour carries the method/property/etc. distinction — no separate tag).
 *
 * @kind component
 * @see https://shelving.cc/ui/DocumentationCard
 */
export function DocumentationCard({
	path,
	title,
	name,
	kind,
	description,
	signatures,
	// Drop `class` so cards omit the "member of" relation — a member card almost always sits on its own class's page already.
	class: _memberOf,
	...props
}: DocumentationElementProps): ReactNode {
	// `path` is the symbol's own canonical URL, stamped by `flattenTree()` — link straight to it.
	const color = kind ? getDocumentationKindColor(kind) : undefined;
	return (
		<Card href={path} color={color}>
			<Subheading space="none">
				<Row left wrap gap="xsmall">
					{title ?? name}
					{kind && <DocumentationKind kind={kind} />}
				</Row>
			</Subheading>
			<CollapseTransition>
				<DocumentationButtons {...props} space="none" />
			</CollapseTransition>
			{description && <Paragraph>{description}</Paragraph>}
			<DocumentationSignatures signatures={signatures} />
		</Card>
	);
}
