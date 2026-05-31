import type { ReactNode } from "react";
import { type DocumentationElementProps, type Element, queryElements, type TreeElement } from "../../util/element.js";
import type { AbsolutePath } from "../../util/path.js";
import type { Query } from "../../util/query.js";
import { Section } from "../block/Block.js";
import { Definition, Definitions } from "../block/Definitions.js";
import { Heading } from "../block/Heading.js";
import { Preformatted } from "../block/Preformatted.js";
import { Prose } from "../block/Prose.js";
import { Title } from "../block/Title.js";
import { Code } from "../inline/Code.js";
import { Markup } from "../misc/Markup.js";
import { Tag } from "../misc/Tag.js";
import { Page } from "../page/Page.js";
import { Flex } from "../style/Flex.js";
import { TreeCards } from "../tree/TreeCards.js";
import { DocumentationBreadcrumbs } from "./DocumentationBreadcrumbs.js";
import { DocumentationButtons } from "./DocumentationButtons.js";
import { DocumentationKind } from "./DocumentationKind.js";

const DEFAULT_TYPE = "unknown";

/** Documentation `kind`s grouped into card sections, in display order — pluralised, sentence-case headings. */
const KIND_SECTIONS: ReadonlyArray<readonly [kind: string, label: string]> = [
	["function", "Functions"],
	["class", "Classes"],
	["interface", "Interfaces"],
	["type", "Types"],
	["constant", "Constants"],
	["method", "Methods"],
	["property", "Properties"],
];

interface DocumentationPageProps extends DocumentationElementProps {
	/** Site-root-relative path of this page — threaded down so child cards build correct hrefs. */
	readonly path: AbsolutePath;
}

/**
 * Page renderer for a `tree-documentation` element (also used for `tree-file` elements, whose props are a compatible subset).
 * - Renders breadcrumbs, title (with kind + `readonly` tags), relational links (`member of`, `extends`, `implements`, `overrides`), signatures (one per overload), content, parameters, returns, throws, and examples.
 * - Child symbols are grouped by `kind` into card sections (Functions, Classes, Methods, Properties, …), each under its own heading.
 * - All sections are conditional — only render when they have entries.
 */
export function DocumentationPage({
	path,
	title,
	name,
	kind,
	description,
	content,
	signatures,
	params,
	returns,
	throws,
	examples,
	children,
	readonly,
	...props
}: DocumentationPageProps): ReactNode {
	return (
		<Page title={title ?? name} description={description}>
			<DocumentationBreadcrumbs path={path} />
			<Title>
				<Flex left wrap>
					{title ?? name}
					{kind && <DocumentationKind kind={kind} />}
					{readonly && <Tag yellow>readonly</Tag>}
				</Flex>
			</Title>
			<DocumentationButtons {...props} />
			{signatures?.map(sig => (
				<Preformatted key={sig}>{sig}</Preformatted>
			))}
			{content && (
				<Prose>
					<Markup>{content}</Markup>
				</Prose>
			)}
			{params?.length && (
				<Section>
					<Heading>Parameters</Heading>
					<Definitions row>
						{params.map(({ name, type = DEFAULT_TYPE, description = "", optional }) => (
							<Definition
								key={`${name}-${type}-${description}`}
								term={
									<>
										<Code>{name}</Code>: <Code>{type}</Code>
										{optional && <> (optional)</>}
									</>
								}
							>
								{description}
							</Definition>
						))}
					</Definitions>
				</Section>
			)}
			{returns?.length && (
				<Section>
					<Heading>Returns</Heading>
					<Definitions row>
						{returns.map(({ type = DEFAULT_TYPE, description = "" }) => (
							<Definition key={`${type}-${description}`} term={<Code>{type}</Code>}>
								{description}
							</Definition>
						))}
					</Definitions>
				</Section>
			)}
			{throws?.length && (
				<Section>
					<Heading>Throws</Heading>
					<Definitions row>
						{throws.map(({ type = DEFAULT_TYPE, description = "" }) => (
							<Definition key={`${type}-${description}`} term={<Code>{type}</Code>}>
								{description}
							</Definition>
						))}
					</Definitions>
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
			{KIND_SECTIONS.map(([kind, label]) => {
				// Pre-filter the children for this kind; only render the section when it has cards.
				const group = Array.from(queryElements(children, { "props.kind": kind } as Query<Element>)) as TreeElement[];
				return group.length ? (
					<Section key={kind}>
						<Heading>{label}</Heading>
						<TreeCards path={path}>{group}</TreeCards>
					</Section>
				) : null;
			})}
		</Page>
	);
}
