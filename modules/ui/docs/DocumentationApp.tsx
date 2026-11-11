import type { ReactElement } from "react";
import { App } from "../app/App.js";
import { SidebarLayout } from "../layout/SidebarLayout.js";
import { Menu, MenuItem } from "../menu/Menu.js";
import { PageCatcher } from "../misc/Catcher.js";
import { Navigation } from "../router/Navigation.js";
import { Router } from "../router/Router.js";
import type { TreeAppProps } from "../tree/TreeApp.js";
import { TreeProvider } from "../tree/TreeContext.js";
import { TreeRouter } from "../tree/TreeRouter.js";
import { TreeSidebar } from "../tree/TreeSidebar.js";
import { DocumentationPlaygroundPage } from "./DocumentationPlaygroundPage.js";
import { DocumentationSearchPage } from "./DocumentationSearchPage.js";
import { PLAYGROUND_PAGE_PATH } from "./playground.js";

/**
 * Documentation app.
 * - Works like `<TreeApp>`, and adds a `<DocumentationSearchPage>` at its `/search` URL.
 * - Adds a `<DocumentationPlaygroundPage>` at its `/playground` URL. The playground fills the whole window, so it renders outside the `<SidebarLayout>`.
 *
 * @kind component
 * @see https://shelving.cc/ui/DocumentationApp
 */
export function DocumentationApp({
	tree,
	routes = {
		"/search": DocumentationSearchPage,
	},
	sidebar = (
		<TreeSidebar>
			<Menu small>
				<MenuItem href="/search">Search</MenuItem>
				<MenuItem href={`/${PLAYGROUND_PAGE_PATH}`}>Playground</MenuItem>
			</Menu>
		</TreeSidebar>
	),
	...meta
}: TreeAppProps): ReactElement {
	const layout = (
		<SidebarLayout sidebar={sidebar}>
			<TreeRouter fallback={<Router routes={routes} />} />
		</SidebarLayout>
	);
	return (
		<App {...meta}>
			<Navigation>
				<PageCatcher>
					<TreeProvider tree={tree}>
						<Router routes={{ [`/${PLAYGROUND_PAGE_PATH}`]: DocumentationPlaygroundPage }} fallback={layout} />
					</TreeProvider>
				</PageCatcher>
			</Navigation>
		</App>
	);
}
