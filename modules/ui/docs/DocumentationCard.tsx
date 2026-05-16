import type { ReactNode } from "react";
import type { DocumentationElementProps } from "../../util/element.js";
import { Card } from "../block/Card.js";
import { Heading } from "../block/Heading.js";
import { Paragraph } from "../block/Paragraph.js";
import { Preformatted } from "../block/Preformatted.js";
import { Code } from "../inline/Code.js";
import { requireTreeHref } from "../tree/TreePathContext.js";
import { DocumentationKind } from "./DocumentationKind.js";

/** Card renderer for a `tree-documentation` element. */
export function DocumentationCard({ title, name, kind, description, signatures }: DocumentationElementProps): ReactNode {
	const label = title ?? name;
	return (
		<Card href={requireTreeHref()} title={label}>
			<Heading level="3">
				<Code>{label}</Code>
			</Heading>
			{kind && <DocumentationKind kind={kind} />}
			{signatures?.map(sig => (
				<Preformatted key={sig}>{sig}</Preformatted>
			))}
			{description && <Paragraph>{description}</Paragraph>}
		</Card>
	);
}
