import type { ReactNode } from "react";
import type { FileElementProps } from "../../util/element.js";
import type { AbsolutePath } from "../../util/path.js";
import { Prose } from "../block/Prose.js";
import { Markup } from "../misc/Markup.js";
import { requireMeta } from "../misc/MetaContext.js";
import { Page } from "../page/Page.js";
import { TreeCards } from "../tree/TreeCards.js";

/** Page renderer for a `tree-file` element — shows title, content, and child code symbols. */
export function FilePage({ title, name, description, content, children }: FileElementProps): ReactNode {
	const { url } = requireMeta();
	const path = (url?.pathname ?? "/") as AbsolutePath;
	return (
		<Page title={title ?? name} description={description}>
			{content && (
				<Prose>
					<Markup>{content}</Markup>
				</Prose>
			)}
			<TreeCards path={path}>{children}</TreeCards>
		</Page>
	);
}
