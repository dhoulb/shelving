import type { ReactElement } from "react";
import type { TreeElement } from "../../util/index.js";
import type { AbsolutePath } from "../../util/path.js";
import { App } from "../app/App.js";
import { SidebarLayout } from "../layout/SidebarLayout.js";
import { PageCatcher } from "../misc/Catcher.js";
import { Router, RouterOutput } from "../router/Router.js";
import type { Routes } from "../router/Routes.js";
import type { PossibleMeta } from "../util/index.js";
import { TreeMenu } from "./TreeMenu.js";
import { TreePage } from "./TreePage.js";

export interface TreeAppProps extends PossibleMeta {
	/** The tree elements to display. */
	tree: TreeElement;
	/** Additional routes (merged with the default tree route). */
	routes?: Routes | undefined;
	/** Children is optional and defaults to `<RouterOutput />` */
	children?: ReactElement | undefined;
}

/**
 * Top-level app component for a tree-based documentation site.
 * - Wraps `<App>` with routing, error catching, and a sidebar layout.
 * - The sidebar shows a `<TreeMenu>` of top-level elements.
 * - `/` renders the root via `<TreePage>`; `/**` catches every deeper path and feeds the full sub-path into `<TreePage>`.
 * - Element rendering uses the default mappings on `<TreePage>`, `<TreeMenu>`, `<TreeCards>`.
 *   Override by wrapping with `<TreePageMapping>`, `<TreeMenuMapping>`, or `<TreeCardMapping>`.
 */
export function TreeApp({ tree, routes = {}, children = <RouterOutput />, ...appProps }: TreeAppProps): ReactElement {
	const allRoutes: Routes = {
		...routes,
		"/": () => <TreePage tree={tree} />,
		// `**` captures the multi-segment remainder under index `"0"` (named placeholders are single-segment only).
		"/**": ({ 0: sub }) => <TreePage path={`/${sub ?? ""}` as AbsolutePath} tree={tree} />,
	};

	return (
		<App {...appProps}>
			<Router routes={allRoutes}>
				<PageCatcher>
					<SidebarLayout sidebar={<TreeMenu tree={tree} />}>{children}</SidebarLayout>
				</PageCatcher>
			</Router>
		</App>
	);
}
