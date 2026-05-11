import type { ReactElement } from "react";
import type { Elements } from "../../util/element.js";
import type { AbsolutePath } from "../../util/path.js";
import { App, type AppProps } from "../app/App.js";
import { SidebarLayout } from "../layout/SidebarLayout.js";
import { PageCatcher } from "../misc/Catcher.js";
import type { Mapping } from "../misc/Mapper.js";
import { Router } from "../router/Router.js";
import type { Routes } from "../router/Routes.js";
import { TreeCardMapping } from "./TreeCards.js";
import { TreeMenu, TreeMenuMapping } from "./TreeMenu.js";
import { TreePage, TreePageMapping } from "./TreePage.js";

export interface TreeAppProps extends AppProps {
	/** The tree elements to display. */
	elements: Elements;
	/** Element mappings for page rendering. */
	pageMapping?: Mapping | undefined;
	/** Element mappings for menu rendering. */
	menuMapping?: Mapping | undefined;
	/** Element mappings for card rendering. */
	cardMapping?: Mapping | undefined;
	/** Additional routes (merged with the default tree route). */
	routes?: Routes | undefined;
}

const TREE_ROUTE = "/{**path}" as AbsolutePath;

/**
 * Top-level app component for a tree-based documentation site.
 * - Wraps `<App>` with routing, error catching, sidebar layout, and element mappings.
 * - The sidebar shows a `<TreeMenu>` of top-level elements.
 * - A catch-all route renders `<TreePage>` for any path.
 */
export function TreeApp({
	elements,
	pageMapping,
	menuMapping,
	cardMapping,
	routes = {},
	children,
	...appProps
}: TreeAppProps): ReactElement {
	const allRoutes: Routes = {
		...routes,
		[TREE_ROUTE]: props => <TreePage {...props} elements={elements} />,
	};

	return (
		<App {...appProps}>
			<TreePageMapping mapping={pageMapping ?? {}}>
				<TreeMenuMapping mapping={menuMapping ?? {}}>
					<TreeCardMapping mapping={cardMapping ?? {}}>
						<Router routes={allRoutes}>
							<PageCatcher>
								<SidebarLayout sidebar={<TreeMenu>{elements}</TreeMenu>}>{children}</SidebarLayout>
							</PageCatcher>
						</Router>
					</TreeCardMapping>
				</TreeMenuMapping>
			</TreePageMapping>
		</App>
	);
}
