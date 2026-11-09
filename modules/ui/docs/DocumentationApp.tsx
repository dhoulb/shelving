import type { ReactElement } from "react";
import { Menu, MenuItem } from "../menu/Menu.js";
import { TreeApp, type TreeAppProps } from "../tree/TreeApp.js";
import { TreeSidebar } from "../tree/TreeSidebar.js";
import { DocumentationPlaygroundPage } from "./DocumentationPlaygroundPage.js";
import { DocumentationSearchPage } from "./DocumentationSearchPage.js";
import { PLAYGROUND_PAGE_PATH } from "./playground.js";

/**
 * Documentation app.
 * - Build upon `<TreeApp>` to include a `<DocumentationSearchPage>` at its `/search` URL, and a `<DocumentationPlaygroundPage>` at its `/playground` URL.
 */
export function DocumentationApp({
	tree,
	routes = {
		"/search": DocumentationSearchPage,
		[`/${PLAYGROUND_PAGE_PATH}`]: DocumentationPlaygroundPage,
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
	return <TreeApp tree={tree} routes={routes} sidebar={sidebar} {...meta} />;
}
