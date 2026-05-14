import type { ReactElement, ReactNode } from "react";
import type { TreeElement } from "../../util/index.js";
import { App } from "../app/App.js";
import { SidebarLayout } from "../layout/SidebarLayout.js";
import { PageCatcher } from "../misc/Catcher.js";
import { Router } from "../router/Router.js";
import type { Routes } from "../router/Routes.js";
import type { PossibleMeta } from "../util/index.js";
import { TreeMenu } from "./TreeMenu.js";
import { TreePage } from "./TreePage.js";

export interface TreeAppProps extends PossibleMeta {
	/** The tree elements to display. */
	tree: TreeElement;
	/** Additional routes (merged with the default tree route). */
	routes?: Routes | undefined;
	/** Children rendered inside the layout; defaults to a `<Router>` over the tree routes. */
	children?: ReactNode | undefined;
}

/**
 * Top-level app component for a tree-based documentation site.
 * - Wraps `<App>` with error catching and a sidebar layout.
 * - The sidebar shows a `<TreeMenu>` of top-level elements.
 * - `/` renders the root via `<TreePage>`; `/**` catches every deeper path and feeds the full sub-path into `<TreePage>`.
 * - Element rendering uses the default mappings on `<TreePage>`, `<TreeMenu>`, `<TreeCards>`.
 *   Override by wrapping with `<TreePageMapping>`, `<TreeMenuMapping>`, or `<TreeCardMapping>`.
 */
export function TreeApp({ tree, routes = {}, children, ...appProps }: TreeAppProps): ReactElement {
	const allRoutes: Routes = {
		...routes,
		"/": () => <TreePage tree={tree} />,
		// `**` captures the multi-segment remainder under index `"0"` (named placeholders are single-segment only).
		"/**": ({ 0: path = "" }) => <TreePage path={`/${path}`} tree={tree} />,
	};

	return (
		<App {...appProps}>
			<PageCatcher>
				<SidebarLayout sidebar={<TreeMenu tree={tree} />}>{children ?? <Router routes={allRoutes} />}</SidebarLayout>
			</PageCatcher>
		</App>
	);
}
