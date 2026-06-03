import type { ReactNode } from "react";
import { walkElements } from "../../util/element.js";
import type { AbsolutePath } from "../../util/path.js";
import type { TreeElementProps } from "../../util/tree.js";
import { Prose } from "../block/Prose.js";
import { Title } from "../block/Title.js";
import { Markup } from "../misc/Markup.js";
import { Page } from "../page/Page.js";
import { TreeCards } from "../tree/TreeCards.js";

interface TreePageProps extends TreeElementProps {
	/** Site-root-relative path of this page — threaded down so child cards build correct hrefs. */
	readonly path: AbsolutePath;
}

/**
 * Page renderer for a generic `tree-element` (a directory or file).
 * - Shows the title, any absorbed prose content, and the element's children as a stack of cards.
 * - Child cards cover both nested directories/files and the code symbols of a source file.
 */
export function TreePage({ path, title, name, description, content, children }: TreePageProps): ReactNode {
	const cards = Array.from(walkElements(children));
	return (
		<Page title={title ?? name} description={description}>
			<Title>{title ?? name}</Title>
			{content && (
				<Prose>
					<Markup>{content}</Markup>
				</Prose>
			)}
			{cards.length > 0 && <TreeCards path={path}>{cards}</TreeCards>}
		</Page>
	);
}
