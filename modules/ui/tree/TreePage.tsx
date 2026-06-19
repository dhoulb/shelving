import type { ReactNode } from "react";
import type { TreeElementProps } from "../../util/tree.js";
import { Prose } from "../block/Prose.js";
import { Header, Section } from "../block/Section.js";
import { Title } from "../block/Title.js";
import { Page } from "../page/Page.js";
import { TreeCards } from "./TreeCards.js";
import { TreeMarkup } from "./TreeMarkup.js";

/**
 * Page renderer for a generic `tree-element` (a directory or file).
 *
 * - Shows the title, any absorbed prose content, and the element's children as a stack of cards.
 * - Child cards cover both nested directories/files and the code symbols of a source file.
 *
 * @returns A `<Page>` with the title, prose content, and a stack of child cards.
 * @kind component
 * @example <TreePage {...element.props} />
 * @see https://dhoulb.github.io/shelving/ui/tree/TreePage/TreePage
 */
export function TreePage({ title, name, description, content, children }: TreeElementProps): ReactNode {
	return (
		<Page title={title ?? name} description={description}>
			<Header>
				<Title>{title ?? name}</Title>
			</Header>
			<Section>
				{content && (
					<Prose>
						<TreeMarkup>{content}</TreeMarkup>
					</Prose>
				)}
			</Section>
			<Section>
				<TreeCards>{children}</TreeCards>
			</Section>
		</Page>
	);
}
