import type { ReactNode } from "react";
import type { TreeElementProps } from "../../util/tree.js";
import { Block } from "../block/Block.js";
import { Panel } from "../block/Panel.js";
import { Prose } from "../block/Prose.js";
import { Section } from "../block/Section.js";
import { Title } from "../block/Title.js";
import { Markup } from "../misc/Markup.js";
import { Page } from "../page/Page.js";
import { TreeCards } from "../tree/TreeCards.js";

/**
 * Page renderer for the documentation site's home page — a bold coloured hero panel over the module listing.
 * - The whole page sits in a single `color="red"` `<Block>`, so the hero panel, prose, and child cards all pick up the red tint.
 * - The hero is a `<Panel>` with the package name centred as a `<Title>`.
 * - Below the hero it renders any absorbed prose content, then the root's children (the modules) as a stack of cards.
 *
 * @kind component
 * @param props The root tree element props (`title`, `name`, `description`, `content`, `children`).
 * @returns A `<Page>` with a coloured hero panel followed by the module listing.
 * @example <DocumentationHomePage {...root.props} />
 * @see https://dhoulb.github.io/shelving/ui/docs/DocumentationHomePage/DocumentationHomePage
 */
export function DocumentationHomePage({ title, name, description, content, children }: TreeElementProps): ReactNode {
	return (
		<Page title={title ?? name} description={description}>
			<Block color="red">
				<Panel>
					<Title center>{title ?? name}</Title>
				</Panel>
				{content && (
					<Section wide>
						<Prose>
							<Markup>{content}</Markup>
						</Prose>
					</Section>
				)}
				<Section wide>
					<TreeCards>{children}</TreeCards>
				</Section>
			</Block>
		</Page>
	);
}
