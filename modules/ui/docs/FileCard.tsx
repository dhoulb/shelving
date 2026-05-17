import type { ReactNode } from "react";
import type { FileElementProps } from "../../util/element.js";
import { Card } from "../block/Card.js";
import { Heading } from "../block/Heading.js";
import { Prose } from "../block/Prose.js";
import { Markup } from "../misc/Markup.js";
import { requireTreeHref } from "../tree/TreePathContext.js";

/** Card renderer for a `tree-file` element. */
export function FileCard({ title, name, content }: FileElementProps): ReactNode {
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
