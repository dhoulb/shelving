import type { ReactNode } from "react";
import type { DocumentationElementProps } from "../../util/element.js";
import { Card } from "../block/Card.js";
import { Heading } from "../block/Heading.js";
import { Preformatted } from "../block/Preformatted.js";
import { Prose } from "../block/Prose.js";
import { Code } from "../inline/Code.js";
import { Markup } from "../misc/Markup.js";
import { requireTreeHref } from "../tree/TreePathContext.js";
import { DocumentationKind } from "./DocumentationKind.js";

/** Card renderer for a `tree-documentation` element. */
export function DocumentationCard({ title, name, kind, content, signatures }: DocumentationElementProps): ReactNode {
	return (
		<Card href={requireTreeHref()}>
			<Heading level="3">
				<Code>{title ?? name}</Code>
			</Heading>
			{kind && <DocumentationKind kind={kind} />}
			{signatures?.map(sig => (
				<Preformatted key={sig}>{sig}</Preformatted>
			))}
			{content && (
				<Prose>
					<Markup>{content}</Markup>
				</Prose>
			)}
		</Card>
	);
}
