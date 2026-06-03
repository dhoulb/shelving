import type { ReactNode } from "react";
import type { AbsolutePath } from "../../util/path.js";
import type { FileElementProps } from "../../util/tree.js";
import { Prose } from "../block/Prose.js";
import { Title } from "../block/Title.js";
import { Markup } from "../misc/Markup.js";
import { Page } from "../page/Page.js";
import { TreeCards } from "../tree/TreeCards.js";

interface FilePageProps extends FileElementProps {
	/** Site-root-relative path of this page — threaded down so child cards build correct hrefs. */
	readonly path: AbsolutePath;
}

/** Page renderer for a `tree-file` element — shows title, content, and child code symbols. */
export function FilePage({ path, title, name, description, content, children }: FilePageProps): ReactNode {
	return (
		<Page title={title ?? name} description={description}>
			<Title>{title ?? name}</Title>
			{content && (
				<Prose>
					<Markup>{content}</Markup>
				</Prose>
			)}
			<TreeCards path={path}>{children}</TreeCards>
		</Page>
	);
}
