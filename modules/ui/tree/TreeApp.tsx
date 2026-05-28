import type { ReactElement } from "react";
import type { TreeElement } from "../../util/index.js";
import { App } from "../app/App.js";
import { SidebarLayout } from "../layout/SidebarLayout.js";
import { PageCatcher } from "../misc/Catcher.js";
import type { Routes } from "../router/Routes.js";
import type { PossibleMeta } from "../util/index.js";
import { TreeRouter } from "./TreeRouter.js";
import { TreeSidebar } from "./TreeSidebar.js";

export interface TreeAppProps extends PossibleMeta {
	/** The tree elements to display. */
	tree: TreeElement;
	/**
	 * Additional routes.
	 */
	routes?: Routes | undefined;
}

/**
 * Top-level app component for a tree-based documentation site.
 * - Wraps `<App>` with error catching and a sidebar layout.
 * - The sidebar shows a `<TreeSidebar>` (root as a home link + a menu of its children).
 * - `/` renders the root via `<TreePage>`; `/**` catches every deeper path and feeds the full sub-path into `<TreePage>`.
 * - Element rendering uses the default mappings on `<TreePage>`, `<TreeMenu>`, `<TreeCards>`.
 *   Override by wrapping with `<TreePageMapping>`, `<TreeMenuMapping>`, or `<TreeCardMapping>`.
 */
export function TreeApp({ tree, routes: extraRoutes, ...meta }: TreeAppProps): ReactElement {
	return (
		<App {...meta}>
			<PageCatcher>
				<SidebarLayout sidebar={<TreeSidebar tree={tree} />}>
					<TreeRouter tree={tree} />
				</SidebarLayout>
			</PageCatcher>
		</App>
	);
}
