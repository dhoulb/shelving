import { type ReactNode, useMemo, useState } from "react";
import { type ImmutableArray, toggleArrayItem } from "../../util/array.js";
import type { Query } from "../../util/query.js";
import type { DocumentationElementProps } from "../../util/tree.js";
import { searchTree } from "../../util/tree.js";
import { Block } from "../block/Block.js";
import { Panel } from "../block/Panel.js";
import { Header, Section } from "../block/Section.js";
import { Title } from "../block/Title.js";
import { CheckboxInput } from "../form/CheckboxInput.js";
import { TextInput } from "../form/TextInput.js";
import { Page } from "../page/Page.js";
import { Row } from "../style/Flex.js";
import { TreeCards } from "../tree/TreeCards.js";
import { useTreeMap } from "../tree/TreeContext.js";
import { DocumentationKind } from "./DocumentationKind.js";

/** Title shown for the index page. */
const TITLE = "Search...";

/** Kinds offered as filter chips, in display order — mirrors `DocumentationPage`'s sections. */
const KINDS = ["module", "component", "function", "class", "interface", "type", "constant", "method", "property"];

/** Cap on the flat listing when there's no query — keeps "show everything" sane. */
const INDEX_LIMIT = 100;

/**
 * Page listing every element in the system in one flat, searchable view.
 *
 * - A `<TextInput>` filters as you type; a row of kind checkboxes narrows by `kind` via `searchTree`'s `filter`.
 * - The kind checkboxes are multi-select — ticking several narrows to a `kind IN […]` filter; ticking none shows every kind.
 * - An empty query lists everything (capped at 100); a non-empty query ranks with `searchTree` and caps at 20.
 * - Reads the whole tree from the surrounding `<TreeProvider>` (the flattened map's root), so it works on every page.
 *
 * @kind component
 * @returns A `<Page>` with a search input, kind checkboxes, and a flat card listing of results.
 * @example <Router routes={{ search: DocumentationSearchPage }} />
 * @see https://shelving.cc/ui/DocumentationSearchPage
 */
export function DocumentationSearchPage(): ReactNode {
	const [query, setQuery] = useState("");
	const [selected, setSelected] = useState<ImmutableArray<string>>([]);

	const root = useTreeMap().get("/");

	// Kinds actually present anywhere in the tree, in display order, for the checkbox row.
	const kinds = useMemo(() => {
		if (!root) return [];
		const all = searchTree(root, "", { limit: Number.POSITIVE_INFINITY });
		return KINDS.filter(kind => all.some(el => (el.props as DocumentationElementProps).kind === kind));
	}, [root]);

	const trimmed = query.trim();
	// Multiple kinds can be ticked at once — an array value decodes to a `kind IN […]` filter.
	const filter = selected.length ? ({ kind: selected } as Query) : undefined;
	// Each element's `key` is its unique canonical path (stamped by `flattenTree()`), so this flat cross-tree listing reconciles correctly.
	const cards = root ? searchTree(root, trimmed, { limit: trimmed ? 20 : INDEX_LIMIT, filter }) : [];

	return (
		<Page title={TITLE}>
			<Panel>
				<Header>
					<Title center>{TITLE}</Title>
				</Header>
				<Section>
					<TextInput name="search" title="Search" placeholder="Search…" value={query} onValue={v => setQuery(v ?? "")} />
					{!!kinds.length && (
						<Row left wrap>
							{kinds.map(kind => (
								<CheckboxInput
									key={kind}
									name={kind}
									width="fit"
									value={selected.includes(kind)}
									onValue={() => setSelected(s => toggleArrayItem(s, kind))}
								>
									<DocumentationKind kind={kind} />
								</CheckboxInput>
							))}
						</Row>
					)}
				</Section>
			</Panel>
			<Block indent="normal" padding="section">
				<Section>
					<TreeCards>{cards}</TreeCards>
				</Section>
			</Block>
		</Page>
	);
}
