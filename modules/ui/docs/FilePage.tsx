import type { ReactNode } from "react";
import type { FileElementProps } from "../../util/element.js";
import { Paragraph } from "../block/Paragraph.js";
import { Page } from "../page/Page.js";
import { TreeCards } from "../tree/TreeCards.js";

/** Page renderer for a `tree-file` element — shows title, description, content, and child code symbols. */
export function FilePage({ title, name, description, content, children }: FileElementProps): ReactNode {
	return (
		<Page title={title ?? name}>
			{description && <Paragraph>{description}</Paragraph>}
			{content}
			{children && <TreeCards>{children}</TreeCards>}
		</Page>
	);
}
