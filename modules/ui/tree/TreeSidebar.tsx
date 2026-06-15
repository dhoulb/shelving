import { type ReactNode, useMemo, useState } from "react";
import { filterElements } from "../../util/element.js";
import { type AbsolutePath, joinPath } from "../../util/path.js";
import { flattenTree, searchTree, type TreeElement } from "../../util/tree.js";
import { TextInput } from "../form/TextInput.js";
import { Menu, MenuItem } from "../menu/Menu.js";
import { matchMenuElement, TreeMenuMapper } from "./TreeMenu.js";

/**
 * Props for the `TreeSidebar` component — the root tree element plus its URL path.
 *
 * @see https://dhoulb.github.io/shelving/ui/tree/TreeSidebar/TreeSidebarProps
 */
export interface TreeSidebarProps {
	/** Root element of the tree. */
	readonly tree: TreeElement;
	/** URL path of the root — defaults to `/`. Children are rendered with `path + their.name`. */
	readonly path?: AbsolutePath | undefined;
}

/**
 * Sidebar built from a tree element, with a search-as-you-type filter at the top.
 *
 * - A `<TextInput>` sits above the menu. While it holds a query the tree menu is swapped for a flat ranked list of results (capped at 20); an empty query falls through to the normal menu.
 * - Renders a "home" `<MenuItem>` for the root element and an "all elements" link to the `<TreeIndex>` page, then the root's children as a `<TreeMenuMapper>` underneath.
 * - The home link uses `path` as its href (defaulting to `/`). Child and result hrefs use each element's canonical `path` (or `joinPath(parent, name)` as a fallback).
 * - To customise child renderers wrap in `<TreeMenuMapping mapping={…}>` (same context as `<TreeMenu>`).
 *
 * @kind component
 * @param props The root `tree` element and optional root `path`.
 * @returns A search input plus a `<Menu>` with home/all links and either the root's children or a flat list of search results.
 * @example <TreeSidebar tree={tree} />
 * @see https://dhoulb.github.io/shelving/ui/tree/TreeSidebar/TreeSidebar
 */
export function TreeSidebar({ tree, path = "/" as AbsolutePath }: TreeSidebarProps): ReactNode {
	const [query, setQuery] = useState("");
	const trimmed = query.trim();

	// Flatten once so search results carry a canonical `path` for their hrefs (the sidebar sits outside the router's `<TreeProvider>`).
	const root = useMemo(() => flattenTree(tree).get("/") ?? tree, [tree]);
	const results = trimmed ? searchTree(root, trimmed, { limit: 20 }) : null;

	return (
		<>
			<TextInput name="search" title="Search" placeholder="Search…" value={query} onValue={v => setQuery(v ?? "")} />
			<Menu>
				<MenuItem href={path}>{tree.props.title ?? tree.props.name}</MenuItem>
				<MenuItem href={joinPath(path, "all")}>All elements</MenuItem>
				{results ? (
					results.map(el => (
						<MenuItem key={el.props.path ?? el.props.name} href={el.props.path ?? joinPath(path, el.props.name)}>
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
