import type { ReactNode } from "react";
import type { DocumentationElementProps } from "../../util/element.js";
import type { AbsolutePath } from "../../util/path.js";
import { Definition, Definitions } from "../block/Definitions.js";
import { Flex } from "../block/Flex.js";
import { Heading } from "../block/Heading.js";
import { Preformatted } from "../block/Preformatted.js";
import { Prose } from "../block/Prose.js";
import { Section } from "../block/Section.js";
import { Title } from "../block/Title.js";
import { Code } from "../inline/Code.js";
import { Markup } from "../misc/Markup.js";
import { requireMeta } from "../misc/MetaContext.js";
import { Page } from "../page/Page.js";
import { TreeCards } from "../tree/TreeCards.js";
import { DocumentationKind } from "./DocumentationKind.js";

const DEFAULT_TYPE = "unknown";

/**
 * Page renderer for a `tree-documentation` element.
 * - Renders title, signatures (one per overload), content, parameters, returns, throws, examples, and child symbols.
 * - All sections are conditional — only render when their array has entries.
 */
export function DocumentationPage({
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
}: DocumentationElementProps): ReactNode {
	const { url } = requireMeta();
	const path = (url?.pathname ?? "/") as AbsolutePath;
	return (
		<Page title={title ?? name} description={description}>
			<Title>
				<Flex left>
					{title ?? name}
					{kind && <DocumentationKind kind={kind} />}
				</Flex>
			</Title>
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
			<TreeCards path={path}>{children}</TreeCards>
		</Page>
	);
}
