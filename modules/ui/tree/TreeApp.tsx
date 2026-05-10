import type { ReactElement } from "react";
import type { Elements } from "../../util/element.js";
import type { AbsolutePath } from "../../util/path.js";
import { App, type AppProps } from "../app/App.js";
import { SidebarLayout } from "../layout/SidebarLayout.js";
import { PageCatcher } from "../misc/Catcher.js";
import { type ElementMapEntries, ElementMapper } from "../misc/ElementMapper.js";
import { Router } from "../router/Router.js";
import type { Routes } from "../router/Routes.js";
import { TreeMenu } from "./TreeMenu.js";
import { TreePage } from "./TreePage.js";

export interface TreeAppProps extends AppProps {
	/** The tree elements to display. */
	elements: Elements;
	/** Element map entries for rendering (merged with defaults). */
	map?: ElementMapEntries | undefined;
	/** Additional routes (merged with the default tree route). */
	routes?: Routes | undefined;
}

const TREE_ROUTE = "/{**path}" as AbsolutePath;

/**
 * Top-level app component for a tree-based documentation site.
 * - Wraps `<App>` with routing, error catching, sidebar layout, and element map.
 * - The sidebar shows a `<TreeMenu>` of top-level elements.
 * - A catch-all route renders `<TreePage>` for any path.
 */
export function TreeApp({ elements, map = {}, routes = {}, children, ...appProps }: TreeAppProps): ReactElement {
	const allRoutes: Routes = {
		...routes,
		[TREE_ROUTE]: params => <TreePage params={params} elements={elements} />,
	};

	return (
		<App {...appProps}>
			<ElementMapper map={map}>
				<Router routes={allRoutes}>
					<PageCatcher>
						<SidebarLayout sidebar={<TreeMenu>{elements}</TreeMenu>}>{children}</SidebarLayout>
					</PageCatcher>
				</Router>
			</ElementMapper>
		</App>
	);
}
