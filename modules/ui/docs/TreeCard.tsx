import type { ReactNode } from "react";
import { type AbsolutePath, joinPath } from "../../util/path.js";
import type { TreeElementProps } from "../../util/tree.js";
import { Card } from "../block/Card.js";
import { Paragraph } from "../block/Paragraph.js";
import { Subheading } from "../block/Subheading.js";

interface TreeCardProps extends TreeElementProps {
	path: AbsolutePath;
}

/** Card renderer for a generic `tree-element` (a directory or file) — a summary card showing the heading and description. */
export function TreeCard({ path, name, title, description }: TreeCardProps): ReactNode {
	const href = joinPath(path, name);
	return (
		<Card href={href}>
			<Subheading>{title ?? name}</Subheading>
			{description && <Paragraph>{description}</Paragraph>}
		</Card>
	);
}
