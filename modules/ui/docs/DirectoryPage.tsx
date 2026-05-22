import type { ReactNode } from "react";
import type { DirectoryElementProps } from "../../util/element.js";
import { matchURLPrefix } from "../../util/url.js";
import { Prose } from "../block/Prose.js";
import { Title } from "../block/Title.js";
import { Markup } from "../misc/Markup.js";
import { requireMeta } from "../misc/MetaContext.js";
import { Page } from "../page/Page.js";
import { TreeCards } from "../tree/TreeCards.js";

/** Page renderer for a `tree-directory` element — shows title, content, and child cards. */
export function DirectoryPage({ title, name, description, content, children }: DirectoryElementProps): ReactNode {
	const { url, root } = requireMeta();
	// Path must be site-root-relative: card hrefs are later resolved against `root`, so including its subfolder here would double it.
	const path = matchURLPrefix(url, root) ?? "/";
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
