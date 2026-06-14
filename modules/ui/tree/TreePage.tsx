import type { ReactNode } from "react";
import type { TreeElementProps } from "../../util/tree.js";
import { Prose } from "../block/Prose.js";
import { Header, Section } from "../block/Section.js";
import { Title } from "../block/Title.js";
import { Markup } from "../misc/Markup.js";
import { Page } from "../page/Page.js";
import { TreeCards } from "./TreeCards.js";

/**
 * Page renderer for a generic `tree-element` (a directory or file).
 * - Shows the title, any absorbed prose content, and the element's children as a stack of cards.
 * - Child cards cover both nested directories/files and the code symbols of a source file.
 */
export function TreePage({ title, name, description, content, children }: TreeElementProps): ReactNode {
	return (
		<Page title={title ?? name} description={description}>
			<Header wide>
				<Title>{title ?? name}</Title>
			</Header>
			<Section wide>
				{content && (
					<Prose>
						<Markup>{content}</Markup>
					</Prose>
				)}
			</Section>
			<Section wide>
				<TreeCards>{children}</TreeCards>
			</Section>
		</Page>
	);
}
