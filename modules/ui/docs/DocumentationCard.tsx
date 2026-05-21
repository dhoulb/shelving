import type { ReactNode } from "react";
import type { DocumentationElementProps } from "../../util/element.js";
import { type AbsolutePath, joinPath } from "../../util/path.js";
import { Card } from "../block/Card.js";
import { Flex } from "../block/Flex.js";
import { Heading } from "../block/Heading.js";
import { Preformatted } from "../block/Preformatted.js";
import { Prose } from "../block/Prose.js";
import { Code } from "../inline/Code.js";
import { Markup } from "../misc/Markup.js";
import { DocumentationKind } from "./DocumentationKind.js";

interface DocumentationCardProps extends DocumentationElementProps {
	path: AbsolutePath;
}

/** Card renderer for a `tree-documentation` element. */
export function DocumentationCard({ path, title, name, kind, content, signatures }: DocumentationCardProps): ReactNode {
	const href = joinPath(path, name);
	return (
		<Card href={href}>
			<Heading level="3">
				<Flex left>
					<Code>{title ?? name}</Code>
					{kind && <DocumentationKind kind={kind} />}
				</Flex>
			</Heading>
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
