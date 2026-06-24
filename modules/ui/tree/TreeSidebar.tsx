import { type ReactNode, useState } from "react";
import { filterElements } from "../../util/element.js";
import { searchTree } from "../../util/tree.js";
import { Divider } from "../block/Divider.js";
import { TextInput } from "../form/TextInput.js";
import { Menu, MenuItem } from "../menu/Menu.js";
import type { OptionalChildProps } from "../util/index.js";
import { useTreeMap } from "./TreeContext.js";
import { matchMenuElement, TreeMenuMapper } from "./TreeMenu.js";

/**
 * Props for the `TreeSidebar` component.
 *
 * @see https://shelving.cc/ui/TreeSidebarProps
 */
export interface TreeSidebarProps extends OptionalChildProps {}

/**
 * Sidebar built from the surrounding tree, in three sections separated by dividers.
 *
 * - **Middle:** a `<TextInput>` search-as-you-type filter.
 * - **Bottom:** the root's children as a `<TreeMenuMapper>` — swapped for a flat ranked list of results (capped at 20) while the search holds a query.
 *
 * Reads the flattened tree from the surrounding `<TreeProvider>` (`useTreeMap().get("/")`), so child and result hrefs use each element's stamped canonical `path`. To customise child renderers wrap in `<TreeMenuMapping mapping={…}>` (same context as `<TreeMenu>`).
 *
 * @kind component
 * @returns The sectioned sidebar — home/index links, a search input, and either the tree menu or search results.
 * @example <TreeSidebar />
 * @see https://shelving.cc/ui/TreeSidebar
 */
export function TreeSidebar({ children }: TreeSidebarProps): ReactNode {
	const [query, setQuery] = useState("");
	const trimmed = query.trim();

	// The flattened root from context — its children (and descendants) already carry their canonical `path` and unique `key`.
	const root = useTreeMap().get("/");
	const results = root && trimmed ? searchTree(root, trimmed, { limit: 20 }) : null;

	return (
		<>
			<Menu>
				<MenuItem href="/">Home</MenuItem>
			</Menu>
			{children}
			<Divider />
			<TextInput name="search" title="Search" placeholder="Search…" value={query} onValue={v => setQuery(v ?? "")} />
			<Divider />
			<Menu>
				{results ? (
					results.map(el => (
						<MenuItem key={el.key} href={el.props.path ?? "/"}>
							{el.props.title ?? el.props.name}
						</MenuItem>
					))
				) : (
					<TreeMenuMapper>{filterElements(root?.props.children, matchMenuElement)}</TreeMenuMapper>
				)}
			</Menu>
		</>
	);
}
