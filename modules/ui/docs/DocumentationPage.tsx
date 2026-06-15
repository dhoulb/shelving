import { Fragment, type ReactNode, useMemo, useState } from "react";
import { walkElements } from "../../util/element.js";
import type { Query } from "../../util/query.js";
import type { DocumentationElementProps, TreeElement, TreeElements } from "../../util/tree.js";
import { searchTree } from "../../util/tree.js";
import { Block } from "../block/Block.js";
import { Definitions } from "../block/Definitions.js";
import { Heading } from "../block/Heading.js";
import { Label } from "../block/Label.js";
import { Panel } from "../block/Panel.js";
import { Preformatted } from "../block/Preformatted.js";
import { Prose } from "../block/Prose.js";
import { Header, Section } from "../block/Section.js";
import { Title } from "../block/Title.js";
import { CheckboxInput } from "../form/CheckboxInput.js";
import { TextInput } from "../form/TextInput.js";
import { Code } from "../inline/Code.js";
import { Markup } from "../misc/Markup.js";
import { Page } from "../page/Page.js";
import { Row } from "../style/Flex.js";
import { TreeBreadcrumbs } from "../tree/TreeBreadcrumbs.js";
import { TreeCards } from "../tree/TreeCards.js";
import { useTreeMap } from "../tree/TreeContext.js";
import { DocumentationButtons } from "./DocumentationButtons.js";
import { DocumentationKind, DocumentationKindChips, getDocumentationKindColor } from "./DocumentationKind.js";
import { DocumentationSignatures } from "./DocumentationSignatures.js";

const DEFAULT_TYPE = "unknown";

/** Documentation `kind`s grouped into card sections, in display order — pluralised, sentence-case headings. */
const KIND_SECTIONS = {
	component: "Components",
	function: "Functions",
	class: "Classes",
	interface: "Interfaces",
	type: "Types",
	constant: "Constants",
	method: "Methods",
	property: "Properties",
};

/** Render a list of tree elements grouped into kind-based card sections, in `KIND_SECTIONS` order. */
function _renderSections(elements: readonly TreeElement[]): ReactNode {
	return Object.entries(KIND_SECTIONS).map(([kind, label]) => {
		const group = elements.filter(el => (el.props as DocumentationElementProps).kind === kind);
		return group.length ? (
			<Section wide key={kind}>
				<Heading>{label}</Heading>
				<TreeCards>{group}</TreeCards>
			</Section>
		) : null;
	});
}

/**
 * Interactive children listing for a documentation page — search input, scope toggle, kind chips, and grouped cards.
 *
 * - **Checked (default):** searches this page's own `children`. **Unchecked:** searches the whole tree (cards can come from anywhere). Both cap at 20.
 * - The kind chips narrow results to a single `kind` via `searchTree`'s `filter`.
 * - With an empty query and no chip selected, shows the normal grouped listing of `children` — no filtering.
 *
 * @param props The page element's own `kind` (for the "This {kind} only" toggle) and its `children`.
 * @returns The controls plus the grouped card sections.
 */
function DocumentationChildren({ kind, elements }: { readonly kind: string; readonly elements?: TreeElements }): ReactNode {
	const [query, setQuery] = useState("");
	const [selfOnly, setSelfOnly] = useState(true);
	const [chip, setChip] = useState<string | undefined>(undefined);

	const root = useTreeMap().get("/");
	const childElements = useMemo(() => Array.from(walkElements<TreeElement>(elements)), [elements]);

	// Kinds present in this page's children, in section order, for the chip row.
	const kinds = useMemo(
		() => Object.keys(KIND_SECTIONS).filter(k => childElements.some(el => (el.props as DocumentationElementProps).kind === k)),
		[childElements],
	);

	const trimmed = query.trim();
	const active = !!trimmed || !!chip;

	// Inactive → normal grouped listing of this page's children. Active → search the chosen scope, grouped the same way.
	let listing: ReactNode;
	if (!active) {
		listing = _renderSections(childElements);
	} else {
		const scope: TreeElement = selfOnly || !root ? { type: "tree-element", key: "", props: { name: "", children: elements } } : root;
		const filter = chip ? ({ kind: chip } as Query) : undefined;
		listing = _renderSections(searchTree(scope, trimmed, { limit: 20, filter }));
	}

	return (
		<>
			<Section wide>
				<Row left wrap>
					<TextInput name="search" title="Search" placeholder="Search…" value={query} onValue={v => setQuery(v ?? "")} />
					<CheckboxInput name="scope" value={selfOnly} onValue={v => setSelfOnly(!!v)}>{`This ${kind} only`}</CheckboxInput>
				</Row>
				<DocumentationKindChips kinds={kinds} value={chip} onValue={setChip} />
			</Section>
			{listing}
		</>
	);
}

/**
 * Page renderer for a `tree-documentation` element — the full detail page for a documented symbol.
 * - Renders breadcrumbs, title (with kind + `readonly` tags), relational links (`member of`, `extends`, `implements`), signatures (one per overload), content, parameters, returns, throws, and examples.
 * - Child symbols are grouped by `kind` into card sections (Functions, Classes, Methods, Properties, …), each under its own heading.
 * - All sections are conditional — only render when they have entries.
 *
 * @kind component
 * @param props The documentation element's flattened props (`title`, `name`, `kind`, `description`, `content`, `signatures`, `params`, `returns`, `throws`, `examples`, `children`, plus relational metadata).
 * @returns A `<Page>` containing the symbol's full documentation.
 * @example <DocumentationPage {...element.props} />
 * @see https://dhoulb.github.io/shelving/ui/docs/DocumentationPage/DocumentationPage
 */
export function DocumentationPage({
	title,
	name,
	kind = "unknown",
	description,
	content,
	signatures,
	params,
	returns,
	throws,
	examples,
	children,
	...props
}: DocumentationElementProps): ReactNode {
	return (
		<Page title={title ?? name} description={description}>
			<Block color={getDocumentationKindColor(kind)}>
				<Panel>
					<Header wide>
						<TreeBreadcrumbs />
						<Title>
							<Row left wrap>
								{title ?? name}
								{kind && <DocumentationKind kind={kind} size="normal" />}
							</Row>
						</Title>
						<DocumentationButtons {...props} />
					</Header>
				</Panel>
				{signatures?.length || params?.length || returns?.length || throws?.length ? (
					<Section wide>
						<DocumentationSignatures signatures={signatures} />
						{params?.length && (
							<Section wide>
								<Label>Parameters</Label>
								<Definitions>
									{params.map(({ name, type = DEFAULT_TYPE, description = "", optional }) => (
										<Fragment key={`${name}-${type}-${description}`}>
											<dt>
												<Code size="normal">
													{name}
													{optional ? "?" : ""}: {type}
												</Code>
											</dt>
											<dd>{description}</dd>
										</Fragment>
									))}
								</Definitions>
							</Section>
						)}
						{returns?.length && (
							<Section wide>
								<Label>Returns</Label>
								<Definitions>
									{returns.map(({ type = DEFAULT_TYPE, description = "" }) => (
										<Fragment key={`${type}-${description}`}>
											<dt>
												<Code size="normal">{type}</Code>
											</dt>
											<dd>{description}</dd>
										</Fragment>
									))}
								</Definitions>
							</Section>
						)}
						{throws?.length && (
							<Section wide>
								<Label>Throws</Label>
								<Definitions>
									{throws.map(({ type = DEFAULT_TYPE, description = "" }) => (
										<Fragment key={`${type}-${description}`}>
											<dt>
												<Code size="normal">{type}</Code>
											</dt>
											<dd>{description}</dd>
										</Fragment>
									))}
								</Definitions>
							</Section>
						)}
					</Section>
				) : null}
				{content && (
					<Section wide>
						<Prose>
							<Markup>{content}</Markup>
						</Prose>
					</Section>
				)}
				{examples?.length && (
					<Section wide>
						<Heading>Examples</Heading>
						{examples.map(({ description }) => (
							<Preformatted key={description}>{description}</Preformatted>
						))}
					</Section>
				)}
				<DocumentationChildren kind={kind} elements={children} />
			</Block>
		</Page>
	);
}
