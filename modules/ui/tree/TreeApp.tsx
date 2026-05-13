import type { ReactElement } from "react";
import type { Elements } from "../../util/element.js";
import type { AbsolutePath } from "../../util/path.js";
import { App, type AppProps } from "../app/App.js";
import { SidebarLayout } from "../layout/SidebarLayout.js";
import { PageCatcher } from "../misc/Catcher.js";
import { Router } from "../router/Router.js";
import type { Routes } from "../router/Routes.js";
import { TreeMenu } from "./TreeMenu.js";
import { TreePage } from "./TreePage.js";

export interface TreeAppProps extends AppProps {
	/** The tree elements to display. */
	elements: Elements;
	/** Additional routes (merged with the default tree route). */
	routes?: Routes | undefined;
}

const TREE_ROUTE = "/{**path}" as AbsolutePath;

/**
 * Top-level app component for a tree-based documentation site.
 * - Wraps `<App>` with routing, error catching, and a sidebar layout.
 * - The sidebar shows a `<TreeMenu>` of top-level elements.
 * - A catch-all route renders `<TreePage>` for any path.
 * - Element rendering uses the default mappings on `<TreePage>`, `<TreeMenu>`, `<TreeCards>`.
 *   Override by wrapping with `<TreePageMapping>`, `<TreeMenuMapping>`, or `<TreeCardMapping>`.
 */
export function TreeApp({ elements, routes = {}, children, ...appProps }: TreeAppProps): ReactElement {
	const allRoutes: Routes = {
		...routes,
		[TREE_ROUTE]: props => <TreePage {...props} elements={elements} />,
	};

	return (
		<App {...appProps}>
			<Router routes={allRoutes}>
				<PageCatcher>
					<SidebarLayout sidebar={<TreeMenu>{elements}</TreeMenu>}>{children}</SidebarLayout>
				</PageCatcher>
			</Router>
		</App>
	);
}
