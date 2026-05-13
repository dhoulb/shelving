import type { ReactNode } from "react";
import type { DirectoryElementProps } from "../../util/element.js";
import { Page } from "../page/Page.js";
import { TreeCards } from "../tree/TreeCards.js";

/** Page renderer for a `tree-directory` element — shows title, description, content, and child cards. */
export function DirectoryPage({ title, name, description, content, children }: DirectoryElementProps): ReactNode {
	return (
		<Page title={title ?? name}>
			{description && <p>{description}</p>}
			{content}
			{children && <TreeCards>{children}</TreeCards>}
		</Page>
	);
}
