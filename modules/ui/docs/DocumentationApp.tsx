import type { ReactElement } from "react";
import { Menu, MenuItem } from "../menu/Menu.js";
import { TreeApp, type TreeAppProps } from "../tree/TreeApp.js";
import { TreeSidebar } from "../tree/TreeSidebar.js";
import { DocumentationSearchPage } from "./DocumentationSearchPage.js";

/**
 * Documentation app.
 * - Build upon `<TreeApp>` to include a `<DocumentationSearchPage>` at its `/search` URL.
 */
export function DocumentationApp({
	tree,
	routes = {
		"/search": DocumentationSearchPage,
	},
	sidebar = (
		<TreeSidebar>
			<Menu>
				<MenuItem href="/search">Search</MenuItem>
			</Menu>
		</TreeSidebar>
	),
	...meta
}: TreeAppProps): ReactElement {
	return <TreeApp tree={tree} routes={routes} sidebar={sidebar} {...meta} />;
}
