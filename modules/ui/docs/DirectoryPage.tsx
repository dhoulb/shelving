import type { ReactNode } from "react";
import type { DirectoryElementProps } from "../../util/element.js";
import { Prose } from "../block/Prose.js";
import { Markup } from "../misc/Markup.js";
import { Page } from "../page/Page.js";
import { TreeCards } from "../tree/TreeCards.js";

/** Page renderer for a `tree-directory` element — shows title, content, and child cards. */
export function DirectoryPage({ title, name, description, content, children }: DirectoryElementProps): ReactNode {
	return (
		<Page title={title ?? name} description={description}>
			{content && (
				<Prose>
					<Markup>{content}</Markup>
				</Prose>
			)}
			<TreeCards>{children}</TreeCards>
		</Page>
	);
}
