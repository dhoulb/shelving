import type { ReactNode } from "react";
import type { DirectoryElementProps } from "../../util/element.js";
import { Card } from "../block/Card.js";
import { Heading } from "../block/Heading.js";
import { Paragraph } from "../block/Paragraph.js";
import { requireTreeHref } from "../tree/TreePathContext.js";

/** Card renderer for a `tree-directory` element. */
export function DirectoryCard({ title, name, description }: DirectoryElementProps): ReactNode {
	const label = title ?? name;
	return (
		<Card href={requireTreeHref()} title={label}>
			<Heading level="3">{label}</Heading>
			{description && <Paragraph>{description}</Paragraph>}
		</Card>
	);
}
