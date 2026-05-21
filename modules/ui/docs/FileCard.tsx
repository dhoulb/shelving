import type { ReactNode } from "react";
import type { FileElementProps } from "../../util/element.js";
import { type AbsolutePath, joinPath } from "../../util/path.js";
import { Card } from "../block/Card.js";
import { Prose } from "../block/Prose.js";
import { Subheading } from "../block/Subheading.js";
import { Markup } from "../misc/Markup.js";

interface FileCardProps extends FileElementProps {
	path?: AbsolutePath | undefined;
}

/** Card renderer for a `tree-file` element. */
export function FileCard({ path = "/", title, name, content }: FileCardProps): ReactNode {
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
