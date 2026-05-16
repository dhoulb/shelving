import type { ReactNode } from "react";
import type { DocumentationElementProps } from "../../util/element.js";
import { Definition, Definitions } from "../block/Definitions.js";
import { Heading } from "../block/Heading.js";
import { Paragraph } from "../block/Paragraph.js";
import { Preformatted } from "../block/Preformatted.js";
import { Section } from "../block/Section.js";
import { Code } from "../inline/Code.js";
import { Page } from "../page/Page.js";
import { TreeCards } from "../tree/TreeCards.js";
import { DocumentationKind } from "./DocumentationKind.js";

const DEFAULT_TYPE = "unknown";

/**
 * Page renderer for a `tree-documentation` element.
 * - Renders title, signatures (one per overload), description, parameters, returns, throws, examples, and child symbols.
 * - All sections are conditional — only render when their array has entries.
 */
export function DocumentationPage({
	title,
	name,
	kind,
	description,
	signatures,
	params,
	returns,
	throws,
	examples,
	children,
}: DocumentationElementProps): ReactNode {
	return (
		<Page title={title ?? name}>
			{kind && <DocumentationKind kind={kind} />}
			{signatures?.map(sig => (
				<Preformatted key={sig}>{sig}</Preformatted>
			))}
			{description && <Paragraph>{description}</Paragraph>}
			{params?.length && (
				<Section>
					<Heading level="2">Parameters</Heading>
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
					<Heading level="2">Returns</Heading>
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
					<Heading level="2">Throws</Heading>
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
					<Heading level="2">Examples</Heading>
					{examples.map(({ description }) => (
						<Preformatted key={description}>{description}</Preformatted>
					))}
				</Section>
			)}
			{children && <TreeCards>{children}</TreeCards>}
		</Page>
	);
}
