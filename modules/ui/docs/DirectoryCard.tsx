import type { ReactNode } from "react";
import type { DirectoryElementProps } from "../../util/element.js";
import { Card } from "../block/Card.js";
import { Heading } from "../block/Heading.js";
import { Prose } from "../block/Prose.js";
import { Markup } from "../misc/Markup.js";
import { requireTreeHref } from "../tree/TreePathContext.js";

/** Card renderer for a `tree-directory` element. */
export function DirectoryCard({ title, name, content }: DirectoryElementProps): ReactNode {
	return (
		<Card href={requireTreeHref()}>
			<Heading level="3">{title ?? name}</Heading>
			{content && (
				<Prose>
					<Markup>{content}</Markup>
				</Prose>
			)}
		</Card>
	);
}
