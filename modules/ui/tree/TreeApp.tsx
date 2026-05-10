import type { ReactElement } from "react";
import type { Elements } from "../../util/element.js";
import type { AbsolutePath } from "../../util/path.js";
import { App, type AppProps } from "../app/App.js";
import { SidebarLayout } from "../layout/SidebarLayout.js";
import { PageCatcher } from "../misc/Catcher.js";
import { Router } from "../router/Router.js";
import type { Routes } from "../router/Routes.js";
import { ElementContext, type ElementTypes } from "./ElementContext.js";
import { TreeMenu } from "./TreeMenu.js";
import { TreePage } from "./TreePage.js";

export interface TreeAppProps extends AppProps {
	/** The tree elements to display. */
	elements: Elements;
	/** Additional element type renderers (merged with defaults). */
	types?: ElementTypes | undefined;
	/** Additional routes (merged with the default tree route). */
	routes?: Routes | undefined;
}

const TREE_ROUTE = "/{**path}" as AbsolutePath;

/**
 * Top-level app component for a tree-based documentation site.
 * - Wraps `<App>` with routing, error catching, sidebar layout, and element context.
 * - The sidebar shows a `<TreeMenu>` of top-level elements.
 * - A catch-all route renders `<TreePage>` for any path.
 */
export function TreeApp({ elements, types = {}, routes = {}, children, ...appProps }: TreeAppProps): ReactElement {
	const allRoutes: Routes = {
		...routes,
		[TREE_ROUTE]: params => <TreePage params={params} elements={elements} />,
	};

	return (
		<App {...appProps}>
			<ElementContext types={types}>
				<Router routes={allRoutes}>
					<PageCatcher>
						<SidebarLayout sidebar={<TreeMenu>{elements}</TreeMenu>}>{children}</SidebarLayout>
					</PageCatcher>
				</Router>
			</ElementContext>
		</App>
	);
}
