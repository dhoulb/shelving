import { Fragment, type ReactNode } from "react";
import { walkElements } from "../../util/element.js";
import type { DocumentationElementProps, TreeElement, TreeElements } from "../../util/tree.js";
import { Block } from "../block/Block.js";
import { Heading } from "../block/Heading.js";
import { Panel } from "../block/Panel.js";
import { Preformatted } from "../block/Preformatted.js";
import { Prose } from "../block/Prose.js";
import { Header, Section } from "../block/Section.js";
import { Title } from "../block/Title.js";
import { Code } from "../inline/Code.js";
import { Markup } from "../misc/Markup.js";
import { Page } from "../page/Page.js";
import { Row } from "../style/Flex.js";
import { Scroll } from "../style/Scroll.js";
import { Cell } from "../table/Cell.js";
import { Table } from "../table/Table.js";
import { TreeBreadcrumbs } from "../tree/TreeBreadcrumbs.js";
import { TreeCards } from "../tree/TreeCards.js";
import { getTreeElement, useTreeMap } from "../tree/TreeContext.js";
import { TreeLink } from "../tree/TreeLink.js";
import { DocumentationButtons } from "./DocumentationButtons.js";
import { DocumentationKind, getDocumentationKindColor } from "./DocumentationKind.js";
import { DocumentationSignatures } from "./DocumentationSignatures.js";

const DEFAULT_TYPE = "unknown";

/** Indentation prefixed to a flattened sub-property's name so it reads as nested under its parent param. */
const SUBPARAM_INDENT = "\u00A0\u00A0\u00A0\u00A0";

/**
 * Split a type expression on ` | ` into its individual union members.
 * - An `undefined` member is dropped from display and instead flags the value as optional — we often write `| undefined` explicitly (e.g. for `exactOptionalPropertyTypes` or to allow an explicit `undefined` to trigger a default), which reads as noise in the docs.
 * - When nothing but `undefined` is left, the members are kept as-is rather than emptied.
 */
function _splitType(type: string): { readonly members: readonly string[]; readonly optional: boolean } {
	const parts = type
		.split(" | ")
		.map(part => part.trim())
		.filter(Boolean);
	const members = parts.filter(part => part !== "undefined");
	return members.length ? { members, optional: members.length !== parts.length } : { members: parts, optional: false };
}

/** Render a type expression as one linked `Type`-column token per union member, each stacked on its own line (an `undefined` member is dropped — see `_splitType`). */
function _renderType(members: readonly string[]): ReactNode {
	return members.map((member, index) => (
		<Fragment key={member}>
			{index > 0 && <br />}
			<TreeLink name={member} nowrap />
		</Fragment>
	));
}

/** Resolve a table row's description — the manually-written one, falling back to the referenced type's own `description` from the tree map (exact-match only). */
function _getRowDescription(map: ReadonlyMap<string, TreeElement>, type: string, description?: string | undefined): string {
	return description || getTreeElement(map, type)?.props.description || "";
}

/** Render a description string as inline markup (so backticks, emphasis, links, etc. render rather than showing as literal source), or `null` when empty. */
function _renderDescription(description: string): ReactNode {
	return description ? <Markup context="inline">{description}</Markup> : null;
}

/**
 * Render a parameter/property row's description as inline markup, followed by a trailing note on the same line:
 * - `Defaults to …` (linking the value if it's a documented token) when a default exists.
 * - `Required.` when the value has no default and is not optional, for clarity.
 */
function _renderRowDescription(description: string, def: string | undefined, optional: boolean): ReactNode {
	const suffix = def ? (
		<>
			Defaults to <TreeLink name={def} />
		</>
	) : optional ? null : (
		<>Required.</>
	);
	const body = _renderDescription(description);
	return (
		<>
			{body}
			{body && suffix ? " " : null}
			{suffix}
		</>
	);
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
 * - In the Parameters / Returns / Throws tables the `Type` column links each type to its documented page via [`TreeLink`](/ui/TreeLink) (exact-match only; compound or builtin types stay plain text), and a row with no hand-written description falls back to the referenced type's own `description`. A parameter/property default renders as a `Defaults to …` line at the foot of its description cell (linking the value when it's a documented token) rather than in a dedicated column.
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
												<Cell header width="fit">
													Param
												</Cell>
												<Cell header width="fit">
													Type
												</Cell>
												<Cell header width="xxnarrow" grow />
											</tr>
										</thead>
										<tbody>
											{params.map(({ name, type = DEFAULT_TYPE, description, default: def, optional }) => {
												const { members, optional: typeOptional } = _splitType(type);
												// An options-bag param whose (single, concrete) type resolves to a documented interface/object type is flattened into its individual fields as indented child rows.
												const single = members.length === 1 ? members[0] : undefined;
												const resolved = single ? (getTreeElement(map, single)?.props as DocumentationElementProps | undefined) : undefined;
												return (
													<Fragment key={`${name}-${type}`}>
														<tr>
															<td>
																<Code nowrap>{name}</Code>
															</td>
															<td>{_renderType(members)}</td>
															<td>{_renderRowDescription(description || resolved?.description || "", def, !!optional || typeOptional)}</td>
														</tr>
														{resolved?.properties?.map(prop => {
															const { members: propMembers, optional: propTypeOptional } = _splitType(prop.type ?? DEFAULT_TYPE);
															return (
																<tr key={`${name}.${prop.name}`}>
																	<td>
																		{SUBPARAM_INDENT}
																		<Code nowrap>{`.${prop.name}`}</Code>
																	</td>
																	<td>{_renderType(propMembers)}</td>
																	<td>
																		{_renderRowDescription(
																			_getRowDescription(map, propMembers[0] ?? DEFAULT_TYPE, prop.description),
																			prop.default,
																			!!prop.optional || propTypeOptional,
																		)}
																	</td>
																</tr>
															);
														})}
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
												<th>Return</th>
											</tr>
										</thead>
										<tbody>
											{returns.map(({ type = DEFAULT_TYPE, description }) => (
												<tr key={`${type}-${description}`}>
													<td>
														<TreeLink name={type} nowrap />
													</td>
													<td>{_renderDescription(_getRowDescription(map, type, description))}</td>
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
											</tr>
										</thead>
										<tbody>
											{throws.map(({ type = DEFAULT_TYPE, description }) => (
												<tr key={`${type}-${description}`}>
													<td>
														<TreeLink name={type} nowrap />
													</td>
													<td>{_renderDescription(_getRowDescription(map, type, description))}</td>
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
												<th>Type</th>
											</tr>
										</thead>
										<tbody>
											{types.map(type => (
												<tr key={type}>
													<td>
														<TreeLink name={type} />
													</td>
													<td>{_renderDescription(_getRowDescription(map, type))}</td>
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
