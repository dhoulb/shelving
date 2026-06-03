import type { ReactNode } from "react";
import { type AbsolutePath, joinPath } from "../../util/path.js";
import type { DirectoryElementProps } from "../../util/tree.js";
import { Card } from "../block/Card.js";
import { Paragraph } from "../block/Paragraph.js";
import { Subheading } from "../block/Subheading.js";

interface DirectoryCardProps extends DirectoryElementProps {
	path: AbsolutePath;
}

/** Card renderer for a `tree-directory` element — a summary card showing the heading and description. */
export function DirectoryCard({ path, name, title, description }: DirectoryCardProps): ReactNode {
	const href = joinPath(path, name);
	return (
		<Card href={href}>
			<Subheading>{title ?? name}</Subheading>
			{description && <Paragraph>{description}</Paragraph>}
		</Card>
	);
}
