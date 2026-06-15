import type { ReactNode } from "react";
import { walkElements } from "../../util/element.js";
import type { DocumentationElementProps, TreeElement, TreeElements } from "../../util/tree.js";
import { Block } from "../block/Block.js";
import { Heading } from "../block/Heading.js";
import { Panel } from "../block/Panel.js";
import { Preformatted } from "../block/Preformatted.js";
import { Prose } from "../block/Prose.js";
import { Header, Section } from "../block/Section.js";
import { Table } from "../block/Table.js";
import { Title } from "../block/Title.js";
import { Code } from "../inline/Code.js";
import { Markup } from "../misc/Markup.js";
import { Page } from "../page/Page.js";
import { Row } from "../style/Flex.js";
import { Scroll } from "../style/Scroll.js";
import { TreeBreadcrumbs } from "../tree/TreeBreadcrumbs.js";
import { TreeCards } from "../tree/TreeCards.js";
import { DocumentationButtons } from "./DocumentationButtons.js";
import { DocumentationKind, getDocumentationKindColor } from "./DocumentationKind.js";
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
 * - Cross-tree search and kind filtering live on the index page (`TreeIndexPage`), not here.
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
				{signatures?.length || params?.length || returns?.length || throws?.length ? (
					<Section>
						<DocumentationSignatures signatures={signatures} />
						{params?.length && (
							<Section>
								<Scroll horizontal>
									<Table>
										<thead>
											<tr>
												<th>Parameter</th>
												<th>Default</th>
												<th>Description</th>
											</tr>
										</thead>
										<tbody>
											{params.map(({ name, type = DEFAULT_TYPE, description = "", optional, default: def }) => (
												<tr key={`${name}-${type}-${description}`}>
													<td>
														<Code size="normal">
															{name}
															{optional ? "?" : ""}: {type}
														</Code>
													</td>
													<td>{def ? <Code size="normal">{def}</Code> : "-"}</td>
													<td>{description}</td>
												</tr>
											))}
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
												<th>Return</th>
												<th>Description</th>
											</tr>
										</thead>
										<tbody>
											{returns.map(({ type = DEFAULT_TYPE, description = "" }) => (
												<tr key={`${type}-${description}`}>
													<td>
														<Code size="normal">{type}</Code>
													</td>
													<td>{description}</td>
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
												<th>Throws</th>
												<th>Description</th>
											</tr>
										</thead>
										<tbody>
											{throws.map(({ type = DEFAULT_TYPE, description = "" }) => (
												<tr key={`${type}-${description}`}>
													<td>
														<Code size="normal">{type}</Code>
													</td>
													<td>{description}</td>
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
