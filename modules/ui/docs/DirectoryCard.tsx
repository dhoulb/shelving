import type { ReactNode } from "react";
import type { DirectoryElementProps } from "../../util/element.js";
import { type AbsolutePath, joinPath } from "../../util/path.js";
import { Card } from "../block/Card.js";
import { Prose } from "../block/Prose.js";
import { Subheading } from "../block/Subheading.js";
import { Markup } from "../misc/Markup.js";

interface DirectoryCardProps extends DirectoryElementProps {
	path: AbsolutePath;
}

/** Card renderer for a `tree-directory` element. */
export function DirectoryCard({ path, name, title, content }: DirectoryCardProps): ReactNode {
	const href = joinPath(path, name);
	return (
		<Card href={href}>
			<Subheading>{title ?? name}</Subheading>
			{content && (
				<Prose>
					<Markup>{content}</Markup>
				</Prose>
			)}
		</Card>
	);
}
