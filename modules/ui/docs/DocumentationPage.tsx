import { Fragment, type ReactNode } from "react";
import { walkElements } from "../../util/element.js";
import type { DocumentationElementProps, TreeElement, TreeElements } from "../../util/tree.js";
import { Block } from "../block/Block.js";
import { Heading } from "../block/Heading.js";
import { Panel } from "../block/Panel.js";
import { Preformatted } from "../block/Preformatted.js";
import { Prose } from "../block/Prose.js";
import { Header, Section } from "../block/Section.js";
import { Table } from "../block/Table.js";
import { TableCell } from "../block/TableCell.js";
import { TableHeader } from "../block/TableHeader.js";
import { Title } from "../block/Title.js";
import { Code } from "../inline/Code.js";
import { Markup } from "../misc/Markup.js";
import { Page } from "../page/Page.js";
import { Row } from "../style/Flex.js";
import { Scroll } from "../style/Scroll.js";
import { TreeBreadcrumbs } from "../tree/TreeBreadcrumbs.js";
import { TreeCards } from "../tree/TreeCards.js";
import { getTreeElement, useTreeMap } from "../tree/TreeContext.js";
import { TreeLink } from "../tree/TreeLink.js";
import { DocumentationButtons } from "./DocumentationButtons.js";
import { DocumentationKind, getDocumentationKindColor } from "./DocumentationKind.js";
import { DocumentationSignatures } from "./DocumentationSignatures.js";

const DEFAULT_TYPE = "unknown";

/** Resolve a table row's description — the manually-written one, falling back to the referenced type's own `description` from the tree map (exact-match only). */
function _getRowDescription(map: ReadonlyMap<string, TreeElement>, type: string, description?: string | undefined): string {
	return description || getTreeElement(map, type)?.props.description || "";
}

/** Documentation `kind`s grouped into card sections, in display order — pluralised, sentence-case headings. */
const KIND_SECTIONS = {
	component: "Components",
	function: "Functions",
	class: "Classes",
	interface: "Interfaces",
	type: "Types",
	constant: "Constants",
	"static method": "Static methods",
	"static property": "Static properties",
	method: "Methods",
	property: "Properties",
};

/** Render a list of tree elements grouped into kind-based card sections, in `KIND_SECTIONS` order. */
function _renderSections(elements: readonly TreeElement[]): ReactNode {
	return Object.entries(KIND_SECTIONS).map(([kind, label]) => {
		const group = elements.filter(el => (el.props as DocumentationElementProps).kind === kind);
		return group.length ? (
			<Section key={kind}>
				<Heading>{label}</Heading>
				<TreeCards>{group}</TreeCards>
			</Section>
		) : null;
	});
}

/**
 * Children listing for a documentation page — this page's child symbols grouped into kind-based card sections.
 *
 * - Renders nothing when the page has no children (e.g. a leaf symbol).
 * - Cross-tree search and kind filtering live on the index page ([`TreeIndexPage`](/ui/TreeIndexPage)), not here.
 *
 * @param props The page's child elements.
 * @returns The grouped card sections, or `null` when there are no children.
 */
function DocumentationChildren({ elements }: { readonly elements?: TreeElements }): ReactNode {
	const childElements = Array.from(walkElements<TreeElement>(elements));

	// No children → nothing to list.
	if (!childElements.length) return null;

	return _renderSections(childElements);
}

/**
 * Page renderer for a `tree-documentation` element — the full detail page for a documented symbol.
 * - Renders breadcrumbs, title (with kind + `readonly` tags), relational links (`member of`, `extends`, `implements`), signatures (one per overload), content, parameters, returns, throws, referenced types, and examples.
 * - In the Parameters / Returns / Throws tables the `Type` column links each type to its documented page via [`TreeLink`](/ui/TreeLink) (exact-match only; compound or builtin types stay plain text), and a row with no hand-written description falls back to the referenced type's own `description`.
 * - An options-bag parameter whose type resolves to a documented interface/object type is flattened into indented child rows (one per property), so readers see the individual fields inline.
 * - A `type` alias's referenced type names render as a linked `Type` table, each row carrying the resolved element's `description` (exact-match only).
 * - Child symbols are grouped by `kind` into card sections (Functions, Classes, Methods, Properties, …), each under its own heading.
 * - All sections are conditional — only render when they have entries.
 *
 * @kind component
 * @returns A [`<Page>`](/ui/Page) containing the symbol's full documentation.
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
	types,
	examples,
	children,
	...props
}: DocumentationElementProps): ReactNode {
	const map = useTreeMap();
	return (
		<Page title={title ?? name} description={description}>
			<Block color={getDocumentationKindColor(kind)}>
				<Panel>
					<Header>
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
				{signatures?.length || params?.length || returns?.length || throws?.length || types?.length ? (
					<Section>
						<DocumentationSignatures signatures={signatures} />
						{params?.length && (
							<Section>
								<Scroll horizontal>
									<Table>
										<thead>
											<tr>
												<TableHeader width="fit">Param</TableHeader>
												<TableHeader width="fit">Type</TableHeader>
												<TableHeader width="fit">Default</TableHeader>
											</tr>
										</thead>
										<tbody>
											{params.map(({ name, type = DEFAULT_TYPE, description, default: def }) => {
												// An options-bag param whose type resolves to a documented interface/object type is flattened into its individual fields as indented child rows.
												const resolved = getTreeElement(map, type)?.props as DocumentationElementProps | undefined;
												return (
													<Fragment key={`${name}-${type}`}>
														<tr>
															<TableCell>
																<Code>{name}</Code>
															</TableCell>
															<TableCell>
																<TreeLink name={type} />
															</TableCell>
															<TableCell>{def ? <Code>{def}</Code> : "-"}</TableCell>
															<TableCell width="20x" grow>
																{description || resolved?.description || ""}
															</TableCell>
														</tr>
														{resolved?.properties?.map(prop => (
															<tr key={`${name}.${prop.name}`}>
																<TableCell>
																	<Code>{`.${prop.name}`}</Code>
																</TableCell>
																<TableCell>
																	<TreeLink name={prop.type ?? DEFAULT_TYPE} />
																</TableCell>
																<TableCell>{prop.default ? <Code>{prop.default}</Code> : "-"}</TableCell>
																<TableCell width="20x" grow>
																	{_getRowDescription(map, prop.type ?? DEFAULT_TYPE, prop.description)}
																</TableCell>
															</tr>
														))}
													</Fragment>
												);
											})}
										</tbody>
									</Table>
								</Scroll>
							</Section>
						)}
						{returns?.length && (
							<Section>
								<Scroll horizontal>
									<Table>
										<thead>
											<tr>
												<TableHeader width="fit">Return</TableHeader>
											</tr>
										</thead>
										<tbody>
											{returns.map(({ type = DEFAULT_TYPE, description }) => (
												<tr key={`${type}-${description}`}>
													<TableCell>
														<TreeLink name={type} />
													</TableCell>
													<TableCell width="20x" grow>
														{_getRowDescription(map, type, description)}
													</TableCell>
												</tr>
											))}
										</tbody>
									</Table>
								</Scroll>
							</Section>
						)}
						{throws?.length && (
							<Section>
								<Scroll horizontal>
									<Table>
										<thead>
											<tr>
												<TableHeader width="fit">Throws</TableHeader>
											</tr>
										</thead>
										<tbody>
											{throws.map(({ type = DEFAULT_TYPE, description }) => (
												<tr key={`${type}-${description}`}>
													<TableCell>
														<TreeLink name={type} />
													</TableCell>
													<TableCell width="20x" grow>
														{_getRowDescription(map, type, description)}
													</TableCell>
												</tr>
											))}
										</tbody>
									</Table>
								</Scroll>
							</Section>
						)}
						{types?.length && (
							<Section>
								<Scroll horizontal>
									<Table>
										<thead>
											<tr>
												<TableHeader width="fit">Type</TableHeader>
											</tr>
										</thead>
										<tbody>
											{types.map(type => (
												<tr key={type}>
													<TableCell>
														<TreeLink name={type} />
													</TableCell>
													<TableCell width="20x" grow>
														{_getRowDescription(map, type)}
													</TableCell>
												</tr>
											))}
										</tbody>
									</Table>
								</Scroll>
							</Section>
						)}
					</Section>
				) : null}
				{content && (
					<Section>
						<Prose>
							<Markup>{content}</Markup>
						</Prose>
					</Section>
				)}
				{examples?.length && (
					<Section>
						<Heading>Examples</Heading>
						{examples.map(({ description }) => (
							<Preformatted key={description}>{description}</Preformatted>
						))}
					</Section>
				)}
				<DocumentationChildren elements={children} />
			</Block>
		</Page>
	);
}
