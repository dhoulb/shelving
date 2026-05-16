import type { ReactNode } from "react";
import type { FileElementProps } from "../../util/element.js";
import { Card } from "../block/Card.js";
import { Heading } from "../block/Heading.js";
import { Paragraph } from "../block/Paragraph.js";
import { requireTreeHref } from "../tree/TreePathContext.js";

/** Card renderer for a `tree-file` element. */
export function FileCard({ title, name, description }: FileElementProps): ReactNode {
	const label = title ?? name;
	return (
		<Card href={requireTreeHref()} title={label}>
			<Heading level="3">{label}</Heading>
			{description && <Paragraph>{description}</Paragraph>}
		</Card>
	);
}
