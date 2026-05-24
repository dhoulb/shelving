import type { ReactNode } from "react";
import type { DocumentationElementProps } from "../../util/element.js";
import { type AbsolutePath, joinPath } from "../../util/path.js";
import { Card } from "../block/Card.js";
import { Paragraph } from "../block/Paragraph.js";
import { Preformatted } from "../block/Preformatted.js";
import { Subheading } from "../block/Subheading.js";
import { Code } from "../inline/Code.js";
import { Flex } from "../style/Flex.js";
import { DocumentationKind } from "./DocumentationKind.js";

interface DocumentationCardProps extends DocumentationElementProps {
	path: AbsolutePath;
}

/** Card renderer for a `tree-documentation` element — a summary card showing the heading, signatures, and description. */
export function DocumentationCard({ path, title, name, kind, description, signatures }: DocumentationCardProps): ReactNode {
	const href = joinPath(path, name);
	return (
		<Card href={href}>
			<Subheading>
				<Flex left wrap>
					<Code>{title ?? name}</Code>
					{kind && <DocumentationKind kind={kind} />}
				</Flex>
			</Subheading>
			{signatures?.map(sig => (
				<Preformatted key={sig}>{sig}</Preformatted>
			))}
			{description && <Paragraph>{description}</Paragraph>}
		</Card>
	);
}
