import type { ReactNode } from "react";
import { type AbsolutePath, joinPath } from "../../util/path.js";
import type { DocumentationElementProps } from "../../util/tree.js";
import { Card } from "../block/Card.js";
import { Paragraph } from "../block/Paragraph.js";
import { Preformatted } from "../block/Preformatted.js";
import { Subheading } from "../block/Subheading.js";
import { Code } from "../inline/Code.js";
import { Tag } from "../misc/Tag.js";
import { Flex } from "../style/Flex.js";
import { DocumentationButtons } from "./DocumentationButtons.js";
import { DocumentationKind, getDocumentationKindColor } from "./DocumentationKind.js";

interface DocumentationCardProps extends DocumentationElementProps {
	path: AbsolutePath;
}

/** Card renderer for a `tree-documentation` element — a summary card showing the heading, relational links, signatures, and description. */
export function DocumentationCard({
	path,
	title,
	name,
	kind,
	description,
	signatures,
	readonly,
	// Drop `class` so cards omit the "member of" relation — a member card almost always sits on its own class's page already.
	class: _memberOf,
	...props
}: DocumentationCardProps): ReactNode {
	const href = joinPath(path, name);
	const color = kind ? getDocumentationKindColor(kind) : undefined;
	return (
		<Card href={href} {...(color ? { [color]: true } : {})}>
			<Subheading>
				<Flex left wrap>
					<Code>{title ?? name}</Code>
					{kind && <DocumentationKind kind={kind} />}
					{readonly && <Tag yellow>readonly</Tag>}
				</Flex>
			</Subheading>
			<DocumentationButtons {...props} />
			{signatures?.map(sig => (
				<Preformatted key={sig}>{sig}</Preformatted>
			))}
			{description && <Paragraph>{description}</Paragraph>}
		</Card>
	);
}
