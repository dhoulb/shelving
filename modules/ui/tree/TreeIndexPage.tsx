import { type ReactNode, useMemo, useState } from "react";
import { type ImmutableArray, toggleArrayItem } from "../../util/array.js";
import type { AbsolutePath } from "../../util/path.js";
import type { Query } from "../../util/query.js";
import type { DocumentationElementProps } from "../../util/tree.js";
import { searchTree } from "../../util/tree.js";
import { Header, Section } from "../block/Section.js";
import { Title } from "../block/Title.js";
import { DocumentationKind } from "../docs/DocumentationKind.js";
import { CheckboxInput } from "../form/CheckboxInput.js";
import { TextInput } from "../form/TextInput.js";
import { Page } from "../page/Page.js";
import { Row } from "../style/Flex.js";
import { TreeCards } from "./TreeCards.js";
import { useTreeMap } from "./TreeContext.js";

/** Canonical URL path of the `TreeIndexPage`, wired as a `<TreeApp>` fallback route. */
export const TREE_INDEX_PATH = "/all" as AbsolutePath;

/** Title shown for the index page. */
const INDEX_TITLE = "All elements";

/** Description shown for the index page (page `<meta>` description). */
const INDEX_DESCRIPTION = "Search every documented element in the system.";

/** Kinds offered as filter chips, in display order — mirrors `DocumentationPage`'s sections. */
const INDEX_KINDS = ["component", "function", "class", "interface", "type", "constant", "method", "property"];

/** Cap on the flat listing when there's no query — keeps "show everything" sane. */
const INDEX_LIMIT = 100;

/**
 * Page listing every element in the system in one flat, searchable view.
 *
 * - A `<TextInput>` filters as you type; a row of kind checkboxes narrows by `kind` via `searchTree`'s `filter`.
 * - The kind checkboxes are multi-select — ticking several narrows to a `kind IN […]` filter; ticking none shows every kind.
 * - An empty query lists everything (capped at 100); a non-empty query ranks with `searchTree` and caps at 20.
 * - Reads the whole tree from the surrounding `<TreeProvider>` (the flattened map's root), so it works on every page.
 * - Wired as a `<TreeApp>` fallback route at `TREE_INDEX_PATH` (`/all`) — it's not a node in the tree.
 *
 * @kind component
 * @returns A `<Page>` with a search input, kind checkboxes, and a flat card listing of results.
 * @example <Router routes={{ [TREE_INDEX_PATH]: TreeIndexPage }} />
 * @see https://dhoulb.github.io/shelving/ui/tree/TreeIndexPage/TreeIndexPage
 */
export function TreeIndexPage(): ReactNode {
	const [query, setQuery] = useState("");
	const [selected, setSelected] = useState<ImmutableArray<string>>([]);

	const root = useTreeMap().get("/");

	// Kinds actually present anywhere in the tree, in display order, for the checkbox row.
	const kinds = useMemo(() => {
		if (!root) return [];
		const all = searchTree(root, "", { limit: Number.POSITIVE_INFINITY });
		return INDEX_KINDS.filter(kind => all.some(el => (el.props as DocumentationElementProps).kind === kind));
	}, [root]);

	const trimmed = query.trim();
	// Multiple kinds can be ticked at once — an array value decodes to a `kind IN […]` filter.
	const filter = selected.length ? ({ kind: selected } as Query) : undefined;
	// Each element's `key` is its unique canonical path (stamped by `flattenTree()`), so this flat cross-tree listing reconciles correctly.
	const cards = root ? searchTree(root, trimmed, { limit: trimmed ? 20 : INDEX_LIMIT, filter }) : [];

	return (
		<Page title={INDEX_TITLE} description={INDEX_DESCRIPTION}>
			<Header wide>
				<Title>{INDEX_TITLE}</Title>
			</Header>
			<Section wide>
				<TextInput name="search" title="Search" placeholder="Search…" value={query} onValue={v => setQuery(v ?? "")} />
				{!!kinds.length && (
					<Row left wrap>
						{kinds.map(kind => (
							<CheckboxInput
								key={kind}
								name={kind}
								fit
								value={selected.includes(kind)}
								onValue={() => setSelected(s => toggleArrayItem(s, kind))}
							>
								<DocumentationKind kind={kind} />
							</CheckboxInput>
						))}
					</Row>
				)}
			</Section>
			<Section wide>
				<TreeCards>{cards}</TreeCards>
			</Section>
		</Page>
	);
}
