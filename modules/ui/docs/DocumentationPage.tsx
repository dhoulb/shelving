import type { ReactNode } from "react";
import { walkElements } from "../../util/element.js";
import type { DocumentationElementProps, TreeElement } from "../../util/tree.js";
import { Block } from "../block/Block.js";
import { Heading } from "../block/Heading.js";
import { Panel } from "../block/Panel.js";
import { Preformatted } from "../block/Preformatted.js";
import { Prose } from "../block/Prose.js";
import { Row } from "../block/Row.js";
import { Header, Section } from "../block/Section.js";
import { Title } from "../block/Title.js";
import { Page } from "../page/Page.js";
import { TreeBreadcrumbs } from "../tree/TreeBreadcrumbs.js";
import { TreeCards } from "../tree/TreeCards.js";
import { TreeMarkup } from "../tree/TreeMarkup.js";
import { DocumentationButtons } from "./DocumentationButtons.js";
import { DocumentationKind, getDocumentationKindColor } from "./DocumentationKind.js";
import { DocumentationParams } from "./DocumentationParams.js";
import { DocumentationProperties } from "./DocumentationProperties.js";
import { DocumentationReferences } from "./DocumentationReferences.js";
import { DocumentationReturns } from "./DocumentationReturns.js";
import { DocumentationSignatures } from "./DocumentationSignatures.js";
import { DocumentationThrows } from "./DocumentationThrows.js";

/** Documentation `kind`s grouped into card sections, in display order — pluralised, sentence-case headings. Data members (properties) are not child elements — they render as the Properties table instead. */
const KINDS = {
	module: "Modules",
	component: "Components",
	function: "Functions",
	class: "Classes",
	interface: "Interfaces",
	type: "Types",
	constant: "Constants",
	"static method": "Static methods",
	method: "Methods",
};

/**
 * Page renderer for a `tree-documentation` element — the full detail page for a documented symbol.
 * - Renders breadcrumbs, title (with kind + `readonly` tags), relational links (`member of`, `extends`, `implements`), signatures (one per overload), content, parameters, returns, throws, properties, referenced types, and examples.
 * - In the Parameters / Returns / Throws / Properties tables the `Type` column links each type to its documented page via `TreeLink` (exact-match only; compound or builtin types stay plain text), and a row with no hand-written description falls back to the referenced type's own `description`. A default renders as a `Defaults to …` note (linking the value when it's a documented token) rather than in a dedicated column.
 * - A class/interface/object-literal type's data members render as the Properties table (see `DocumentationProperties`); an options-bag parameter whose type resolves to one is flattened into indented child rows from the same structured list.
 * - A `type` alias's referenced type names render as a linked `Type` table, each row carrying the resolved element's `description` (exact-match only).
 * - Child symbols (functions, classes, methods — not data members) are grouped by `kind` into card sections, each under its own heading.
 * - All sections are conditional — only render when they have entries.
 *
 * @kind component
 * @see https://shelving.cc/ui/DocumentationPage
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
	properties,
	types,
	examples,
	children,
	...props
}: DocumentationElementProps): ReactNode {
	const elements = Array.from(walkElements<TreeElement>(children));
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
				<Block indent="normal" padding="section">
					{signatures?.length || params?.length || returns?.length || throws?.length || properties?.length || types?.length ? (
						<Section>
							<DocumentationSignatures signatures={signatures} />
							<DocumentationParams params={params} />
							<DocumentationReturns returns={returns} />
							<DocumentationThrows throws={throws} />
							<DocumentationProperties properties={properties} />
							<DocumentationReferences types={types} />
						</Section>
					) : null}
					{content && (
						<Section>
							<Prose>
								<TreeMarkup>{content}</TreeMarkup>
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
					{elements.length
						? Object.entries(KINDS).map(([kind, label]) => {
								const group = elements.filter(el => (el.props as DocumentationElementProps).kind === kind);
								return group.length ? (
									<Section key={kind}>
										<Heading>{label}</Heading>
										<TreeCards>{group}</TreeCards>
									</Section>
								) : null;
							})
						: null}
				</Block>
			</Block>
		</Page>
	);
}
