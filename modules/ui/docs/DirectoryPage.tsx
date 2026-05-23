import type { ReactNode } from "react";
import { type DirectoryElementProps, walkElements } from "../../util/element.js";
import type { AbsolutePath } from "../../util/path.js";
import { Heading } from "../block/Heading.js";
import { Prose } from "../block/Prose.js";
import { Title } from "../block/Title.js";
import { Markup } from "../misc/Markup.js";
import { Page } from "../page/Page.js";
import { TreeCards } from "../tree/TreeCards.js";

interface DirectoryPageProps extends DirectoryElementProps {
	/** Site-root-relative path of this page — threaded down so child cards build correct hrefs. */
	readonly path: AbsolutePath;
}

/** Page renderer for a `tree-directory` element — shows title, content, and child cards. */
export function DirectoryPage({ path, title, name, description, content, children }: DirectoryPageProps): ReactNode {
	const cards = Array.from(walkElements(children));
	return (
		<Page title={title ?? name} description={description}>
			<Title>{title ?? name}</Title>
			{content && (
				<Prose>
					<Markup>{content}</Markup>
				</Prose>
			)}
			{cards.length > 0 && (
				<>
					<Heading>Modules</Heading>
					<TreeCards path={path}>{cards}</TreeCards>
				</>
			)}
		</Page>
	);
}
