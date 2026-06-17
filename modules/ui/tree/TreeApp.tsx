import type { ReactElement } from "react";
import type { TreeElement } from "../../util/index.js";
import { App } from "../app/App.js";
import { SidebarLayout } from "../layout/SidebarLayout.js";
import { PageCatcher } from "../misc/Catcher.js";
import { Router } from "../router/Router.js";
import type { Routes } from "../router/Routes.js";
import type { PossibleMeta } from "../util/index.js";
import { TREE_INDEX_PATH, TreeIndexPage } from "./TreeIndexPage.js";
import { TreeRouter } from "./TreeRouter.js";
import { TreeSidebar } from "./TreeSidebar.js";

/**
 * Props for the `TreeApp` component — the tree to render plus optional extra routes and app meta.
 *
 * @see https://dhoulb.github.io/shelving/ui/tree/TreeApp/TreeAppProps
 */
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
 *
 * - Wraps [`<App>`](/ui/App) with error catching and a sidebar layout.
 * - The sidebar shows a [`<TreeSidebar>`](/ui/TreeSidebar) (root as a home link + a menu of its children).
 * - `/` renders the root via [`<TreePage>`](/ui/TreePage); `/**` catches every deeper path and feeds the full sub-path into `<TreePage>`.
 * - URLs that don't match a tree element fall through to a [`<Router>`](/ui/Router) carrying the built-in [`<TreeIndexPage>`](/ui/TreeIndexPage) (`/all`) plus any extra `routes`.
 * - Element rendering uses the default mappings on `<TreePage>`, [`<TreeMenu>`](/ui/TreeMenu), [`<TreeCards>`](/ui/TreeCards).
 *   Override by wrapping with `<TreePageMapping>`, [`<TreeMenuMapping>`](/ui/TreeMenuMapping), or [`<TreeCardMapping>`](/ui/TreeCardMapping).
 *
 * @kind component
 * @returns The configured `<App>` element with sidebar layout and tree routing.
 * @example <TreeApp tree={tree} title="Docs" />
 * @see https://dhoulb.github.io/shelving/ui/tree/TreeApp/TreeApp
 */
export function TreeApp({ tree, routes: extraRoutes, ...meta }: TreeAppProps): ReactElement {
	// URLs that don't resolve to a tree element fall through to this router: the built-in index page plus any extra routes.
	const fallback = <Router routes={{ [TREE_INDEX_PATH]: TreeIndexPage, ...extraRoutes }} />;
	return (
		<App {...meta}>
			<PageCatcher>
				<SidebarLayout sidebar={<TreeSidebar tree={tree} />}>
					<TreeRouter tree={tree} fallback={fallback} />
				</SidebarLayout>
			</PageCatcher>
		</App>
	);
}
