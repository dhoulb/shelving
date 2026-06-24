import type { ReactElement } from "react";
import type { TreeElement } from "../../util/index.js";
import { App } from "../app/App.js";
import { SidebarLayout } from "../layout/SidebarLayout.js";
import { PageCatcher } from "../misc/Catcher.js";
import { Navigation } from "../router/Navigation.js";
import { Router } from "../router/Router.js";
import type { Routes } from "../router/Routes.js";
import type { PossibleMeta } from "../util/index.js";
import { TreeProvider } from "./TreeContext.js";
import { TreeRouter } from "./TreeRouter.js";
import { TreeSidebar } from "./TreeSidebar.js";

/**
 * Props for the `TreeApp` component — the tree to render plus optional extra routes and app meta.
 *
 * @see https://shelving.cc/ui/TreeAppProps
 */
export interface TreeAppProps extends PossibleMeta {
	/** The tree elements to display. */
	tree: TreeElement;
	/**
	 * Override the sidebar for the tree app.
	 * @default <TreeSidebar />
	 */
	sidebar?: ReactElement | undefined;
	/** Additional routes. */
	routes?: Routes | undefined;
}

/**
 * Top-level app component for a tree-based documentation site.
 *
 * - Wraps `<App>` with error catching and a sidebar layout.
 * - Flattens `tree` once via `<TreeProvider>` wrapping both the sidebar and the router, so everything below shares a single `useTreeMap()` lookup — nothing re-flattens.
 * - The sidebar shows a `<TreeSidebar>` (root as a home link + a menu of its children).
 * - `/` renders the root via `<TreePage>`; `/**` catches every deeper path and feeds the full sub-path into `<TreePage>`.
 * - Element rendering uses the default mappings on `<TreePage>`, `<TreeMenu>`, `<TreeCards>`.
 *   Override by wrapping with `<TreePageMapping>`, `<TreeMenuMapping>`, or `<TreeCardMapping>`.
 *
 * @kind component
 * @returns The configured `<App>` element with sidebar layout and tree routing.
 * @example <TreeApp tree={tree} title="Docs" />
 * @see https://shelving.cc/ui/TreeApp
 */
export function TreeApp({ tree, routes, sidebar = <TreeSidebar />, ...meta }: TreeAppProps): ReactElement {
	const fallback = routes && <Router routes={routes} />;
	return (
		<App {...meta}>
			<Navigation>
				<PageCatcher>
					<TreeProvider tree={tree}>
						<SidebarLayout sidebar={sidebar}>
							<TreeRouter fallback={fallback} />
						</SidebarLayout>
					</TreeProvider>
				</PageCatcher>
			</Navigation>
		</App>
	);
}
