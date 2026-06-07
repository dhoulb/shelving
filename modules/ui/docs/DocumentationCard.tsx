import type { ReactNode } from "react";
import { type AbsolutePath, joinPath } from "../../util/path.js";
import type { DocumentationElementProps } from "../../util/tree.js";
import { Card } from "../block/Card.js";
import { Paragraph } from "../block/Paragraph.js";
import { Subheading } from "../block/Subheading.js";
import { DocumentationButtons } from "./DocumentationButtons.js";
import { getDocumentationKindColor } from "./DocumentationKind.js";

interface DocumentationCardProps extends DocumentationElementProps {
	path: AbsolutePath;
}

/**
 * Card renderer for a `tree-documentation` element — a summary card.
 * - The heading is the symbol's signature(s) (each a monospace `<Subheading>`, one per overload), which already carry the name; falls back to the bare name for symbols with no signature (classes, interfaces, modules).
 * - The card is tinted by `kind` (colour carries the method/property/etc. distinction — no separate tag).
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
}: DocumentationCardProps): ReactNode {
	const href = joinPath(path, name);
	const color = kind ? getDocumentationKindColor(kind) : undefined;
	return (
		<Card href={href} {...(color ? { [color]: true } : {})}>
			{signatures?.length ? (
				signatures.map(sig => (
					<Subheading key={sig} monospace>
						{sig}
					</Subheading>
				))
			) : (
				<Subheading>{title ?? name}</Subheading>
			)}
			<DocumentationButtons {...props} />
			{description && <Paragraph>{description}</Paragraph>}
		</Card>
	);
}
