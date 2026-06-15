import { type ReactNode, useMemo, useState } from "react";
import type { Query } from "../../util/query.js";
import type { DocumentationElementProps, TreeElementProps } from "../../util/tree.js";
import { searchTree } from "../../util/tree.js";
import { Header, Section } from "../block/Section.js";
import { Title } from "../block/Title.js";
import { DocumentationKindChips } from "../docs/DocumentationKind.js";
import { TextInput } from "../form/TextInput.js";
import { Page } from "../page/Page.js";
import { TreeCards } from "./TreeCards.js";
import { useTreeMap } from "./TreeContext.js";

/** Kinds offered as filter chips, in display order — mirrors `DocumentationPage`'s sections. */
const INDEX_KINDS = ["component", "function", "class", "interface", "type", "constant", "method", "property"];

/** Cap on the flat listing when there's no query — keeps "show everything" sane. */
const INDEX_LIMIT = 100;

/**
 * Page listing every element in the system in one flat, searchable view.
 *
 * - A `<TextInput>` filters as you type; a row of kind chips narrows by `kind` via `searchTree`'s `filter`.
 * - An empty query lists everything (capped at 100); a non-empty query ranks with `searchTree` and caps at 20.
 * - Reads the whole tree from the surrounding `<TreeProvider>` (the flattened map's root), so it works on every page.
 *
 * @kind component
 * @param props The index element's props (`title`, `name`, `description`).
 * @returns A `<Page>` with a search input, kind chips, and a flat card listing of results.
 * @example <TreeIndexPage name="all" title="All elements" />
 * @see https://dhoulb.github.io/shelving/ui/tree/TreeIndexPage/TreeIndexPage
 */
export function TreeIndexPage({ title, name, description }: TreeElementProps): ReactNode {
	const [query, setQuery] = useState("");
	const [chip, setChip] = useState<string | undefined>(undefined);

	const root = useTreeMap().get("/");

	// Kinds actually present anywhere in the tree, in display order, for the chip row.
	const kinds = useMemo(() => {
		if (!root) return [];
		const all = searchTree(root, "", { limit: Number.POSITIVE_INFINITY });
		return INDEX_KINDS.filter(kind => all.some(el => (el.props as DocumentationElementProps).kind === kind));
	}, [root]);

	const trimmed = query.trim();
	const filter = chip ? ({ kind: chip } as Query) : undefined;
	const results = root ? searchTree(root, trimmed, { limit: trimmed ? 20 : INDEX_LIMIT, filter }) : [];
	// Drop the index page itself, and re-key each card by its unique canonical `path` — bare `name` keys collide across the
	// whole tree (many `get`, `value`, `url`, …), and duplicate React keys break list reconciliation as the filter changes.
	const cards = results.filter(el => el.type !== "tree-index").map(el => ({ ...el, key: el.props.path ?? el.key }));

	return (
		<Page title={title ?? name} description={description}>
			<Header wide>
				<Title>{title ?? name}</Title>
			</Header>
			<Section wide>
				<TextInput name="search" title="Search" placeholder="Search…" value={query} onValue={v => setQuery(v ?? "")} />
				<DocumentationKindChips kinds={kinds} value={chip} onValue={setChip} />
			</Section>
			<Section wide>
				<TreeCards>{cards}</TreeCards>
			</Section>
		</Page>
	);
}
