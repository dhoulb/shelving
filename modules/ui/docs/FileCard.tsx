import type { ReactNode } from "react";
import type { FileElementProps } from "../../util/element.js";
import { type AbsolutePath, joinPath } from "../../util/path.js";
import { Card } from "../block/Card.js";
import { Heading } from "../block/Heading.js";
import { Prose } from "../block/Prose.js";
import { Markup } from "../misc/Markup.js";

interface FileCardProps extends FileElementProps {
	path: AbsolutePath;
}

/** Card renderer for a `tree-file` element. */
export function FileCard({ path, name, title, content }: FileCardProps): ReactNode {
	const href = joinPath(path, name);
	return (
		<Card href={href}>
			<Heading level="3">{title ?? name}</Heading>
			{content && (
				<Prose>
					<Markup>{content}</Markup>
				</Prose>
			)}
		</Card>
	);
}
