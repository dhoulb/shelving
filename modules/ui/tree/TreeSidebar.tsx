import { type ReactNode, useMemo, useState } from "react";
import { filterElements } from "../../util/element.js";
import type { AbsolutePath } from "../../util/path.js";
import { flattenTree, searchTree, type TreeElement } from "../../util/tree.js";
import { Divider } from "../block/Divider.js";
import { TextInput } from "../form/TextInput.js";
import { Menu, MenuItem } from "../menu/Menu.js";
import type { OptionalChildProps } from "../util/index.js";
import { matchMenuElement, TreeMenuMapper } from "./TreeMenu.js";

/**
 * Props for the `TreeSidebar` component — the root tree element plus its URL path.
 *
 * @see https://shelving.cc/ui/TreeSidebarProps
 */
export interface TreeSidebarProps extends OptionalChildProps {
	/** Root element of the tree. */
	readonly tree: TreeElement;
	/** URL path of the root — defaults to `/`. Children are rendered with `path + their.name`. */
	readonly path?: AbsolutePath | undefined;
}

/**
 * Sidebar built from a tree element, in three sections separated by dividers.
 *
 * - **Middle:** a `<TextInput>` search-as-you-type filter.
 * - **Bottom:** the root's children as a `<TreeMenuMapper>` — swapped for a flat ranked list of results (capped at 20) while the search holds a query.
 *
 * Child and result hrefs use each element's canonical `path` (or `joinPath(parent, name)` as a fallback). To customise child renderers wrap in `<TreeMenuMapping mapping={…}>` (same context as `<TreeMenu>`).
 *
 * @kind component
 * @returns The sectioned sidebar — home/index links, a search input, and either the tree menu or search results.
 * @example <TreeSidebar tree={tree} />
 * @see https://shelving.cc/ui/TreeSidebar
 */
export function TreeSidebar({ tree, path = "/", children }: TreeSidebarProps): ReactNode {
	const [query, setQuery] = useState("");
	const trimmed = query.trim();

	// Flatten once so search results carry a canonical `path` (and a unique `key`) for their links (the sidebar sits outside the router's `<TreeProvider>`).
	const root = useMemo(() => flattenTree(tree).get("/") ?? tree, [tree]);
	const results = trimmed ? searchTree(root, trimmed, { limit: 20 }) : null;

	return (
		<>
			<Menu>
				<MenuItem href={path}>Home</MenuItem>
			</Menu>
			{children}
			<Divider />
			<TextInput name="search" title="Search" placeholder="Search…" value={query} onValue={v => setQuery(v ?? "")} />
			<Divider />
			<Menu>
				{results ? (
					results.map(el => (
						<MenuItem key={el.key} href={el.props.path ?? path}>
							{el.props.title ?? el.props.name}
						</MenuItem>
					))
				) : (
					<TreeMenuMapper path={path}>{filterElements(tree.props.children, matchMenuElement)}</TreeMenuMapper>
				)}
			</Menu>
		</>
	);
}
