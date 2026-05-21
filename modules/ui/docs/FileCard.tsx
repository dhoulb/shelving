import type { ReactNode } from "react";
import type { FileElementProps } from "../../util/element.js";
import { type AbsolutePath, joinPath } from "../../util/path.js";
import { Card } from "../block/Card.js";
import { Paragraph } from "../block/Paragraph.js";
import { Subheading } from "../block/Subheading.js";

interface FileCardProps extends FileElementProps {
	path: AbsolutePath;
}

/** Card renderer for a `tree-file` element — a summary card showing the heading and description. */
export function FileCard({ path, name, title, description }: FileCardProps): ReactNode {
	const href = joinPath(path, name);
	return (
		<Card href={href}>
			<Subheading>{title ?? name}</Subheading>
			{description && <Paragraph>{description}</Paragraph>}
		</Card>
	);
}
